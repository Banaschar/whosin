import {Vector2, Vector3, Color, LoadingManager, Raycaster} from "three";
import {cameraPers, cameraOrtho, renderer, renderer2,
        updateCameras} from "./sceneHandler";
import {rooms, modelIsLoaded} from "./geometry";
import {updateAnnotation, hideAnnotation, 
        updateAnnotationPosition} from "./spriteHandler";

var _mouse;
var _mouse2d;
var _clientMouse;
var _raycaster;
var _rooms = [];
var _rooms2d = [];
var _currHoverObject = null;
var _manager;

function statusMessage(msg, type) {
    var field = document.getElementById('statusBar');
    if (type === 'status') {
        field.style.color = 'white';
    } else {
        field.style.color = 'red';
    }
    field.innerHTML = msg;
}

function _initLoadingManager() {
    _manager = new LoadingManager();
    var bar = document.createElement("div");
    bar.setAttribute("id", "loadingBar");
    var overlay = document.createElement("div");
    overlay.setAttribute("id", "loadingScreen");
    overlay.classList.add('loadingScreenHidden');
    var progress = document.createElement("span");
    progress.setAttribute("id", "progress");
    var textField = document.createElement("div");
    textField.setAttribute("id", "loadingText");
    bar.appendChild(progress);
    overlay.appendChild(textField);
    overlay.appendChild(bar);
    document.body.appendChild(overlay);

    var loadType = null;

    LoadingManager.prototype.setup = function(txt, type) {
        if (overlay.classList.contains('loadingScreenHidden')) {
            overlay.classList.remove('loadingScreenHidden');
        }
        progress.style.backgroundColor = 'green';
        textField.textContent = txt;
        loadType = type;
    }

    _manager.onLoad = function() {
        overlay.classList.add('loadingScreenHidden');
        progress.style.width = 0;
        statusMessage(loadType + ' succesfully loaded', 'status');
    };

    _manager.onProgress = function(xhr) {
        if (loadType === 'data') {
            progress.style.width = xhr + '%';
        } else {
            progress.style.width = xhr.loaded / xhr.total * 100 + '%';
        }
    };

    _manager.onError = function(e) {
        console.error(e);
        overlay.classList.add('loadingScreenHidden');
        progress.style.width = 0;
        statusMessage(loadType + ': Error loading', 'error');
        // For zip loader error: create cases:
        //console.log('error', event.error);
        //progress.style.backgroundColor = 'red';
    };
}

function getLoadingManager() {
    return _manager;
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

    var width3d = width * 0.7;
    var width2d = width * 0.3
    
    renderer.setSize(width3d, renderer.domElement.clientHeight)
    renderer2.setSize(width2d, height);
    
    updateCameras(width3d, width2d);
}

function initEventHandler(container) {
    _mouse = new Vector2();
    _clientMouse = new Vector2();
    _raycaster = new Raycaster();
    _initLoadingManager();
    window.addEventListener('mousemove', function(event) {
        _onMouseMove(event, container);
    }, false);
    window.addEventListener('resize', function() {
        onWindowResize(container);
    }, false);
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
// Could be used when adding intersections to the 2D view
function setEventObjects(rooms) {
    for (var floor of Object.keys(rooms)) {
        for (var room of Object.keys(rooms[floor])) {
            _rooms.push(rooms[floor][room]);
        }
    }
}
*/

function _updateMouse(event, container) {
    var canvasBounds = renderer.context.canvas.getBoundingClientRect();
    _mouse.x = ((event.clientX - canvasBounds.left) / (canvasBounds.right - canvasBounds.left)) * 2 - 1;
    _mouse.y = -((event.clientY - canvasBounds.top) / (canvasBounds.bottom - canvasBounds.top)) * 2 + 1;
}

/*
 * Handles mouse intersactions with rooms
 * TODO: Add intersections for the 2D plan and display tooltip graph there
 */
function _checkIntersections(container) {
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
        _currHoverObject = null;
    } else if (intersections.length > 0 && intersections[0].object.name !== _currHoverObject) {
        updateAnnotation(_mouse, container, intersections[0].object.name);
        _currHoverObject = intersections[0].object.name;
    } else if (intersections.length > 0 && intersections[0].object.name === _currHoverObject) {
        updateAnnotationPosition(_mouse, container);
    }
}

function _onMouseMove(event, container) {
    if (modelIsLoaded()) {
        _updateMouse(event, container);
        _checkIntersections(container);
    }
}

export {initEventHandler, setEventObjects, onWindowResize, statusMessage, getLoadingManager};