import {ColladaLoader} from 'three/examples/js/loaders/ColladaLoader';
import {Mesh} from 'three';
import {scenePers} from './sceneHandler';

var models = [];
var roomList = {};
var _nodes = {};
var _hidden = false;
var _hideList;
var transparency = 1.0;
var _materialList = {};
var apList = {};

function loadModel(modelName) {
    /*
    var loadingManager = new THREE.LoadingManager( function() {
        models.push()
    });
    */

    var caloader = new ColladaLoader();
    caloader.load(modelName, function (collada) {
        models.push(collada.scene);
        scenePers.add(collada.scene);
        _loadNodes();
        //EventHandler.createEventHandlers();

    }, function (xhr) {
        console.log( (xhr.loaded / xhr.total * 100) + '% loaded');
    });

}

/* 
    loads the room nodes (and some specific walls, remove after testing)
    Refactor after initial tests, to provide list of stuff to seatch for
    -> Addd material list, in which to store all materials used
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
    for (var floor in roomList) {
        for (var key in roomList[floor]) {
            roomList[floor][key].material = roomList[floor][key].material.clone();
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

export {loadModel, hideGeometry, setTransparency, makeTransparent, roomList, apList};