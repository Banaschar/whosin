import {ColladaLoader} from 'three/examples/js/loaders/ColladaLoader';
import {Mesh, MeshBasicMaterial, LoadingManager, MeshLambertMaterial} from 'three';
import {scenePers} from './sceneHandler';
import {createTooltipEvents} from './eventHandler';

var models = [];
var roomList = {};
var roomListString = [];
var _nodes = {};
var _hidden = false;
var _hideList;
var transparency = 1.0;
var _materialList = {};
var apList = {};

/*
// Dynamic textures to print room number on the top of room cube
function _modifyTextures() {
    var dynTexture = new DynamicTexture(256, 256);
    //var mat = new MeshBasicMaterial({map: dynTexture.texture});
    roomList['4']['4170A'].material.map = dynTexture;
    dynTexture.drawText("4170A", 32, 256, 'black');
    roomList['4']['4170A'].material.needsUpdate = true;
}
*/

/*
function _initLoadingManager() {
    var manager = new LoadingManager();
    var bar = document.createElement("div");
    bar.setAttribute("id", "loadingBar");
    var overlay = document.createElement("div");
    overlay.setAttribute("id", "loadingScreen");
    var progress = document.createElement("span");
    progress.setAttribute("id", "progress");
    bar.appendChild(progress);
    overlay.appendChild(bar);
    document.body.appendChild(overlay);

    manager.onLoad = function() {
        overlay.classList.add('loadingScreenHidden');
        progress.style.width = 0;
    };

    manager.onProgress = function(xhr) {
        progress.style.width = xhr.loaded / xhr.total * 100 + '%';
    };

    manager.onError = function(e) {
        console.error(e);
        progress.style.backgroundColor = 'red';
    };

    return manager;
}
*/


function loadModel(modelName, manager) {
    //var manager = _initLoadingManager();
    manager.setup('Loading Building...');
    var caloader = new ColladaLoader(manager);
    caloader.load(modelName, function (collada) {
        models.push(collada.scene);
        scenePers.add(collada.scene);
        _loadNodes();
        createTooltipEvents(roomList);
        // TODO: Refactor.
        //_modifyTextures();

    }, manager.onProgress, manager.onError);

}
/*
function (xhr) {
        console.log( (xhr.loaded / xhr.total * 100) + '% loaded');
    }
*/
/* 
    loads the room nodes (and some specific walls, remove after testing)
    Refactor after initial tests, to provide list of stuff to seatch for
    -> Add material list, in which to store all materials used
*/
function _loadNodes() {
    var node;
    var _pat1 = /^Room/;
    var _pat2 = /^apa/;

    for (node of models[0].children) {
        if (!(node instanceof Mesh)) {
            continue;
        }

        //_nodeBounds[node.name] = new THREE.Box3().setFromObject(node);
        node.geometry.computeBoundingBox();
        _nodes[node.name] = node;
        _materialList[node.material.name] = node.material;

        if (_pat1.test(node.name)) {
            roomListString.push(node.name);
            var _floor = (node.name.match(/\d+/g))[0].charAt(0);
            if (roomList.hasOwnProperty(_floor)) {
                roomList[_floor][node.name] = node;
            } else {
                roomList[_floor] = {};
                roomList[_floor][node.name] = node;
            }
        } else if (_pat2.test(node.name)) {
            apList[node.name] = node;
        }
    }

    // Give each room a different material, so colors can be set individualy
    // MeshBasicMaterial
    // MeshLambertMaterial
    var meshBasic = new MeshLambertMaterial({color: 0x777777,
                                          transparent: true, opacity: 0.5});
    for (var floor in roomList) {
        for (var key in roomList[floor]) {
            //roomList[floor][key].material = roomList[floor][key].material.clone();
            roomList[floor][key].material = meshBasic.clone();
            //console.log(roomList[floor][key].material);
        }
    }
}

/*
    Make specified material transparent
*/
function setTransparency(mat, opac) {
    if (mat.length === 0) {
        for (var key in _materialList) {
            if (opac === 1.0) {
                _materialList[key].transparent = false;
            } else {
                _materialList[key].transparent = true;
            }
            _materialList[key].opacity = opac;
            _materialList[key].needsUpdate = true;
        }
    }
    else {
        for (var m of mat) {
            if (opac === 1.0) {
                _materialList[m].transparent = false;
            } else {
                _materialList[m].transparent = true;
            }
            _materialList[m].opacity = opac;
            _materialList[m].needsUpdate = true;
        }
    }
}

/*
    Hide floors above current. Needs an argument later
    Still hacky, uses predefined roomList for floor 3 and 4 to get height
    TODO: Maybe change to use Material.clippingPlanes
*/
function hideGeometry(_height) {
    if (_hidden) {
        for (var ele of _hideList) {
            _nodes[ele].visible = true;
        }
        _hidden = false;

    } 
    if (_height != 0) {
        _hideList = [];
        for (var key in _nodes) {
            if (_nodes[key].geometry.boundingBox.min.z >= _height) {
                _hideList.push(key);
            }
        }

        for (var ele of _hideList) {
            _nodes[ele].visible = false;
        }
        _hidden = true;
    }
}

function moveGeometry() {
    //console.log(Object.keys(roomList["3"])[0]);
    
    var _height1 = roomList["3"][Object.keys(roomList["3"])[0]].geometry.boundingBox.min.z;
    var _height2 = roomList["3"][Object.keys(roomList["3"])[0]].geometry.boundingBox.max.z;

    for (var key in _nodes) {
        if (_nodes[key].geometry.boundingBox.min.z >= _height1-1 &&
            _nodes[key].geometry.boundingBox.max.z <= _height2) {
            _nodes[key].translateX(60);
            _nodes[key].translateZ(- _nodes[key].geometry.boundingBox.min.z);
        }
    }
    

}

export {loadModel, hideGeometry, setTransparency, makeTransparent, 
        roomList, roomListString, apList, moveGeometry};