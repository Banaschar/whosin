import {apList, roomList, setTransparency, hideGeometry} from "./geometry";
import {SphereGeometry, MeshBasicMaterial, Mesh, Vector3, Color} from "three";
import {scenePers} from "./sceneHandler";
import * as AccessPoints from './apData';
import * as DataHandler from './dataHandler';
import * as Chartist from "chartist";
import "../css/chartist.min.css";
import "../css/style.css";

var _colorMap = false;
var _pillarMap = false;
var _apSphere = false;
var _sphereList = [];
var _currentFloor = 'None';
var _currentTime = 'None';
var _lastFloor = 'None';
var _lastPillar = {};

function apSphere() {
    _apSphere = !_apSphere;
    if (_apSphere) {

        // Create spheres if not yet created
        if (_sphereList.length === 0) {
            // Create sphere
            var spGeo = new SphereGeometry(5, 32, 32);
            var spMat = new MeshBasicMaterial( {color: 0xffff00, transparent: false, opacity: 0.9});
            var sphere = new Mesh(spGeo, spMat);
        
            // Get World coordinates of access point
            for (var key in apList) {
                var pos = new Vector3();
                pos.subVectors(apList[key].geometry.boundingBox.max, 
                                apList[key].geometry.boundingBox.min);
                pos.multiplyScalar(0.5);
                pos.add(apList[key].geometry.boundingBox.min);
                pos.applyMatrix4(apList[key].matrixWorld);

                var tmp = sphere.clone()
                tmp.position.set(pos.x, pos.y, pos.z);
                _sphereList.push(tmp);
            }

        }
        /*
        makeTransparent('Material8', 0.6);
        makeTransparent('Material12', 0.6);
        makeTransparent('Material6', 0.6);
        makeTransparent('Material3', 0.4);
        makeTransparent('Material4', 0.4);
        */
        makeTransparent('all', 0.6);

        for (var item of _sphereList) {
            scenePers.add(item);
        }
        

    } else {

        makeTransparent('all', 1.0);

        for (item of _sphereList) {
            scenePers.remove(item);
        }
    }
}

/*
    Other color map
*/
function _getColor(room) {
    var colors = [0xffffb2, 0xfecc5c, 0xfd8d3c, 0xf03b20, 0xbd0026];
    var num = DataHandler.getNormalized(_currentTime, AccessPoints.roomAp[room]);
    num *= 4;
    num = Math.floor(num);
    return colors[num];
}

/*
    Get color between green and red
    Visualization._currentTime][AccessPoints.roomAp[room]

function _getColor(room) {
    var hue = ((1 - DataHandler.getNormalized(_currentTime, AccessPoints.roomAp[room])) * 120).toString(10);
    return ["hsl(",hue,",100%,50%)"].join("");
}
*/

/*
    Problems: If the room material is set to transparent, it's not showing through
    the outer wall. That's likely because of render order with two transparent
    objects in a row and one redered first.
    material.alphaTest has to be larger/smaller than opacity
*/
function colorMap() {
    _colorMap = !_colorMap;

    function __applyColor(floor, room) {
        roomList[floor][room].material.transparent = false;
        roomList[floor][room].material.color = new Color(_getColor(room));
        roomList[floor][room].material.needsUpdate = true;
    }

    if (_colorMap) {
        
        var _floor = _currentFloor;
        if (_floor === 'None') {
            for (var floorKey in roomList) {
                for (var roomKey in roomList[floorKey]) {
                    __applyColor(floorKey, roomKey);
                }
            }

        } else {
            for (var roomKey in roomList[_floor]) {
                __applyColor(_floor, roomKey);
            }
        }

    } else {
        for (var floor in roomList) {
            for (var key in roomList[floor]) {
                roomList[floor][key].material.color = new Color({r: 0.65098, g: 0.709804, b: 0.886275});
                roomList[floor][key].material.opacity = 0.38;
                roomList[floor][key].material.transparent = true;
                roomList[floor][key].material.needsUpdate = true;
            }
        }
    }
}

/*
    TODO: Refactor scale implementation
*/
function pillarMap() {

    _pillarMap = !_pillarMap;

    function __createPillar(floor, room, scale) {
        roomList[floor][room].scale.set(1, 1, scale);
        var height = roomList[floor][room].geometry.boundingBox.max.z -
                        roomList[floor][room].geometry.boundingBox.min.z;
        var middle = (roomList[floor][room].geometry.boundingBox.max.z +
                        roomList[floor][room].geometry.boundingBox.min.z) / 2;
        //console.log("ROOM: " + room + ". Height: " + height + ". Middle: " + middle);
        //Geometry.roomList[floor][room].translateZ(((height * scale) - height) / 2 - (middle * scale - middle));
        roomList[floor][room].position.z += (((height * scale) - height) / 2 - (middle * scale - middle));
    }

    if (_pillarMap) {
        _lastPillar = {};
        var _floor = _currentFloor;
        _lastFloor = _floor;
        if (_floor === 'None') {
            console.log("Can't print PillarMap without floor selected")

        } else {
            for (var roomKey in roomList[_floor]) {
                var scale = 1 + DataHandler.getNormalized(_currentTime, AccessPoints.roomAp[roomKey]) * 2;
                // Necessary to reverse scaling
                _lastPillar[roomKey] = scale;

                __createPillar(_floor, roomKey, scale);
            }
        }
    } else {
        for (var roomKey in _lastPillar) {
            var scale = _lastPillar[roomKey];
            roomList[_lastFloor][roomKey].scale.set(1, 1, 1);
            roomList[_lastFloor][roomKey].geometry.computeBoundingBox();
            var height = roomList[_lastFloor][roomKey].geometry.boundingBox.max.z -
                            roomList[_lastFloor][roomKey].geometry.boundingBox.min.z;
            var middle = (roomList[_lastFloor][roomKey].geometry.boundingBox.max.z +
                            roomList[_lastFloor][roomKey].geometry.boundingBox.min.z) / 2;
            //console.log("ROOM: " + roomKey + ". Height: " + height + ". Middle: " + middle);
            roomList[_lastFloor][roomKey].position.z -= (((height * scale) - height) / 2 - (middle * scale - middle));
        }
        
    }   

}

function displayGraph() {
    var graphDiv = document.createElement("div");
    graphDiv.setAttribute("id", "barGraph");
    // add in style.css to make globally available and define only once
    //graphDiv.style.cssText = 'position:fixed;bottom:0;left:0;right:0;width:400;height:400'
    graphDiv.classList.add('graph');
    document.body.appendChild(graphDiv);
    new Chartist.Bar('#barGraph', {
        labels: ['Room1', 'Room2'],
        series: [
            [10, 20],
            [3, 12]
        ]
    }, {
        seriesBarDistance: 30
    });
}

function makeTransparent(arg, opac) {
    var _material = [];
    switch (arg) {
        case 'wall': 
            _material = ['Material3', 'Material4'];
            setTransparency(_material, opac);
            break;

        case 'all':
            setTransparency(_material, opac);
            break;

        default:
            setTransparency(_material, opac);
    }
}

function hideFloors() {
    if (_currentFloor in roomList) {
        hideGeometry(roomList[_currentFloor][Object.keys(roomList[_currentFloor])[0]].geometry.boundingBox.max.z);
    } else {
        hideGeometry(0);
    }
}

function setCurrentFloor(f) {
    _currentFloor = f;
}

function setCurrentTime(t) {
    _currentTime = t;
}

export {colorMap, pillarMap, apSphere, 
        setCurrentFloor, setCurrentTime, hideFloors, makeTransparent, displayGraph}