import {Vector2, Vector3, Color, LoadingManager, Raycaster} from "three";
import {cameraPers, cameraOrtho, renderer, scenePers} from "./sceneHandler";
import {rooms} from "./geometry";
import {Interaction} from 'three.interaction';
import {updateTooltip, updateAnnotation} from "./spriteHandler";

var _domEvents;
var _mouse;
var _raycaster;
var _rooms = [];
var _currHoverObject = null;

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
    
    //var width = container.clientWidth - parseInt(container.style.marginLeft, 10);
    //var width = container.clientWidth;
    //var height = container.clientHeight;
    var width = parseInt(style.width, 10);
    var height = container.clientHeight;

    //var canvas = renderer.domElement;
    //var width = canvas.clientWidth;
    //var height = canvas.clientHeight;
    console.log('Canvas width: ' + container.offsetLeft);

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
    _mouse = new Vector2();
    _raycaster = new Raycaster();
    window.addEventListener('mousemove', function(event) {
        _onMouseMove(event, container);
    }, false);
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

function setEventObjects(rooms) {
    for (var floor of Object.keys(rooms)) {
        for (var room of Object.keys(rooms[floor])) {
            _rooms.push(rooms[floor][room]);
        }
    }
}

function _updateMouse(event, container) {
    _mouse.x = ((event.clientX - container.offsetLeft / 2 + 0.5) / window.innerWidth) * 2 - 1;
    _mouse.y = -((event.clientY - renderer.domElement.offsetTop + 0.5) / window.innerHeight) * 2 + 1;
}

function _checkIntersections() {
    _raycaster.setFromCamera(_mouse, cameraPers);
    var intersections = _raycaster.intersectObjects(_rooms);

    if (intersections.length === 0 && _currHoverObject !== null) {
        updateTooltip(null, false);
        updateAnnotation(null, false);
        _currHoverObject = null;
    } else if (intersections.length > 0 && intersections[0].object.name !== _currHoverObject) {
        updateTooltip(intersections[0].object, true);
        updateAnnotation(intersections[0].object, true);
        _currHoverObject = intersections[0].object.name;
    } 
}

function _onMouseMove(event, container) {
    _updateMouse(event, container);
    _checkIntersections();
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

export {initEventHandler, createTooltipEvents, initLoadingManager,
        setEventObjects, onWindowResize};