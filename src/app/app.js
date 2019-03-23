import {initScene, controls, renderer, 
        scenePers, sceneOrtho, cameraOrtho, cameraPers} from './sceneHandler';
import {loadModel, loadZip} from './geometry';
import {initSpriteHandler, initAnnotation} from './spriteHandler';
import {initEventHandler, initLoadingManager} from './eventHandler';
import {initGui, initSideBar} from './guiHandler';
import {visualUpdate, initColorMap, updateLegend} from './visualization';
import Stats from '../lib/stats.min';
import {initDataHandler} from './dataHandler';

// TODO: Import all files in the assets directory and load by file name (building name)
import ASSETS from '../assets/assets.zip';

var stats;

function init() {
    var container = document.createElement('div');
    container.setAttribute('class', 'container');
    document.body.appendChild(container);

    initSideBar(container);
    var manager = initLoadingManager();
    initScene(container);
    loadZip(ASSETS, manager);
    // TODO: Combine sprite and annotation init methods
    initSpriteHandler();
    initAnnotation();
    
    initDataHandler(manager);
    initGui();
    initColorMap(container);

    stats = new Stats();

    container.appendChild(renderer.domElement);
    container.appendChild(stats.dom);

    initEventHandler();
    
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