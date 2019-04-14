import {ColladaLoader} from 'three/examples/js/loaders/ColladaLoader';
import {Mesh, MeshBasicMaterial, LoadingManager,
        PlaneGeometry, MeshLambertMaterial,
        SpriteMaterial, CanvasTexture, Sprite, Group, Box3} from 'three';
import {scenePers, sceneOrtho, updateCameraOrtho} from './sceneHandler';
import {setEventObjects, getLoadingManager} from './eventHandler';
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
var _modelLoaded = false;
var _box2d;

function modelIsLoaded() {
    return _modelLoaded;
}

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
function loadZip(path) {
    var manager = getLoadingManager();
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
        _modelLoaded = true;

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

function _createRoomTexture() {
    const _canvas = document.createElement('canvas');
    const ctx = _canvas.getContext('2d');
    _canvas.height = 32;
    _canvas.width = 128;

    ctx.fillStyle = "blue";
    ctx.fillRect(0, 0, _canvas.width, _canvas.height);

    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('roomblabla', _canvas.width / 2, _canvas.height / 2);
    var _toolTipTexture = new CanvasTexture(_canvas);
    var mat = new MeshBasicMaterial({ map: _toolTipTexture});
    return mat;
}

function _createRoomSprite(name, posX, posY) {
    const _canvas = document.createElement('canvas');
    const ctx = _canvas.getContext('2d');
    _canvas.height = 64;
    _canvas.width = 256;

    //ctx.fillStyle = "blue";
    //ctx.fillRect(0, 0, _canvas.width, _canvas.height);

    //ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.fillStyle = '#000000'
    ctx.font = '32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, _canvas.width / 2, _canvas.height / 2);
    var _toolTipTexture = new CanvasTexture(_canvas);
    //var mat = new MeshBasicMaterial({ map: _toolTipTexture});
    var _spriteMat = new SpriteMaterial({map: _toolTipTexture});

    var sp = new Sprite(_spriteMat);
    sp.position.set(posX, posY, 4);
    sp.scale.set(32, 8, 1);

    return sp;
}

function _create2DView() {
    var group2d = new Group();
    var material = new MeshBasicMaterial({color: 0x444444});
    var floorY = 0;
    var floorX = 0;
    for (var floor in roomList) {
        floorY = 0;
        group2d.add(_createRoomSprite('Floor ' + floor, floorX * 50, -10));
        for (var room in roomList[floor]) {
            var height = roomList[floor][room].geometry.boundingBox.max.x -
                        roomList[floor][room].geometry.boundingBox.min.x;
            var width = roomList[floor][room].geometry.boundingBox.max.y -
                        roomList[floor][room].geometry.boundingBox.min.y;

            var geo = new PlaneGeometry(width, height);
            var mesh = new Mesh(geo, material.clone());
            mesh.geometry.scale(2, 2, 1);
            mesh.translateX(floorX * 50);
            mesh.translateY(floorY * 30 + height);


            var sp = _createRoomSprite(room, floorX * 50, floorY * 30 + height);
            group2d.add(mesh, sp);

            if (!roomList2d.hasOwnProperty(floor)) {
                roomList2d[floor] = {};
            }

            roomList2d[floor][room] = mesh;

            floorY += 1;
        }
        floorX += 1;
    }
    sceneOrtho.add(group2d);
    _box2d = new Box3().setFromObject(group2d);
    updateCameraOrtho();
}

function getBox2d() {
    return _box2d;
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
        roomList, roomList2d, roomListString, apList, moveGeometry,
        getBox2d, loadZip, modelIsLoaded};