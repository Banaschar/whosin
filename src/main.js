/*
require(['WebGL', 'app'], function (WEBGL, app) {
    console.log("MAIN");
    if (!WEBGL.isWebGLAvailable()) {
        WEBGL.getWebGLErrorMessage();
    } 
    app.init();
    app.render();
} );
*/
/*
require(['three', 'three/examples/js/controls/OrbitControls'], function(THREE, OrbitControls) {
    var renderer = new THREE.WebGLRenderer();
    console.log("renderer created");
    var camera = new THREE.PerspectiveCamera(45,45,45,1);
    console.log("CAMERA");
    var controls = new OrbitControls(camera, renderer.domElement);
    console.log("Controls created");
    var caloader = new THREE.ColladaLoader()
    console.log("ColladaLoader created")
});
*/

/*
import {WebGLRenderer, PerspectiveCamera} from 'three';
import {OrbitControls} from 'three/examples/js/controls/OrbitControls';
import {ColladaLoader} from 'three/examples/js/loaders/ColladaLoader';
//import {THREEx} from './lib/threex.domevents';

var renderer = new WebGLRenderer();
console.log("Renderer");
var camera = new PerspectiveCamera(45,45,45,1);
console.log("Camera");
var controls = new OrbitControls(camera, renderer.domElement);
console.log("Controls");
var loader = new ColladaLoader();
console.log("ColladaLoader created")
THREEx.DomEvents.noConflict();
var domEvent = new THREEx.DomEvent(camera, renderer.domElement);
console.log("DomEvent created");
*/


import * as app from './app/app.js';

app.init();
app.render();


/*
import * as test1 from "./app/test";
import {getNeu2} from "./app/test2";

console.log("test1.neu2: " + test1.neu2);
console.log("getNeu2: " + getNeu2());
test1.pub();

console.log("AFTER. getNeu2: " + getNeu2());
console.log("AFTER. test1.neu2: " + test1.neu2);
*/