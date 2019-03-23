import * as dat from "dat.gui";
import * as Visualization from "./visualization";
import * as Geometry from "./geometry";
import * as SceneHandler from "./sceneHandler";
import * as DataHandler from './dataHandler';
import * as EventHandler from './eventHandler';
import '../css/style.css';

function createButton(text, cssClass, func) {
    var button = document.createElement('button');
    button.setAttribute('type', 'button');
    if (cssClass) {
        button.setAttribute('class', cssClass);
    }
    button.addEventListener('click', func);
    button.innerHTML = text;
    return button;
}

function createA(ref, text) {
    var a = document.createElement('a');
    a.setAttribute('href', ref);
    a.innerHTML = text;
    return a;
}

function createListEle(ele) {
    var li = document.createElement('li');
    li.appendChild(ele);
    return li;
}

function createDropDown(options) {
    var select = document.createElement('select');
    var tmp;
    for (var ele of options) {
        tmp = document.createElement('option');
        tmp.setAttribute('value', ele);
        tmp.innerHTML = ele;
        select.appendChild(tmp);
    }
    select.addEventListener('click', function(event) {
        event.stopPropagation();
    })
    return select;
}

function createMenu(sidebar) {
    var menu = document.createElement('ul');
    menu.setAttribute('class', 'mainmenu');
    
    menu.appendChild(createListEle(createA('#', 'Visual')));

    var item2 = createListEle(createA('#', 'Data'));
    var sub1 = document.createElement('ul');
    sub1.setAttribute('class', 'submenu');
    sub1.appendChild(createListEle(createButton('substuff1', false, function(event){
        event.stopPropagation();
    })));
    sub1.appendChild(createListEle(createButton('substuff2', false, function(){
        event.stopPropagation();
    })));
    sub1.appendChild(createListEle(createButton('substuff3', false, function(){
        event.stopPropagation();
    })));
    sub1.appendChild(createDropDown(['None', '24h', 'Month', '6 Months', '12 Months']));
    var slider = document.createElement('input');
    slider.setAttribute('type', 'range');
    slider.setAttribute('class', 'slider');
    slider.setAttribute('min', '1');
    slider.setAttribute('max', '100');
    slider.setAttribute('value', '50');
    slider.addEventListener('click', function(event) {
        event.stopPropagation();
    });
    sub1.appendChild(slider);

    item2.addEventListener('click', function(event) {
        if (sub1.classList.contains('active')) {
            sub1.classList.remove('active');
            sub1.style.maxHeight = '0';
        } else {
            sub1.classList.add('active');
            sub1.style.maxHeight = 'None';
        }
        
    })
    item2.appendChild(sub1);
    menu.appendChild(item2);
    menu.appendChild(createListEle(createA('#', 'Future')));

    sidebar.appendChild(menu);

}

function initSideBar(container) {
    // border
    var border = document.createElement('div');
    border.setAttribute('class', 'topBorder');

    var sidebar = document.createElement('div');
    sidebar.setAttribute('id', 'sidebarMenu');
    sidebar.setAttribute('class', 'sidebar');
    document.body.appendChild(createButton('☰ Menu', 'menuBtn', function() {
        if (sidebar.style.width == '250px') {
            sidebar.style.width = '0px';
            container.style.marginLeft = '0';
            //container.style.left = '0px';
        } else {
            sidebar.style.width = '250px';
            container.style.marginLeft = '250px';
            //container.style.left = '250px';
        }

        // get container for everything else
        // create container, put webgl canvas inside, full size, and everything else
        // in the same div, overlay stuff
        //document.getElementById('menuButtonDiv').style.marginLeft = '250px';
        EventHandler.onWindowResize(container);
    }));

    createMenu(sidebar);
    document.body.appendChild(border);
    document.body.appendChild(sidebar);
}

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
    _transparency: 1.0,
    _displayGraph: function() {
        Visualization.displayGraph();
    },
    _splitBuilding: function() {
        Visualization.splitBuilding();
    }
    //_annotation: function() {
    //    Visualization.annotation();
    //}

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
                        DataHandler.getData(Geometry.apList, _timeDict[newValue]);
                    }
                    Visualization.setCurrentTime(_timeDict[newValue]);
                }).name('Time');
    _guiVis.add(_guiAttributes, '_colorMap').name('Color Map');
    _guiVis.add(_guiAttributes, '_pillarMap').name('Pillar Map');
    _guiVis.add(_guiAttributes, '_apSphere').name('AP\'s');
    _guiVis.add(_guiAttributes, '_displayGraph').name('Display Graph');
    //_guiVis.add(_guiAttributes, '_annotation').name('Annotate');
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
    _guiGeo.add(_guiAttributes, '_splitBuilding').name('Split Building');
    _guiGeo.open();

    var _guiScene = _gui.addFolder('Scene');
    _guiScene.add(_guiAttributes, '_switchLightning').name('Lighting');
    _guiScene.add(_guiAttributes, '_setBackground').name('Background');
    _guiScene.open();

}

export {initGui, initSideBar};