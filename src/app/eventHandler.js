import {Vector3, Color, LoadingManager} from "three";
import {cameraPers, cameraOrtho, renderer, scenePers} from "./sceneHandler";
import {rooms} from "./geometry";
import {Interaction} from 'three.interaction';
import {updateTooltip, updateAnnotation} from "./spriteHandler";

var _domEvents

function initLoadingManager() {
    var manager = new LoadingManager();
    var bar = document.createElement("div");
    bar.setAttribute("id", "loadingBar");
    var overlay = document.createElement("div");
    overlay.setAttribute("id", "loadingScreen");
    var progress = document.createElement("span");
    progress.setAttribute("id", "progress");
    var textField = document.createElement("div");
    textField.setAttribute("id", "loadingText");
    bar.appendChild(progress);
    overlay.appendChild(textField);
    overlay.appendChild(bar);
    document.body.appendChild(overlay);

    LoadingManager.prototype.loadType = null;

    LoadingManager.prototype.setup = function(name) {
        if (overlay.classList.contains('loadingScreenHidden')) {
            overlay.classList.remove('loadingScreenHidden');
        }
        progress.style.backgroundColor = 'green';
        textField.textContent = name;
    }

    manager.onLoad = function() {
        overlay.classList.add('loadingScreenHidden');
        progress.style.width = 0;
    };

    manager.onProgress = function(xhr) {
        console.log(xhr.loaded);
        progress.style.width = xhr.loaded / xhr.total * 100 + '%';
    };

    manager.onError = function(e) {
        console.error(e);
        // For zip loader error: create cases:
        //console.log('error', event.error);
        progress.style.backgroundColor = 'red';
    };

    return manager;
}

function onDocumentMouseMove(event) {
    // update Tooltip position
    var pos = new Vector3((event.clientX / window.innerWidth ) * 2 - 1,
                                -(event.clientY / window.innerHeight ) * 2 + 1, 1);
    pos.unproject(cameraOrtho);
    toolTipSprite.position.set(pos.x, pos.y - 20, 1);
}

function onWindowResize(container) {
    //var width = window.innerWidth;
    //var height = window.innerHeight;
    var style = window.getComputedStyle(container);
    //var width = container.clientWidth - parseInt(style.marginLeft);
    var width = container.clientWidth - parseInt(container.style.marginLeft, 10);
    var height = container.clientHeight;
    cameraPers.aspect = width / height;
    cameraPers.updateProjectionMatrix();

    cameraOrtho.left = -width / 2;
    cameraOrtho.right = width / 2;
    cameraOrtho.top = height / 2;
    cameraOrtho.bottom = -height / 2;
    cameraOrtho.updateProjectionMatrix();

    renderer.setSize(width, height);
}

function initEventHandler(container) {
    //_domEvents = new THREEx.DomEvents(cameraPers, renderer.domElement);
    //window.addEventListener('mousemove', onDocumentMouseMove, false);
    window.addEventListener('resize', function() {
        onWindowResize(container);
    }, false);
}

/*
 * Called from Geometry.loadGeo
 */
function createTooltipEvents(geo) {
    var interaction = new Interaction(renderer, scenePers, cameraPers);
    for (var floor in geo) {
        for (var key in geo[floor]) {
            var thisRoom = geo[floor][key];
            thisRoom.on('mouseover', (function(thisRoom) {
                return function() {
                    updateTooltip(thisRoom, true);
                    updateAnnotation(thisRoom, true);
                }
            })(thisRoom));

            thisRoom.on('mouseout', (function(thisRoom) {
                return function() {
                    updateTooltip(null, false);
                    updateAnnotation(null, false);
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

export {initEventHandler, createTooltipEvents, initLoadingManager, onWindowResize};