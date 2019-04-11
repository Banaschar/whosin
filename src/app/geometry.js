import {ColladaLoader} from 'three/examples/js/loaders/ColladaLoader';
import {Mesh, MeshBasicMaterial, LoadingManager,
        PlaneGeometry, MeshLambertMaterial} from 'three';
import {scenePers, sceneOrtho} from './sceneHandler';
import {setEventObjects} from './eventHandler';
import ZipLoader from 'zip-loader';
import {updateAPcolorMap} from './visualization';
import {updateMenu} from './guiHandler';

var roomList = {};
var roomList2d = {};
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
    Load the zipped assets
*/
function loadZip(path, manager) {
    manager.setup('Loading packed assets...', 'zip');
    var loader = new ZipLoader(path);
    loader.on('progress', manager.onProgress);

    loader.on('error', manager.onError);

    loader.on('load', function(event) {
        var key = Object.keys(loader.files).find(function(ele) {
            var reg = /\.dae$/;
            return reg.test(ele);
        });
        
        loadModel(loader, manager);

        manager.onLoad();
    });

    loader.load();
}

/*
 * Parse the model from the extracted blobs
 */
function loadModel(zipLoader, manager) {
    manager.setup('Loading Building...', 'model');
    manager.setURLModifier(function(url) {
        var reg = /\.dae$/;

        /*
            The ColladaLoader tries to load the material files from the
            same directory, e.g. prepends './' to the path. We have to remove that,
            as we're loading them from blob.
        */
        if (!reg.test(url)) {
            url = url.substring(2, );
        }
        return zipLoader.extractAsBlobUrl(url, 'blob');
    });

    var caLoader = new ColladaLoader(manager);
    var daeURL = Object.keys(zipLoader.files).find(function(ele) {
            var reg = /\.dae$/;
            return reg.test(ele);
    });

    caLoader.load(daeURL, function (collada) {
        scenePers.add(collada.scene);
        _loadNodes(collada.scene);
        _updateModelDependent();

    }, manager.onProgress, manager.onError);

}

/* 
    loads the room nodes (and some specific walls, remove after testing)
    Refactor after initial tests, to provide list of stuff to seatch for
    -> Add material list, in which to store all materials used
*/
function _loadNodes(model) {
    var node;
    var _pat1 = /^Room/;
    var _pat2 = /^apa/;

    for (node of model.children) {
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
            roomList[floor][key].material = meshBasic.clone();
        }
    }
}

function _updateModelDependent() {
    _create2DView();
    setEventObjects(roomList, roomList2d);
    updateMenu(roomList);
    updateAPcolorMap();
}

function _create2DView() {
    var material = new MeshBasicMaterial({color: 0xffff00});
    for (var floor in roomList) {
        for (var room in roomList[floor]) {
            var width = roomList[floor][room].geometry.boundingBox.max.x -
                        roomList[floor][room].geometry.boundingBox.min.x;
            var height = roomList[floor][room].geometry.boundingBox.max.y -
                        roomList[floor][room].geometry.boundingBox.min.y;

            //console.log('Width: ' + width + '. Height: ' + height);
            var geo = new PlaneGeometry(width, height);
            var mesh = new Mesh(geo, material);
            mesh.geometry.scale(2, 2, 1);
            mesh.translateX(Math.floor(Math.random() * 100));
            mesh.translateY(Math.floor(Math.random() * 10));
            if (!roomList2d.hasOwnProperty(floor)) {
                roomList2d[floor] = {};
            }
            sceneOrtho.add(mesh);
            roomList2d[floor][room] = mesh;
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
    Hide floors above specified height
    Still feels hacky, maybe change to use Material.clippingPlanes
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

/* Experimental: Try to split the 3D model into floors
 * Needs a working implementation for cutting meshes with planes
 */
function moveGeometry() {
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
        roomList, roomListString, apList, moveGeometry, loadZip};