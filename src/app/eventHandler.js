import {Vector3, Color} from "three";
import {cameraPers, cameraOrtho, renderer, scenePers} from "./sceneHandler";
import {rooms} from "./geometry";
import {Interaction} from 'three.interaction';
import {updateTooltip} from "./spriteHandler";

var _domEvents

function onDocumentMouseMove(event) {
    // update Tooltip position
    var pos = new Vector3((event.clientX / window.innerWidth ) * 2 - 1,
                                -(event.clientY / window.innerHeight ) * 2 + 1, 1);
    pos.unproject(cameraOrtho);
    toolTipSprite.position.set(pos.x, pos.y - 20, 1);
}

function onWindowResize() {
    var width = window.innerWidth;
    var height = window.innerHeight;

    cameraPers.aspect = width / height;
    cameraPers.updateProjectionMatrix();

    cameraOrtho.left = -width / 2;
    cameraOrtho.right = width / 2;
    cameraOrtho.top = height / 2;
    cameraOrtho.bottom = -height / 2;
    cameraOrtho.updateProjectionMatrix();

    renderer.setSize(width, height);
}

function initEventHandler() {
    //_domEvents = new THREEx.DomEvents(cameraPers, renderer.domElement);
    //window.addEventListener('mousemove', onDocumentMouseMove, false);
    window.addEventListener('resize', onWindowResize, false);
}


function createTooltipEvents(geo) {
    var interaction = new Interaction(renderer, scenePers, cameraPers);
    for (var floor in geo) {
        for (var key in geo[floor]) {
            var thisRoom = geo[floor][key];
            thisRoom.on('mouseover', (function(thisRoom) {
                return function() {
                    updateTooltip(thisRoom, true);
                }
            })(thisRoom));

            thisRoom.on('mouseout', (function(thisRoom) {
                return function() {
                    updateTooltip(null, false);
                }
            })(thisRoom));
        }
    }
}


/*
var createEventHandlers = function() {

    for (var floor in rooms) {
        for (var key in rooms[floor]) {
            _domEvents.addEventListener(rooms[floor][key], 'mouseover', (function (floor, key) {
                //room.material.color = new THREE.Color("rgb(0, 255, 0)");
                //room.material.needsUpdate = true;
                return function() {
                    SpriteHandler.updateTooltip(rooms[floor][key].name);
                }
            })(floor, key), false);

            _domEvents.addEventListener(rooms[floor][key], 'mouseout', (function () {
                //room.material.color = new THREE.Color("rgb(0, 0, 255)");
                //room.material.needsUpdate = true;
                return function() {
                    SpriteHandler.updateTooltip('');
                }
            })(), false);
        }
    }
};
*/

export {initEventHandler, createTooltipEvents};