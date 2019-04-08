import {Vector2, Vector3, Color, LoadingManager, Raycaster} from "three";
import {cameraPers, cameraOrtho, renderer, renderer2, scenePers,
        updateCameras, updateViewports, viewports} from "./sceneHandler";
import {rooms} from "./geometry";
import {Interaction} from 'three.interaction';
import {updateTooltip, updateAnnotation, hideAnnotation, 
        updateAnnotationPosition} from "./spriteHandler";

var _mouse;
var _mouse2d;
var _clientMouse;
var _raycaster;
var _rooms = [];
var _rooms2d = [];
var _currHoverObject = null;

function statusMessage(msg, type) {
    var field = document.getElementById('statusBar');
    if (type === 'status') {
        field.style.color = 'white';
    } else {
        field.style.color = 'red';
    }
    field.innerHTML = msg;
}

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

    //LoadingManager.prototype.loadType = null;
    var loadType = null;

    LoadingManager.prototype.setup = function(txt, type) {
        if (overlay.classList.contains('loadingScreenHidden')) {
            overlay.classList.remove('loadingScreenHidden');
        }
        progress.style.backgroundColor = 'green';
        textField.textContent = txt;
        loadType = type;
    }

    manager.onLoad = function() {
        overlay.classList.add('loadingScreenHidden');
        progress.style.width = 0;
        statusMessage(loadType + ' erfolgreich geladen', 'status');
    };

    manager.onProgress = function(xhr) {
        console.log(xhr.loaded);
        progress.style.width = xhr.loaded / xhr.total * 100 + '%';
    };

    manager.onError = function(e) {
        console.error(e);
        overlay.classList.add('loadingScreenHidden');
        progress.style.width = 0;
        statusMessage(loadType + ': Fehler', error);
        // For zip loader error: create cases:
        //console.log('error', event.error);
        //progress.style.backgroundColor = 'red';
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
    var style = window.getComputedStyle(container);
    var width = parseInt(style.width, 10);
    var height = container.clientHeight;

    console.log('Renderer changed: ' + renderer.domElement.clientWidth);

    /*
    cameraPers.aspect = width / height;
    cameraPers.updateProjectionMatrix();

    cameraOrtho.left = -width / 2;
    cameraOrtho.right = width / 2;
    cameraOrtho.top = height / 2;
    cameraOrtho.bottom = -height / 2;
    cameraOrtho.updateProjectionMatrix();
    */

    renderer.setSize(width, height);
    //renderer2.setSize(width / 2, height);
    updateViewports(container);
    updateCameras();
}

function initEventHandler(container) {
    _mouse = new Vector2();
    _clientMouse = new Vector2();
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

function setEventObjects(rooms, rooms2d) {
    for (var floor in rooms) {
        for (var room in rooms[floor]) {
            _rooms.push(rooms[floor][room]);
            _rooms2d.push(rooms2d[floor][room]);
        }
    }
}

/*
function setEventObjects(rooms) {
    for (var floor of Object.keys(rooms)) {
        for (var room of Object.keys(rooms[floor])) {
            _rooms.push(rooms[floor][room]);
        }
    }
}
*/
/*
function _updateMouse(event, container) {
    _mouse.x = ((event.clientX - (container.style.left + viewports['3d'].w)) / viewports['3d'].w) * 2 - 1;       
    _mouse.y = -((event.clientY - container.offsetTop) / viewports['3d'].z) * 2 + 1; 
    //_mouse2d.x = ((event.clientX - (container.offsetLeft + viewports['2d'].x) / 2 + 0.5) / viewports['2d'].w) * 2 - 1;
    //_mouse2d.y = -((event.clientY - container.offsetTop + 0.5) / viewports['2d'].z) * 2 + 1;
    //console.log('1: ' + _mouse.x + ', ' + _mouse.y);
    _mouse.x = ((event.clientX - container.offsetLeft / 2 + 0.5) / window.innerWidth) * 2 - 1;
    _mouse.y = -((event.clientY - container.offsetTop + 0.5) / window.innerHeight) * 2 + 1;
    //console.log('2: ' + _mouse.x + ', ' + _mouse.y);
}
*/

function _updateMouse(event, container) {
    _mouse.x = ((event.clientX - container.offsetLeft / 2 + 0.5) / window.innerWidth) * 2 - 1;
    _mouse.y = -((event.clientY - container.offsetTop + 0.5) / window.innerHeight) * 2 + 1;
}


function _checkIntersections() {
    _raycaster.setFromCamera(_mouse, cameraPers);
    var intersections = _raycaster.intersectObjects(_rooms);
    /*
    if (intersections.length === 0) {
        _raycaster.setFromCamera(_mouse, cameraOrtho);
        intersections = _raycaster.intersectObjects(_rooms2d);
    }
    */

    if (intersections.length === 0 && _currHoverObject !== null) {
        hideAnnotation();
        //updateAnnotation(null, false);
        _currHoverObject = null;
    } else if (intersections.length > 0 && intersections[0].object.name !== _currHoverObject) {
        updateAnnotation(_mouse, intersections[0].object.name);
        //updateAnnotation(intersections[0].object, true)
        _currHoverObject = intersections[0].object.name;
    } else if (intersections.length > 0 && intersections[0].object.name === _currHoverObject) {
        updateAnnotationPosition(_mouse);
    }
}

function _onMouseMove(event, container) {
    _updateMouse(event, container);
    _checkIntersections();
}

export {initEventHandler, createTooltipEvents, initLoadingManager,
        setEventObjects, onWindowResize, statusMessage};