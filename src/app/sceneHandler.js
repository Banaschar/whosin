import {WebGLRenderer, PerspectiveCamera, OrthographicCamera,
        Scene, AmbientLight, DirectionalLight,
        Color} from 'three';
import {OrbitControls} from 'three/examples/js/controls/OrbitControls';

var scenePers, sceneOrtho;
var _ambientLight, _keyLight, _fillLight, _backLight;
var _lightOn = false;
var renderer;
var _switchBackground = false;
var cameraPers, cameraOrtho;
var controls;

function initScene() {
    scenePers = new Scene();
    sceneOrtho = new Scene();
    _initLight();
    _initRenderer();
    _initCamera();
    _initControls();
    scenePers.add(_ambientLight);
    switchLightning();
    setBackground();
    
}

function _initLight() {
    //_ambientLight = new AmbientLight(0xffffff, 0.9);
    //_ambientLight = new AmbientLight(0x666666, 0.85);
    _ambientLight = new AmbientLight(0x404040, 1.0);
    _keyLight = new DirectionalLight(new Color('hsl(30, 100%, 75%)'), 1.0);
    _keyLight.position.set(-100, 0, 100);

    _fillLight = new DirectionalLight(new Color('hsl(240, 100%, 75%)'), 0.75);
    _fillLight.position.set(100, 0, 100);
    _backLight = new DirectionalLight(0xffffff, 1.0);
    _backLight.position.set(100, 0, -100).normalize();
}

function _initRenderer() {
    var _switchBackground = false;
    renderer = new WebGLRenderer({alpha: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff, 0);
    renderer.autoClear = false; // For overlay renderer

}

function _initCamera() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    cameraPers = new PerspectiveCamera(45, width / height, 1, 1000);
    cameraOrtho = new OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, -10, 100);
    //cameraOrtho = new OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 1, 1000);
    
    //cameraPers.position.set(-154, 54, 70);
    cameraPers.position.set(-102, 66, 71);
    //cameraOrtho.position.z = 10;
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

export {initScene, renderer, controls, cameraPers, 
        cameraOrtho, setBackground, switchLightning, scenePers, sceneOrtho};