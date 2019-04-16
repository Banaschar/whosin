import {WebGLRenderer, PerspectiveCamera, OrthographicCamera,
        Scene, AmbientLight, DirectionalLight,
        Color, Vector4} from 'three';
import {OrbitControls} from 'three/examples/js/controls/OrbitControls';
import {getBox2d} from './geometry';

var scenePers, sceneOrtho;
var _ambientLight, _keyLight, _fillLight, _backLight;
var _lightOn = false;
var renderer;
var renderer2;
var _switchBackground = false;
var cameraPers, cameraOrtho;
var controls;

function initScene(container) {
    scenePers = new Scene();
    sceneOrtho = new Scene();
    scenePers.background = new Color("hsl(0, 0%, 35%)");
    sceneOrtho.background = new Color("hsl(50, 65%, 28%)")
    _initLight();
    _initRenderer(container);
    _initCamera();
    _initControls();
    scenePers.add(_ambientLight);
    switchLightning();
}

function _initLight() {
    _ambientLight = new AmbientLight(0xffffff, 1.0);
    _keyLight = new DirectionalLight(new Color('hsl(30, 100%, 75%)'), 0.75);
    _keyLight.position.set(-100, 0, 100);
    _fillLight = new DirectionalLight(new Color('hsl(30, 100%, 75%)'), 0.75);
    _fillLight.position.set(100, 0, 100);
    _backLight = new DirectionalLight(new Color('hsl(30, 100%, 75%)'), 0.75);
    _backLight.position.set(100, 0, -100).normalize();
}

function _initRenderer(container) {
    var webglCanvas = document.createElement('canvas');
    webglCanvas.setAttribute('class', 'webglCanvas1');
    renderer = new WebGLRenderer({alpha: true, canvas: webglCanvas});
    renderer.setPixelRatio(window.devicePixelRatio);
    //renderer.setSize(window.innerWidth, window.innerHeight);
    //renderer.setSize(webglCanvas.clientWidth, webglCanvas.clientHeight);
    renderer.setClearColor(0xffffff, 0);

    var webglCanvas2 = document.createElement('canvas');
    webglCanvas2.setAttribute('class', 'webglCanvas2');
    renderer2 = new WebGLRenderer({alpha: true, canvas: webglCanvas2});
    renderer2.setPixelRatio(window.devicePixelRatio);
    //renderer2.setSize(window.innerWidth / 2, window.innerHeight);
    //renderer2.setSize(webglCanvas2.clientWidth, webglCanvas2.clientHeight);
    renderer2.setClearColor(0xffffff, 0);

    container.appendChild(renderer.domElement);
    container.appendChild(renderer2.domElement);
}

function updateCameras(width3d, width2d) {
    cameraPers.aspect = width3d / renderer.domElement.clientHeight;
    var w = renderer2.domElement.clientWidth;
    var h = renderer2.domElement.clientHeight;
    cameraOrtho.left = w / -2;
    cameraOrtho.right = w / 2;
    cameraOrtho.top = h / 2;
    cameraOrtho.bottom = h / -2;

    cameraPers.updateProjectionMatrix();
    cameraOrtho.updateProjectionMatrix();
    updateCameraOrtho();
}

/* Center orthographic camera on the room group */
function updateCameraOrtho() {
    try {
        var box = getBox2d();
        cameraOrtho.zoom = Math.min(renderer2.domElement.clientWidth / (box.max.x - box.min.x),
                    renderer2.domElement.clientHeight / (box.max.y - box.min.y)) * 0.9;
        
        box.getCenter(cameraOrtho.position);
        cameraOrtho.updateProjectionMatrix();
    } catch(e) {
        console.log('Model not yet loaded');
    }
}

function _initCamera() {
    cameraPers = new PerspectiveCamera(45, 
        renderer.domElement.clientWidth / renderer.domElement.clientHeight, 1, 1000);
    var w = renderer2.domElement.clientWidth;
    var h = renderer2.domElement.clientHeight;
    cameraOrtho = new OrthographicCamera(w / -2, w / 2, h / 2, h / -2, -10, 200)

    cameraPers.position.set(-121, 68, 76);
    cameraPers.zoom = 1.8;
    cameraPers.updateProjectionMatrix();
    //cameraOrtho.updateProjectionMatrix();
}

function _initControls() {
    controls = new OrbitControls(cameraPers, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
}

function setBackground() {
    _switchBackground = !_switchBackground;

    if (_switchBackground) {
        renderer.setClearColor(new Color("hsl(0, 0%, 35%)"));
    } else {
        renderer.setClearColor(0xffffff, 0);
    }
    
}

function switchLightning() {
    _lightOn = !_lightOn
    if (_lightOn) {

        _ambientLight.intensity = 0.25;
        scenePers.add(_keyLight);
        scenePers.add(_fillLight);
        scenePers.add(_backLight);

    } else {

        _ambientLight.intensity = 0.9;
        scenePers.remove(_keyLight);
        scenePers.remove(_fillLight);
        scenePers.remove(_backLight);

    }
}

export {initScene, renderer, renderer2, controls, cameraPers, 
        cameraOrtho, switchLightning, scenePers,
        sceneOrtho, updateCameras, updateCameraOrtho};