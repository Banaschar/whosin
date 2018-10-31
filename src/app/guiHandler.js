import * as dat from "dat.gui";
import * as Visualization from "./visualization";
import * as Geometry from "./geometry";
import * as SceneHandler from "./sceneHandler";
import * as DataHandler from './dataHandler';

var _guiAttributes = {
    _transparent: 'wall',
    _text: 'None',
    _timeFrame: 'None',
    _hideFloors: function() {
        Visualization.hideFloors();
    },
    _colorMap: function() {
        Visualization.colorMap();
    },
    _pillarMap: function() {
        Visualization.pillarMap();
    },
    _apSphere: function() {
        Visualization.apSphere();
    },
    _switchLightning: function() {
        SceneHandler.switchLightning();
    },
    _setBackground: function() {
        SceneHandler.setBackground();
    },
    _transparency: 1.0

};

var _timeDict = {
    '24h': '-24h',
    'week': '-8days',
    'month': '-1month',
    '6 months': '-6months'
}

function initGui() {
    var _gui = new dat.GUI();
    var _guiVis = _gui.addFolder('Visualization');
    _guiVis.add(_guiAttributes, '_timeFrame', ['None', '24h', 'week', 'month', '6 months']).onChange(
                function(newValue) {
                    if (newValue === 'None') {
                        console.log('None');
                    } else {
                        for (var key in Geometry.apList) {
                            DataHandler.getData(key, _timeDict[newValue]);
                        }
                    }
                    Visualization.setCurrentTime(_timeDict[newValue]);
                }).name('Time');
    _guiVis.add(_guiAttributes, '_colorMap').name('Color Map');
    _guiVis.add(_guiAttributes, '_pillarMap').name('Pillar Map');
    _guiVis.add(_guiAttributes, '_apSphere').name('AP\'s');
    _guiVis.open();

    var _guiGeo = _gui.addFolder('Geometry');
    _guiGeo.add(_guiAttributes, '_text', ['None', '1', '2', '3', '4', '5']).onChange(
                function(newValue) {
                    Visualization.setCurrentFloor(newValue);
                    //Geometry.hideFloors(newValue);
                }).name('Floor');
    _guiGeo.add(_guiAttributes, '_hideFloors').name('Hide Floor');
    _guiGeo.add(_guiAttributes, '_transparent', ['wall', 'all']).name('Transparent');
    _guiGeo.add(_guiAttributes, '_transparency', 0.1, 1.0).name('Transparency').onChange(
                function(newValue) {
                    Visualization.makeTransparent(_guiAttributes._transparent, newValue);
                });
    _guiGeo.open();

    var _guiScene = _gui.addFolder('Scene');
    _guiScene.add(_guiAttributes, '_switchLightning').name('Lighting');
    _guiScene.add(_guiAttributes, '_setBackground').name('Background');
    _guiScene.open();

}

export {initGui};