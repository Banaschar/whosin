import {Texture, SpriteMaterial, Sprite, CanvasTexture, Vector3} from "three";
import {scenePers, cameraPers, renderer} from './sceneHandler';
import {totalAvgPerDay, hasData} from './dataHandler'
import {getCurrentState} from './guiHandler';
import * as Conf from './conf';
import * as Chartist from "chartist";
import "../css/chartist.min.css";
import "../css/style.css";

var div;
var _div;
var _textNode;
var _graphDiv;

/* Limit for the tooltip graph
 * Not entirely accurate apparently, off by like -2/-3
 */
function _projectY(chartRect, bounds, value) {
    /*
  return chartRect.y1 - 
    (chartRect.height() * (value - bounds.min) / (bounds.range + bounds.step));
    */
    return chartRect.y1 - 
    (chartRect.height() / bounds.max * value);
}

function _createGraph(room) {
    var st = getCurrentState();
    var values = totalAvgPerDay(room, st.dataType, st.dataValue);
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

function updateAnnotation(pos, container, room) {
    pos.x = (1 + pos.x) * renderer.domElement.clientWidth / 2;
    pos.y = -(pos.y - 1) * renderer.domElement.clientHeight / 2;
    var offsetX;
    if (pos.x < 0.7 * renderer.domElement.clientWidth) {
        offsetX = container.offsetLeft;
    } else {
        offsetX = 0;
    }
    _div.style.top = `${pos.y + 20}px`;
    _div.style.left = `${pos.x + offsetX}px`;
    _textNode.textContent = room;

    if (hasData()) {
        _graphDiv = _createGraph(room);
    }

    _div.style.visibility = 'visible';
}

function updateAnnotationPosition(pos, container) {
    pos.x = (1 + pos.x) * renderer.domElement.clientWidth / 2;
    pos.y = -(pos.y - 1) * renderer.domElement.clientHeight / 2;
    var offsetX;
    if (pos.x < 0.7 * renderer.domElement.clientWidth) {
        offsetX = container.offsetLeft;
    } else {
        offsetX = 0;
    }
    _div.style.top = `${pos.y + 20}px`;
    _div.style.left = `${pos.x + offsetX}px`;
}

function hideAnnotation() {
    _div.style.visibility = 'hidden';
}

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

export {initAnnotation, hideAnnotation, updateAnnotationPosition, updateAnnotation};