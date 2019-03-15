import {initScene, controls, renderer, 
        scenePers, sceneOrtho, cameraOrtho, cameraPers} from './sceneHandler';
import {loadModel} from './geometry';
import {initSpriteHandler, initAnnotation} from './spriteHandler';
import {initEventHandler, initLoadingManager} from './eventHandler';
import {initGui} from './guiHandler';
import {visualUpdate, initColorMap, updateLegend} from './visualization';
import Stats from '../lib/stats.min';
import {initDataHandler} from './dataHandler';

// TODO: Switch to precompressed model
import MODEL from '../assets/Building1_ap_rooms_v3.dae';

var stats;

function init() {
    var container = document.createElement('div');
    document.body.appendChild(container);
    var manager = initLoadingManager();
    initScene();
    loadModel(MODEL, manager);
    // TODO: Combine sprite and annotation init methods
    initSpriteHandler();
    initAnnotation();
    initEventHandler();
    initDataHandler(manager);
    initGui();
    initColorMap();

    stats = new Stats();

    container.appendChild(renderer.domElement);
    container.appendChild(stats.dom);
}

/*
    TODO: Refactor updateLegend() -> Move to sprite handler or use visualUpdate
    ---> Better yet, refactor it all into SpriteHandler and rename it to visuals or so
*/
function render() {
    requestAnimationFrame(render);
    controls.update();
    renderer.clear();
    renderer.render(scenePers, cameraPers);
    renderer.clearDepth();
    renderer.render(sceneOrtho, cameraOrtho);
    stats.update();
    //visualUpdate();
    //updateLegend();
}

export {init, render};