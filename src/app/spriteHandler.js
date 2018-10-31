import {Texture, SpriteMaterial, Sprite} from "three";


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

export {tooltipSprite, updateTooltip, initSpriteHandler};