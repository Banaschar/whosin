import {apList, roomList, roomList2d, setTransparency, hideGeometry,
        roomListString} from "./geometry";
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

var _pillarMap = false;
var _apSphere = false;
var _sphereList = [];
var _lastFloor = 'None';
var _lastPillar = {};
var _tmpPillarGeometry = [];
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
        var col = new Color(_colorMapAP[Conf.getRoomAp(room)]);
        roomList[floor][room].material.transparent = false;
        roomList[floor][room].material.color = col;
        roomList[floor][room].material.needsUpdate = true;
        roomList2d[floor][room].material.color = col;
        roomList2d[floor][room].material.needsUpdate = true;
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

/*
    Problems: If the room material is set to transparent, it's not showing through
    the outer wall. That's likely because of render order with two transparent
    objects in a row and one redered first.
    material.alphaTest has to be larger/smaller than opacity
*/
function colorMap(values) {

    function __applyColor3d(floor, room, col) {
        roomList[floor][room].material.transparent = false;
        roomList[floor][room].material.color = col;
        roomList[floor][room].material.needsUpdate = true;
    }

    function __applyColor2d(floor, room, col) {
        roomList2d[floor][room].material.color = col;
        roomList2d[floor][room].material.needsUpdate = true;
    }
    
    for (var floorKey in roomList) {
        for (var roomKey in roomList[floorKey]) {
            var col = new Color(_getColorValue(values[roomKey]));
            __applyColor3d(floorKey, roomKey, col);
            __applyColor2d(floorKey, roomKey, col);
        }
    }

}

function _clearColor() {
    for (var floor in roomList) {
        var col1 = new Color({r: 0.65098, g: 0.709804, b: 0.886275});
        var col2 = new Color(0x444444);
        for (var key in roomList[floor]) {
            roomList[floor][key].material.color = col1;
            roomList[floor][key].material.opacity = 0.38;
            roomList[floor][key].material.transparent = true;
            roomList[floor][key].material.needsUpdate = true;
            roomList2d[floor][key].material.color = col2;
            roomList2d[floor][key].material.needsUpdate = true;
        }
    }
}

function clearAll() {
    makeTransparent('all', 1.0);
    _clearColor();
    if (_apSphere) {
        apSphere();
    }
    //pillarMap(null, null, 'None');
    try {
        var g = document.getElementById('graph1');
        while (g.firstChild) {
            g.removeChild(g.firstChild);
        }
        g = document.getElementById('graph2');
        while (g.firstChild) {
            g.removeChild(g.firstChild);
        }
    } catch(e) {
        console.log(e);
    }
}

/*
    TODO: Refactor scale implementation, use sub/multiply scalar etc.
    THE Z coordinate for all rooms of a floor is the same!!!!
    So I need to compute it only once, for gods sake!!!
*/
function pillarMap(values, floor) {

    _pillarMap = !_pillarMap;

    /* Create lines pointing to the rooms, with the names on the side 
     * Not working yet :)
     */
    /*
    var can = document.createElement('canvas');
    can.width = 100;
    can.height = 20;
    var ctx = can.getContext('2d');
    ctx.fillStyle = '#f00';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = 'bold 150px';


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
    */

    function __createPillar(floor, room, scale) {
        roomList[floor][room].scale.set(1, 1, scale);
        var height = roomList[floor][room].geometry.boundingBox.max.z -
                        roomList[floor][room].geometry.boundingBox.min.z;
        var middle = (roomList[floor][room].geometry.boundingBox.max.z +
                        roomList[floor][room].geometry.boundingBox.min.z) / 2;
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
                var scale = 1 + values[roomKey] * 3;
                // Necessary to reverse scaling
                _lastPillar[roomKey] = scale;

                __createPillar(floor, roomKey, scale);
                //__createLine(floor, roomKey);
            }
        }
    }   
}

function _getAllData(dataFormat) {
    var dataObject = {};
    if (dataFormat.entity === 'ap') {
        for (var ap in apList) {
            dataObject[ap] = DataHandler.getAPdata(ap, dataFormat);
        }
    } else if (dataFormat.entity === 'room') {
        for (var room of roomListString) {
            dataObject[room] = DataHandler.getRoomData(room, dataFormat);
        }
    } else {
        statusMessage('Malformed data request', 'error');
    }
    return dataObject;
}

function applyVisualization(data) {
    if ('dataFormat' in data) {
        var defaultData = _getAllData(data.dataFormat);
    }
    var ownData;
    for (var key in data) {
        switch (key) {
            case 'dataFormat':
                break;
            case 'colorMap':
                ownData = defaultData;
                if (data[key].dataFormat != null) {
                    ownData = _getAllData(data[key].dataFormat);
                } else {
                    colorMap(ownData);
                    }
                break;  
            case 'pillarMap':
                if (data[key].dataFormat != null) {
                    ownData = _getAllData(data[key].dataFormat);
                } else {
                    /* We need a deep copy here because we modify the data */
                    ownData = JSON.parse(JSON.stringify(defaultData));
                }
                /* pillar map needs values between 0 and 1 */
                Object.keys(ownData).map(function(key) {
                    ownData[key] /= 100; 
                });
                pillarMap(ownData, data[key].floor);
                break;
            case 'graph1':
            case 'graph2':
                ownData = defaultData;
                var ent;
                if (data[key].dataFormat != null) {
                    ownData = _getAllData(data[key].dataFormat);
                    ent = data[key].dataFormat.entity;
                } else {
                    ent  = data.dataFormat.entity;
                }
                var labels = Object.keys(ownData);
                var values = Object.values(ownData);
                /* Only use the number to fit all rooms on the graph */
                if (ent === 'room') {
                    labels = labels.map(function(x){ return x.substring(4, ) });
                }
                displayGraph(key, data[key].title, data[key].colorType, labels, values);
                break;  
            case 'apSphere':
                apSphere();
                break;
            case 'makeTransparent':
                makeTransparent(data[key].area, data[key].opac);
                break;
            case 'hideFloors':
                hideFloors(data[key].floor);
                break;
            default:
                statusMessage('No matching key in apply vis', 'error');
                console.log('Key error: ' + key);
        }
    }
}

function displayGraph(div, title, colorType, labels, values) {
    var _graphDiv = document.getElementById(div);
    _graphDiv.innerHTML = title;
    var dynColor;
    if (colorType === 'ap') {
        dynColor = function(ctx) {
            return _getCSScolor(_colorMapAP[ctx.axisX.ticks[ctx.seriesIndex]]);
        }
    } else if (colorType === 'heat') {
        dynColor = function(ctx) {
            return _getCSScolor(_getColorValue(ctx.value.y));
        };
    } 
    var chart = new Chartist.Bar('#' + div, {
        labels: labels,
        series: values
    }, {
        distributeSeries: true,
        width: '100%',
        chartPadding: {
            bottom: 48
        }
    });

    /* Dynamically modify bar colors */
    if (colorType != 'default') {
        chart.on('draw', function(context) {
            if (context.type === 'bar') {
                context.element.attr({
                    style: 'stroke: ' + dynColor(context) + ';'
                });
            }
        });
    }
}

/*
 * TODO: wall / all difference. Hardcoded materials of model 1 so far
 * So arg 'all' has to be used all the time
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
        hideFloors, makeTransparent, 
        displayGraph, initColorMap,
        updateAPcolorMap, clearAll,
        applyVisualization}