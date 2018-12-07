import {apList, roomList, setTransparency, hideGeometry} from "./geometry";
import {SphereGeometry, MeshBasicMaterial, Mesh, Vector3, Color, 
        MeshNormalMaterial, CubeGeometry, CanvasTexture,
        SpriteMaterial, Sprite, Geometry, Line, LineBasicMaterial,
        Texture, DoubleSide, PlaneGeometry} from "three";
import {scenePers, cameraPers, renderer, sceneOrtho} from "./sceneHandler";
import * as AccessPoints from './apData';
import * as DataHandler from './dataHandler';
import * as Chartist from "chartist";
import "../css/chartist.min.css";
import "../css/style.css";
import {Lut} from 'three/examples/js/math/Lut'

var _colorMap = false;
var _pillarMap = false;
var _apSphere = false;
var _sphereList = [];
var _currentFloor = 'None';
var _currentTime = 'None';
var _lastFloor = 'None';
var _lastPillar = {};
var _lut;
var _legendSprite;
var _updateQueue = [];

function createLegend() {
    var numColors = 256;
    var ticks = 5;
    var maxEle = 100;
    var map =  [[ 0.0, '0x0000FF' ], [ 0.2, '0x00FFFF' ], 
            [ 0.5, '0x00FF00' ], [ 0.8, '0xFFFF00' ], 
            [ 1.0, '0xFF0000' ]];
    var legend = document.createElement('canvas');
    var ctx = legend.getContext('2d');
    legend.setAttribute('width', 1);
    legend.setAttribute('height', numColors);

    /*
    // For usage as Bitmap
    var texture = new CanvasTexture(legend);
    var material = new SpriteMaterial({
        map: texture
    });
    _legendSprite = new Sprite(material);
    */
    var imageData = ctx.getImageData(0, 0, 1, numColors);
    var data = imageData.data;
    var k = 0;
    var step = 1.0 / numColors;

    for ( var i = 1; i >= 0; i -= step ) {

        for ( var j = map.length - 1; j >= 0; j -- ) {

            if ( i < map[ j ][ 0 ] && i >= map[ j - 1 ][ 0 ] ) {

                var min = map[ j - 1 ][ 0 ];
                var max = map[ j ][ 0 ];

                var minColor = new Color( 0xffffff ).setHex( map[ j - 1 ][ 1 ] );
                var maxColor = new Color( 0xffffff ).setHex( map[ j ][ 1 ] );

                var color = minColor.lerp( maxColor, ( i - min ) / ( max - min ) );

                data[ k * 4 ] = Math.round( color.r * 255 );
                data[ k * 4 + 1 ] = Math.round( color.g * 255 );
                data[ k * 4 + 2 ] = Math.round( color.b * 255 );
                data[ k * 4 + 3 ] = 255;

                k += 1;

            }

        }

    }

    // Hacky: putImageData doesn't allow for scale, draw to new canvas instead
    ctx.putImageData(imageData, 0, 0);
    var destCanvas = document.createElement('canvas');
    destCanvas.setAttribute('width', 28); //28
    destCanvas.setAttribute('height', numColors); //256
    var destCtx = destCanvas.getContext('2d');
    destCtx.scale(28, 1);
    destCtx.drawImage(legend, 0, 0);
    //document.body.appendChild(destCanvas)
    /*
    //createImageBitmap not supported in Safari
    var bit = createImageBitmap(imageData);
    ctx.drawImage(bit, 28, 1);
    document.body.appendChild(legend);
    */

    /*
    // Usage as sprite. Maybe better performance, but harder to create text legend
    _legendSprite.position.set(-900, 200, 1);
    //_legendSprite.scale.set(1, 10, 1);
    _legendSprite.scale.set(20, 400, 1);
    sceneOrtho.add(_legendSprite);
    */

    /*
        Draw text for Legend on seperate canvas 
    */
    var offsetX = 28;
    var offsetY = 30;
    var delta = numColors / (ticks - 1);
    var deltaEle = Math.round(maxEle / (ticks - 1));
    var legendText = document.createElement('canvas');
    legendText.setAttribute('width', 300);
    legendText.setAttribute('height', 300);
    
    legendText.setAttribute("id", "legendText");
    var textCtx = legendText.getContext('2d');
    textCtx.drawImage(destCanvas, 0, 30);
    textCtx.font = "18px Arial";
    textCtx.fillText("Average Usage [%]", 0, 18);
    textCtx.font = "12px Arial";

    for (var i = 0; i <= ticks - 1; i++) {
        textCtx.moveTo(offsetX, Math.round(offsetY + i * delta));
        textCtx.lineTo(50, Math.round(offsetY + i * delta));
        textCtx.stroke();
        var t = (ticks - 1 - i) * deltaEle;

        if (i < ticks - 1) { 
            textCtx.fillText(t.toString(), 52, Math.round(offsetY + i * delta) + 10);
        } else {
            textCtx.fillText(t.toString(), 52, Math.round(offsetY + i * delta));
        }
    }
    
    document.body.appendChild(legendText);
}

/*
    If Legend is a Sprite, position has to be updated
    TODO: Remove, not used
*/
function updateLegend() {
    var pos = new Vector3((300 / window.innerWidth) + 2 - 1,
                         (300 / window.innerHeight) * 2 + 1, 1);
    pos.unproject(cameraPers);

    pos.sub(cameraPers.position).normalize();
    var distance = -cameraPers.position.z / pos.z;
    pos.multiplyScalar(distance);
    pos.add(cameraPers.position);

    _legendSprite.position.set(pos.x, pos.y, pos.z);

}

function initColorMap() {
    _lut = new Lut('rainbow', 256);
    _lut.setMax(100);
    _lut.setMin(0);

    createLegend();
}

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

        for (var item of _sphereList) {
            scenePers.remove(item);
        }
    }
}

/*
    Lut Color Map
*/
function _getColor(room) {
    var num = DataHandler.getNormalized(_currentTime, room);
    return _lut.getColor(num * 100);
}

/*
    Other color map

function _getColor(room) {
    var colors = [0xffffb2, 0xfecc5c, 0xfd8d3c, 0xf03b20, 0xbd0026];
    var num = DataHandler.getNormalized(_currentTime, room);
    num *= 4;
    num = Math.floor(num);
    return colors[num];
}
*/
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
        roomList[floor][room].material.color = _getColor(room);
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
    TODO: Refactor scale implementation, use sub/multiply scalar etc.
    THE Z coordinate for all rooms of a floor is the same!!!!
    So I need to compute it only once, for gods sake!!!
*/
function pillarMap() {

    _pillarMap = !_pillarMap;

    var can = document.createElement('canvas');
    can.width = 100;
    can.height = 20;
    var ctx = can.getContext('2d');
    ctx.fillStyle = '#f00';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = 'bold 150px';

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

    if (_pillarMap) {
        _lastPillar = {};
        var _floor = _currentFloor;
        _lastFloor = _floor;
        if (_floor === 'None') {
            console.log("Can't print PillarMap without floor selected")

        } else {
            for (var roomKey in roomList[_floor]) {
                var scale = 1 + DataHandler.getNormalized(_currentTime, roomKey) * 2;
                // Necessary to reverse scaling
                _lastPillar[roomKey] = scale;

                __createPillar(_floor, roomKey, scale);
                __createLine(_floor, roomKey);
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

/*
    Function that updates all objects added to update Queue
*/
function visualUpdate() {

}

export {colorMap, pillarMap, apSphere, 
        setCurrentFloor, setCurrentTime, 
        hideFloors, makeTransparent, displayGraph,
        visualUpdate, initColorMap, updateLegend}