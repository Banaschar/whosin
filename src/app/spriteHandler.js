import {Texture, SpriteMaterial, Sprite, CanvasTexture, Vector3} from "three";
import {scenePers, cameraPers, renderer} from './sceneHandler';

var tooltipSprite;
var div;

function initSpriteHandler() {
    // init text box
    div = document.createElement('div');

    // init sprite
    const _canvas = document.createElement('canvas');
    const ctx = _canvas.getContext('2d');
    const x = 32;
    const y = 32;
    const radius = 30;
    const startAngle = 0;
    const endAngle = Math.PI * 2;

    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.beginPath();
    ctx.arc(x, y, radius, startAngle, endAngle);
    ctx.fill();

    ctx.strokeStyle = 'rgb(255, 255, 255)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, radius, startAngle, endAngle);
    ctx.stroke();

    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.font = '32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('1', x, y);

    var _toolTipTexture = new CanvasTexture(_canvas);
    var _toolTipMaterial = new SpriteMaterial({
        map: _toolTipTexture,
        alphaTest: 0.5,
        transparent: true,
        depthTest: false,
        depthWrite: false
    });

    tooltipSprite = new Sprite(_toolTipMaterial);

    tooltipSprite.position.set(250, 250, 250);
    tooltipSprite.scale.set(35, 35, 1);

    scenePers.add(tooltipSprite);
}

function updateTooltip(thisRoom, visible) {
    if (visible) {
        tooltipSprite.material.opacity = 1.0;
        var pos = new Vector3();
        pos.subVectors(thisRoom.geometry.boundingBox.max, 
                        thisRoom.geometry.boundingBox.min);
        pos.multiplyScalar(0.5);
        pos.add(thisRoom.geometry.boundingBox.min);
        pos.applyMatrix4(thisRoom.matrixWorld);
        tooltipSprite.position.set(pos.x, pos.y, pos.z);
        /*
        var x = thisRoom.geometry.boundingBox.max.x;
        var y = thisRoom.geometry.boundingBox.max.y;
        var z = thisRoom.geometry.boundingBox.max.z;
        tooltipSprite.position.set(x, z, y);
        */
        tooltipSprite.material.needsUpdate = true;

        // add text css
        pos.project(cameraPers);
        pos.x = Math.round((0.5 + vector.x / 2) * 
                    (renderer.domElement.width / window.devicePixelRatio));
        pos.y = Math.round((0.5 - vector.y / 2) * 
                    (renderer.domElement.height / window.devicePixelRatio));

        div.innerHTML = thisRoom.name;

    } else {
        tooltipSprite.material.opacity = 0.0;
        tooltipSprite.material.needsUpdate = true;
        console.log("Tooltip invisible");
    }
}


/*
var tooltipSprite;
function initSpriteHandler() {
    var _tooltip = false;
    var _tooltipCanvas = document.createElement('canvas');
    _tooltipCanvas.width = 256;
    _tooltipCanvas.height = 128;
    var _tooltipContext = _tooltipCanvas.getContext('2d');
    _tooltipContext.font = "Bold 20px Arial";
    _tooltipContext.fillStyle = "rgba(0,0,0,0.95)";
    _tooltipContext.fillText('Test', 0, 20);

    var _tooltipTexture = new Texture(_tooltipCanvas);
    _tooltipTexture.needsUpdate = true;

    var _tooltipMaterial = new SpriteMaterial({map: _tooltipTexture});
    tooltipSprite = new Sprite(_tooltipMaterial);
    tooltipSprite.scale.set(200,100,20);
    tooltipSprite.position.set(50,50,1);
}
*/

/*
function updateTooltip(text) {
    if (text === "") {
        _tooltipContext.clearRect(0, 0, 300, 300);
        _tooltipTexture.needsUpdate = true;
    } else {
        _tooltipContext.clearRect(0, 0, 640, 480);
        var width = _tooltipContext.measureText(text).width;
        _tooltipContext.fillStyle = "rgba(0, 0, 0, 0.95)";
        _tooltipContext.fillRect = (0, 0, width+8, 20+8);
        _tooltipContext.fillStyle = "rgba(255, 255, 255, 0.95)";
        _tooltipContext.fillRect = (2, 2, width + 4, 20 + 4);
        _tooltipContext.fillStyle = "rgba(0, 0, 0, 1)";
        _tooltipContext.fillText(text, 4, 20);
        _tooltipTexture.needsUpdate = true;
    }
}
*/

export {tooltipSprite, updateTooltip, initSpriteHandler};