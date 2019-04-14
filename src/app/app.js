import {initScene, controls, renderer, 
        scenePers, sceneOrtho, cameraOrtho, cameraPers,
        viewports, controlsOrtho, renderer2} from './sceneHandler';
import {loadModel, loadZip} from './geometry';
import {initSpriteHandler, initAnnotation} from './spriteHandler';
import {initEventHandler} from './eventHandler';
import {initGui, initSideBar} from './guiHandler';
import {visualUpdate, initColorMap, updateLegend} from './visualization';
import Stats from '../lib/stats.min';
import {initDataHandler} from './dataHandler';
import config from "../config.json";
import {statusMessage, onWindowResize} from './eventHandler.js';
import {setConfig} from './conf.js';

// TODO: Import all files in the assets directory and load by file name (building name)
import defaultModel from '../assets/0501.zip';

var stats;
var container;

function init() {
    var dev = false;
    container = document.createElement('div');
    container.setAttribute('class', 'container');
    document.body.appendChild(container);

    initEventHandler(container);

    try {
        console.log(ASSETS);
        var assetList = ASSETS;
    } catch(err) {
        console.log(err);
        var assetList = ['0501'];
        var dev = true;
    }
    initSideBar(container, assetList);

    try {
        var CONFIG = JSON.parse(CONF);
    } catch(err) {
        console.log('err');
        statusMessage('Malformed config file. Using base config', 'error');
        var CONFIG = config;
    }
    setConfig(CONFIG);
    initScene(container);
    
    if (dev) {
        loadZip(defaultModel);
    }
    // TODO: Combine sprite and annotation init methods
    initSpriteHandler();
    initAnnotation();

    initColorMap(container);

    //stats = new Stats();

    //container.appendChild(renderer.domElement);
    //container.appendChild(renderer2.domElement);
    //document.body.appendChild(stats.dom);

    
    //console.log(renderer.domElement.clientWidth);
    //console.log(renderer.domElement.clientHeight);
    renderer.setSize(renderer.domElement.clientWidth, renderer.domElement.clientHeight);
    
    renderer2.setSize(renderer2.domElement.clientWidth, renderer2.domElement.clientHeight);
}

function render() {
    requestAnimationFrame(render);
    controls.update();
    controlsOrtho.update();
    //renderer.clear();
    console.log(cameraOrtho.position);
    
    /*
    var x = renderer.domElement.offsetLeft;
    var y = renderer.domElement.offsetTop;
    var width = (window.innerWidth - x) / 2;
    var height = (window.innerHeight - y) / 2;
    */

    /*
    renderer.setViewport(x, y, width, height);
    renderer.setScissor(x, y, width, height);
    renderer.setScissorTest( true );
    renderer.render(scenePers, cameraPers);

    renderer.setViewport(width, y, window.innerWidth - width, window.innerHeight);
    renderer.setScissor(width, y, window.innerWidth - width, window.innerHeight);
    renderer.setScissorTest( true );
    renderer.render(sceneOrtho, cameraOrtho);
    */
    
    /*
    renderer.setViewport(viewports['3d'].x, viewports['3d'].y, viewports['3d'].z, viewports['3d'].w);
    renderer.setScissor(viewports['3d'].x, viewports['3d'].y, viewports['3d'].z, viewports['3d'].w);
    renderer.setScissorTest( true );
    renderer.render(scenePers, cameraPers);

    
    //renderer.clearDepth();
    renderer.setViewport(viewports['2d'].x, viewports['2d'].y, viewports['2d'].z, viewports['2d'].w);
    renderer.setScissor(viewports['2d'].x, viewports['2d'].y, viewports['2d'].z, viewports['2d'].w);
    renderer.setScissorTest( true );
    renderer.render(sceneOrtho, cameraOrtho);
    */
    renderer.render(scenePers, cameraPers);
    renderer2.render(sceneOrtho, cameraOrtho);
    
    
    //stats.update();
    //visualUpdate();
    //updateLegend();
}

export {init, render};