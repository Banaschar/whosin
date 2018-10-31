import {initScene, controls, renderer, 
        scenePers, sceneOrtho, cameraOrtho, cameraPers} from './sceneHandler';
import {loadModel} from './geometry';
import {initSpriteHandler} from './spriteHandler';
import {initEventHandler} from './eventHandler';
import {initGui} from './guiHandler';
import Stats from '../lib/stats.min';

//test
import MODEL from '../assets/Building1_ap_rooms_v3.dae';

var stats;
function init() {
    var container = document.createElement('div');
    document.body.appendChild(container);

    initScene();
    loadModel(MODEL);
    initSpriteHandler();
    initEventHandler();
    initGui();

    stats = new Stats();

    container.appendChild(renderer.domElement);
    container.appendChild(stats.dom);
}

function render() {
    requestAnimationFrame(render);
    controls.update();
    renderer.clear();
    renderer.render(scenePers, cameraPers);
    renderer.clearDepth();
    renderer.render(sceneOrtho, cameraOrtho);
    stats.update();
}

export {init, render};