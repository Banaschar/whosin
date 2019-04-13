import {apList, roomList, setTransparency, hideGeometry,
        moveGeometry, roomListString} from "./geometry";
import {SphereGeometry, MeshBasicMaterial, Mesh, Vector3, Color, 
        MeshNormalMaterial, CubeGeometry, CanvasTexture,
        SpriteMaterial, Sprite, Geometry, Line, LineBasicMaterial,
        Texture, DoubleSide, PlaneGeometry} from "three";
import {scenePers, cameraPers, renderer, sceneOrtho} from "./sceneHandler";
import {statusMessage} from "./eventHandler"

import * as Conf from './conf';
import * as DataHandler from './dataHandler';
import * as Chartist from "chartist";
import "../css/chartist.min.css";
import "../css/style.css";
import {Lut} from 'three/examples/js/math/Lut';

var _colorMap = false;
var _pillarMap = false;
var _apSphere = false;
var _graph = false;
var _sphereList = [];
var _lastFloor = 'None';
var _lastPillar = {};
var _lut;
var _legendSprite;
var _updateQueue = [];
var _tmpPillarGeometry = [];
var _graphDiv;
var _colorList;

/* Predefine list of colors, assigned to access points at runtime */
var _apColorList = [0xd11141, 0x00b159, 0x00aedb, 0xf37735];
var _colorMapAP = {};

function createLegend(container) {

    function __createListEle(color, text) {
        var li = document.createElement('li');
        var sp = document.createElement('SPAN');
        sp.style.background = color;
        li.innerHTML = text;
        li.appendChild(sp);
        return li;
    }

    var legend = document.createElement('div');
    legend.setAttribute('class', 'my-legend');
    var title = document.createElement('div');
    title.setAttribute('class', 'legend-title');
    title.innerHTML = 'Average Room usage in percent of capacity';
    var scale = document.createElement('div');
    scale.setAttribute('class', 'legend-scale');

    var list = document.createElement('ul');
    list.setAttribute('class', 'legend-labels');
    var step = 100 / _colorList.length;
    for (var i = 0; i < _colorList.length; i++) {
        //var color = '#' + ('000000'+(_colorList[i]).toString(16)).substr(-6);
        var color = _getCSScolor(_colorList[i]);
        list.appendChild(__createListEle(color, ''+(i+1)*step+'%'))
    }
    scale.appendChild(list);
    legend.appendChild(title);
    legend.appendChild(scale);
    container.appendChild(legend);
}


function initColorMap(container) {
    try {
        _colorList = Conf.getColors().map(function (x) {return parseInt(x, 16)});
    }
    catch(err) {
        statusMessage('Malformed Color Map', 'error');
    }
    createLegend(container);
}

/* Called when new building model is loaded */
function updateAPcolorMap() {
    var i = 0;
    for (var key in apList) {
        /* No more predifend colors, create randoms */
        if (i === _apColorList.length) {
            _colorMapAP[key] = ('000000'+(Math.random()*(1<<24)|0).toString(16)).slice(-6)
        } else {
            _colorMapAP[key] = _apColorList[i];
        }
        i++;
    }
}

function apSphere() {
    _apSphere = !_apSphere;
    function __appColor(floor, room) {
        roomList[floor][room].material.transparent = false;
        roomList[floor][room].material.color = new Color(_colorMapAP[Conf.getRoomAp(room)]);
        roomList[floor][room].material.needsUpdate = true;
    }
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

        for (var floorKey in roomList) {
                for (var roomKey in roomList[floorKey]) {
                    __appColor(floorKey, roomKey);
                }
            }

        /*
        makeTransparent('Material8', 0.6);
        makeTransparent('Material12', 0.6);
        makeTransparent('Material6', 0.6);
        makeTransparent('Material3', 0.4);
        makeTransparent('Material4', 0.4);
        */
        makeTransparent('all', 0.2);

        for (var item of _sphereList) {
            scenePers.add(item);
        }
        

    } else {

        makeTransparent('all', 1.0);

        for (var item of _sphereList) {
            scenePers.remove(item);
        }
    }
}

function _getCSScolor(color) {
    return '#' + ('000000'+(color).toString(16)).substr(-6);
}

function _getColorValue(perc) {
    if (perc < 100) {
        return _colorList[Math.floor(perc / (100 / _colorList.length))]
    } else {
        return _colorList[_colorList.length - 1];
    }
}

function _getColor(type, value, room) {
    var perc = DataHandler.getNormalized(type, value, room) * 100;
    return _getColorValue(perc);
}


/*
    Problems: If the room material is set to transparent, it's not showing through
    the outer wall. That's likely because of render order with two transparent
    objects in a row and one redered first.
    material.alphaTest has to be larger/smaller than opacity
*/
function colorMap(type, value, floor) {
    //_colorMap = !_colorMap;
    _colorMap = true;

    function __applyColor(floor, room) {
        roomList[floor][room].material.transparent = false;
        roomList[floor][room].material.color = new Color(_getColor(type, value, room));
        //console.log(roomList[floor][room].material);
        //roomList[floor][room].material.color.setHex(_getColor(room));
        roomList[floor][room].material.needsUpdate = true;
    }

    if (_colorMap) {
        if (floor === 'None') {
            for (var floorKey in roomList) {
                for (var roomKey in roomList[floorKey]) {
                    __applyColor(floorKey, roomKey);
                }
            }

        } else {
            for (var roomKey in roomList[floor]) {
                __applyColor(floor, roomKey);
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
    TODO: Refactor scale implementation, use sub/multiply scalar etc.
    THE Z coordinate for all rooms of a floor is the same!!!!
    So I need to compute it only once, for gods sake!!!
*/
function pillarMap(type, value, floor) {

    _pillarMap = !_pillarMap;

    /*
    var can = document.createElement('canvas');
    can.width = 100;
    can.height = 20;
    var ctx = can.getContext('2d');
    ctx.fillStyle = '#f00';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = 'bold 150px';
    */

    function __removeLines() {
        for (var ele of _tmpPillarGeometry) {
            scenePers.remove(ele);
        }
    }

    function __createLine(floor, room) {
        var coord = new Vector3();
        coord.copy(roomList[floor][room].geometry.boundingBox.max);
        var lineMat = new LineBasicMaterial({
            color: 0xffffff,
            linewidth: 1
        });
        var geo = new Geometry();
        geo.vertices.push(
            new Vector3(0, 0, 0),
            new Vector3(0, 20, 0),
            new Vector3(20, 25, 20));
        var line = new Line(geo, lineMat)
        scenePers.add(line);
        console.log('Coord: ' + coord.x + ', ' + coord.y + ', ' + coord.z);
        line.position.set(coord.x, coord.z, coord.y);

        // create text on line
        ctx.fillText(room, can.width / 2, can.height / 2);
        var texture = new Texture(can)
        texture.needsUpdate = true;
        var mat = new MeshBasicMaterial({
                    map: texture, 
                    overdraw: true, 
                    side: DoubleSide});
        var plane = new PlaneGeometry(100, 20);
        var text = new Mesh(plane, mat);
        text.position.set(coord.x + 20, coord.z + 30, coord.y + 10);
        var axis = new Vector3(0, 1, 0);
        var direction = new Vector3(20, 20, 5);
        text.quaternion.setFromUnitVectors(axis, direction.normalize())
        scenePers.add(text);
        _tmpPillarGeometry.push(text, line);
    }

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

    function __removePillar() {
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
        //__removeLines();
    }

    if (!_pillarMap && (floor === 'None')) {
        __removePillar();
    } else {

        if (!_pillarMap) {
            __removePillar();
            _pillarMap = !_pillarMap;
        }
        _lastPillar = {};
        _tmpPillarGeometry = [];
        _lastFloor = floor;
        if (floor === 'None') {
            console.log("Can't print PillarMap without floor selected")

        } else {
            for (var roomKey in roomList[floor]) {
                var scale = 1 + DataHandler.getNormalized(type, value, roomKey) * 3;
                // Necessary to reverse scaling
                _lastPillar[roomKey] = scale;

                __createPillar(floor, roomKey, scale);
                //__createLine(floor, roomKey);
            }
        }
    }   

}

function _createGraphDiv(container) {
    _graphDiv = document.createElement("div");
    _graphDiv.setAttribute("id", "barGraph");
    _graphDiv.classList.add('graph');
    _graphDiv.style.left = container.style.left;
    document.body.appendChild(_graphDiv);
}


function displayGraph(type, value, title, container) {
    if (DataHandler.hasData()) {
        //_graph = !_graph;
        
        if (_graphDiv === undefined) {
            _graphDiv = document.createElement("div");
            _graphDiv.setAttribute("id", "barGraph");
            _graphDiv.classList.add('graph');
            _graphDiv.style.left = container.style.left;
            document.body.appendChild(_graphDiv);
        }
        _graphDiv.innerHTML = title;
        var _label = [];
        var _values = [];
        for (var room of roomListString) {
            _label.push(room.substring(4, ));
            _values.push(DataHandler.getNormalized(type, value, room) * 100);
        }

        var chart = new Chartist.Bar('#barGraph', {
            labels: _label,
            series: _values
        }, {
            distributeSeries: true
        });

        /* Dynamically modify bar colors */
        chart.on('draw', function(context) {
            if (context.type === 'bar') {
                context.element.attr({
                    style: 'stroke: ' + _getCSScolor(_getColorValue(context.value.y)) + ';'
                });
            }
        });
        
    }
}

function displayCurrentGraph(type, title, container) {
    if (DataHandler.hasData()) {
    //_graph = !_graph;
    
        if (_graphDiv === undefined) {
            _graphDiv = document.createElement("div");
            _graphDiv.setAttribute("id", "barGraph");
            _graphDiv.classList.add('graph');
            _graphDiv.style.left = container.style.left;
            document.body.appendChild(_graphDiv);
        }

        _graphDiv.innerHTML = title;
        var _label = [];
        var _values = [];
        for (var room of roomListString) {
            _label.push(room.substring(4, ));
            _values.push(DataHandler.getCurrentTotal(type, room));
        }

        new Chartist.Bar('#barGraph', {
            labels: _label,
            series: _values
        }, {
            distributeSeries: true
        });
    
    }
}


/*
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
*/

/*
function displayGraph() {
    _series = [];
    for (var key in DataHandler.roomData) {
        _series.append(DataHandler.roomData[key]);
    }
    var graphDiv = document.createElement("div");
    graphDiv.setAttribute("id", "lineGraph");
    // add in style.css to make globally available and define only once
    //graphDiv.style.cssText = 'position:fixed;bottom:0;left:0;right:0;width:400;height:400'
    graphDiv.classList.add('graph');
    document.body.appendChild(graphDiv);
    new Chartist.Line('#lineGraph', {
        labels: DataHandler.hackKeys,
        series: _series
    }, {
        plugins: [
        Chartist.plugins.legend({
            legendNames: Object.keys(DataHandler.roomData),
        })]
    });
}
*/

/*
 * TODO: Change to make all geometry transparent
 */
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

function hideFloors(floor) {
    if (floor in roomList) {
        hideGeometry(roomList[floor][Object.keys(roomList[floor])[0]].geometry.boundingBox.max.z);
    } else {
        hideGeometry(0);
    }
}

export {colorMap, pillarMap, apSphere, 
        setCurrentFloor, hideFloors, makeTransparent, 
        displayGraph, initColorMap, updateLegend,
        displayCurrentGraph, updateAPcolorMap}