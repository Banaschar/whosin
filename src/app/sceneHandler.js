import {WebGLRenderer, PerspectiveCamera, OrthographicCamera,
        Scene, AmbientLight, DirectionalLight,
        Color, Vector4} from 'three';
import {OrbitControls} from 'three/examples/js/controls/OrbitControls';

var scenePers, sceneOrtho;
var _ambientLight, _keyLight, _fillLight, _backLight;
var _lightOn = false;
var renderer;
var renderer2;
var _switchBackground = false;
var cameraPers, cameraOrtho;
var controls;
var controlsOrtho;
var viewports = {
    '3d': null,
    '2d': null
};

function initScene(container) {
    scenePers = new Scene();
    sceneOrtho = new Scene();
    scenePers.background = new Color("hsl(0, 0%, 35%)");
    sceneOrtho.background = new Color("hsl(50, 65%, 28%)")
    _initLight();
    _initRenderer(container);
    updateViewports();
    _initCamera();
    _initControls();
    scenePers.add(_ambientLight);
    switchLightning();
    //setBackground();
    
}

function updateViewports(container) {
    var x = renderer.domElement.offsetLeft;
    var y = renderer.domElement.offsetTop;
    //var width = (window.innerWidth - x) / 2;
    //var height = (window.innerHeight - y) / 2;
    var width;
    var height;
    if (container) {
        width = container.clientWidth;
        height = container.clientHeight;
    } else {
        width = (window.innerWidth - x);
        height = (window.innerHeight - y);
    }
    //viewports['3d'] = new Vector4(x, y, width, height);
    //viewports['2d'] = new Vector4(width, y, window.innerWidth - width, window.innerHeight);
    viewports['3d'] = new Vector4(x, y, width / 2, height / 2);
    viewports['2d'] = new Vector4(width / 2, y, width, height);

    //renderer1.setSize
}

function _initLight() {
    _ambientLight = new AmbientLight(0xffffff, 1.0);
    //_ambientLight = new AmbientLight(0x666666, 0.85);
    //_ambientLight = new AmbientLight(0x404040, 1.0);
    //_keyLight = new DirectionalLight(new Color('hsl(30, 100%, 75%)'), 1.0);
    _keyLight = new DirectionalLight(new Color('hsl(30, 100%, 75%)'), 0.75);
    _keyLight.position.set(-100, 0, 100);

    //_fillLight = new DirectionalLight(new Color('hsl(240, 100%, 75%)'), 0.75);
    _fillLight = new DirectionalLight(new Color('hsl(30, 100%, 75%)'), 0.75);
    _fillLight.position.set(100, 0, 100);
    //_backLight = new DirectionalLight(0xffffff, 1.0);
    _backLight = new DirectionalLight(new Color('hsl(30, 100%, 75%)'), 0.75);
    _backLight.position.set(100, 0, -100).normalize();
}

function _initRenderer(container) {
    var webglCanvas = document.createElement('canvas');
    webglCanvas.setAttribute('class', 'webglCanvas1');
    renderer = new WebGLRenderer({alpha: true, canvas: webglCanvas});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    //renderer.setSize(webglCanvas.clientWidth, webglCanvas.clientHeight);
    renderer.setClearColor(0xffffff, 0);

    var webglCanvas2 = document.createElement('canvas');
    webglCanvas2.setAttribute('class', 'webglCanvas2');
    renderer2 = new WebGLRenderer({alpha: true, canvas: webglCanvas2});
    renderer2.setPixelRatio(window.devicePixelRatio);
    //renderer2.setSize(window.innerWidth / 2, window.innerHeight);
    //renderer2.setSize(webglCanvas2.clientWidth, webglCanvas2.clientHeight);
    renderer2.setClearColor(0xffffff, 0);
}

/*
function _initRenderer(container) {
    var _switchBackground = false;
    var webglCanvas = document.createElement('canvas');
    webglCanvas.setAttribute('class', 'webglCanvas');
    renderer = new WebGLRenderer({alpha: true, canvas: webglCanvas});
    renderer.setPixelRatio(window.devicePixelRatio);
    //renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0xffffff, 0);
}
*/

function updateCameras() {
    cameraPers.aspect = renderer.domElement.clientWidth / renderer.domElement.clientHeight;
    cameraOrtho.aspect = renderer2.domElement.clientWidth / renderer2.domElement.clientHeight;
}

/*
function updateCameras() {
    cameraPers.aspect = viewports['3d'].z / viewports['3d'].w;
    cameraPers.updateProjectionMatrix();

    cameraOrtho.aspect = viewports['2d'].z / viewports['2d'].w
    cameraOrtho.updateProjectionMatrix();
}
*/

function _initCamera() {
    cameraPers = new PerspectiveCamera(45, 
        viewports['3d'].z / viewports['3d'].w, 1, 1000);
    cameraOrtho = new PerspectiveCamera(45,
        viewports['2d'].z / viewports['2d'].w, 1, 1000);

    //cameraPers.position.set(-154, 54, 70);
    cameraPers.position.set(-121, 68, 76);
    //cameraPers.position.set(-107, 66, 54);
    cameraOrtho.position.x = 100;
    cameraOrtho.position.z = 500;
}


/*
function _initCamera(container) {
    var width = window.innerWidth;
    var height = window.innerHeight;
    cameraPers = new PerspectiveCamera(45, width / height, 1, 1000);
    cameraOrtho = new OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 1, 100);
    //cameraOrtho = new OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 1, 1000);
    
    //cameraPers.position.set(-154, 54, 70);
    cameraPers.position.set(-102, 66, 71);
    //cameraOrtho.position.z = 10;
}
*/

function _initControls() {
    controls = new OrbitControls(cameraPers, renderer.domElement);
    controlsOrtho = new OrbitControls(cameraOrtho, renderer.domElement);
    controlsOrtho.enableDamping = true;
    controlsOrtho.dampingFactor = 0.25;
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
        cameraOrtho, setBackground, switchLightning, scenePers,
        controlsOrtho, sceneOrtho, updateViewports, viewports, updateCameras};