import {Texture, SpriteMaterial, Sprite, CanvasTexture, Vector3} from "three";
import {scenePers, cameraPers, renderer} from './sceneHandler';
import {totalAvgPerDay, hasData} from './dataHandler'
import * as Conf from './conf';
import * as Chartist from "chartist";
import "../css/chartist.min.css";
import "../css/style.css";

var tooltipSprite;
var div;
var _div;
var _textNode;
var _roomGraph = {};
var _graphDiv;

function initSpriteHandler() {
    // init text box
    div = document.createElement('div');

    // init sprite
    const _canvas = document.createElement('canvas');
    const ctx = _canvas.getContext('2d');
    const x = 32; //32
    const y = 32; //32
    const radius = 30; //30
    const startAngle = 0;
    const endAngle = Math.PI * 2;

    // Set canvas size
    _canvas.height = 64;
    _canvas.width = 64;
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.beginPath();
    ctx.arc(x, y, radius, startAngle, endAngle);
    ctx.fill();

    ctx.strokeStyle = 'rgb(255, 255, 255)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, radius, startAngle, endAngle);
    ctx.stroke();

    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.font = '32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('1', x, y);

    var _toolTipTexture = new CanvasTexture(_canvas);
    var _toolTipMaterial = new SpriteMaterial({
        map: _toolTipTexture,
        alphaTest: 0.5,
        transparent: true,
        depthTest: false,
        depthWrite: false
    });

    tooltipSprite = new Sprite(_toolTipMaterial);

    tooltipSprite.position.set(250, 250, 250);
    tooltipSprite.scale.set(5, 5, 5);

    scenePers.add(tooltipSprite);
}

// TODO: Combine with updateAnnotation (so I don't compute the location twice)
function updateTooltip(thisRoom, visible) {
    if (visible) {
        tooltipSprite.material.opacity = 1.0;
        var pos = new Vector3();
        pos.subVectors(thisRoom.geometry.boundingBox.max, 
                        thisRoom.geometry.boundingBox.min);
        pos.multiplyScalar(0.5);
        pos.add(thisRoom.geometry.boundingBox.min);
        cameraPers.updateMatrixWorld();
        pos.applyMatrix4(thisRoom.matrixWorld);
        tooltipSprite.position.set(pos.x, pos.y, pos.z);
        /*
        var x = thisRoom.geometry.boundingBox.max.x;
        var y = thisRoom.geometry.boundingBox.max.y;
        var z = thisRoom.geometry.boundingBox.max.z;
        tooltipSprite.position.set(x, z, y);
        */
        tooltipSprite.material.needsUpdate = true;

        // add text css
        /*
        pos.project(cameraPers);
        pos.x = Math.round((0.5 + vector.x / 2) * 
                    (renderer.domElement.width / window.devicePixelRatio));
        pos.y = Math.round((0.5 - vector.y / 2) * 
                    (renderer.domElement.height / window.devicePixelRatio));

        div.innerHTML = thisRoom.name;
        */

    } else {
        tooltipSprite.material.opacity = 0.0;
        tooltipSprite.material.needsUpdate = true;
        //console.log("Tooltip invisible");
    }
}

function _projectY(chartRect, bounds, value) {
  return chartRect.y1 - 
    (chartRect.height() * (value - bounds.min) / (bounds.range + bounds.step));
}

function _createGraph(room) {
    var values = totalAvgPerDay(room);
    if (values) {
        var chart = new Chartist.Bar('#roomGraph', {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            series: values
        }, {
            distributeSeries: true,
            high: Math.max(Math.max.apply(null, values), Conf.getRoomCapacity(room)),
            targetLine: {
                value: Conf.getRoomCapacity(room),
                class: 'ct-target-line'
            }
        });
        chart.on('created', function(context) {
            var targetLineY = _projectY(context.chartRect, context.bounds, context.options.targetLine.value);

            context.svg.elem('line', {
                x1: context.chartRect.x1,
                x2: context.chartRect.x2,
                y1: targetLineY,
                y2: targetLineY
            }, context.options.targetLine.class);
        });
    }
}

/*
function _createGraph(room) {
    new Chartist.Bar('#annotGraph', {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        series: totalAvgPerDay(room)
    }, {
        distributeSeries: true
    });
}
*/

function _setGraph(room) {
    if (_roomGraph.hasOwnProperty(room)) {
        return _roomGraph[room];
    } else {
        return _createGraph(room);
    }
}


function updateAnnotation(pos, room) {
    pos.x = (1 + pos.x) * window.innerWidth / 2;
    pos.y = -(pos.y - 3) * window.innerHeight / 2;
    var offsetX;
    if (pos.x < 0.7 * window.innerWidth) {
        offsetX = 100;
    } else {
        offsetX = -100;
    }
    //console.log(pos.x + ', ' + pos.y);
    _div.style.top = `${pos.y + 15}px`;
    _div.style.left = `${pos.x + offsetX}px`;
    _textNode.textContent = room;

    if (hasData()) {
        _graphDiv = _createGraph(room);
    }

    _div.style.visibility = 'visible';
}


function updateAnnotationPosition(pos) {
    pos.x = (1 + pos.x) * window.innerWidth / 2;
    pos.y = -(pos.y - 1) * window.innerHeight / 2;
    var offsetX;
    if (pos.x < 0.7 * window.innerWidth) {
        offsetX = 100;
    } else {
        offsetX = -100;
    }
    _div.style.top = `${pos.y + 15}px`;
    _div.style.left = `${pos.x + offsetX}px`;
}


function hideAnnotation() {
    _div.style.visibility = 'hidden';
}

/*
function updateAnnotation(thisRoom, visible) {
    if (visible) {
        var pos = new Vector3();
        pos.subVectors(thisRoom.geometry.boundingBox.max, 
                        thisRoom.geometry.boundingBox.min);
        pos.multiplyScalar(0.5);
        pos.add(thisRoom.geometry.boundingBox.min);
        
        cameraPers.updateMatrixWorld();
        pos.applyMatrix4(thisRoom.matrixWorld);

        cameraPers.updateProjectionMatrix();
        pos.project(cameraPers);
        //console.log(pos.x.toString() + ', ' + pos.y.toString());
        pos.x = (1 + pos.x) * window.innerWidth / 2;
        pos.y = -(pos.y - 1) * window.innerHeight / 2;
        //console.log(pos.x + ', ' + pos.y);
        _div.style.top = `${pos.y}px`;
        _div.style.left = `${pos.x}px`;

        _textNode.textContent = thisRoom.name;

        if (hasData()) {
            _graphDiv = _createGraph(thisRoom.name);
        }

        _div.style.visibility = 'visible';
    } else {
        _div.style.visibility = 'hidden';
    }
}
*/


function initAnnotation() {
    _div = document.createElement('div');
    _div.classList.add('annotation');
    
    var para = document.createElement("p");
    _textNode = document.createTextNode("This is new.");
    para.appendChild(_textNode);
    _div.appendChild(para);   
    _div.style.visibility = 'hidden';
    
    document.body.appendChild(_div); 
    _graphDiv = document.createElement("div");
    _graphDiv.setAttribute("id", "roomGraph");
    _graphDiv.classList.add('ct-chart');
   
    _div.appendChild(_graphDiv);  
}

export {tooltipSprite, updateTooltip, initSpriteHandler, initAnnotation,
        hideAnnotation, updateAnnotationPosition, updateAnnotation};