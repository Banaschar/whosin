import {initScene, controls, renderer, 
        scenePers, sceneOrtho, cameraOrtho, cameraPers,
        viewports, renderer2} from './sceneHandler';
import {loadModel, loadZip} from './geometry';
import {initAnnotation} from './spriteHandler';
import {initEventHandler} from './eventHandler';
import {initGui, initSideBar} from './guiHandler';
import {visualUpdate, initColorMap} from './visualization';
import Stats from '../lib/stats.min';
import {initDataHandler} from './dataHandler';
import config from "../config.json";
import {statusMessage, onWindowResize} from './eventHandler.js';
import {setConfig} from './conf.js';
import {setDevMode} from './dataHandler.js';

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
    
    /*
     * If using node.js dev server, load default model and use
     * cross-origin api calls (needs browser extension), instead of backend rest api
     */
    if (dev) {
        loadZip(defaultModel);
        setDevMode();
    }
    
    initAnnotation();
    initColorMap(container);
    dev = false;
    if (dev) {
        stats = new Stats();
        document.body.appendChild(stats.dom);
    }

    renderer.setSize(renderer.domElement.clientWidth, renderer.domElement.clientHeight);
    renderer2.setSize(renderer2.domElement.clientWidth, renderer2.domElement.clientHeight);
}

function render() {
    requestAnimationFrame(render);
    controls.update();
    
    renderer.render(scenePers, cameraPers);
    renderer2.render(sceneOrtho, cameraOrtho);
    
    if (stats) {
        stats.update();
    }
}

export {init, render};