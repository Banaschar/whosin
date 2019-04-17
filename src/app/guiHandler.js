import * as dat from "dat.gui";
import * as Visualization from "./visualization";
import * as Geometry from "./geometry";
import * as SceneHandler from "./sceneHandler";
import * as DataHandler from './dataHandler';
import * as EventHandler from './eventHandler';
import '../css/style.css';

var _container;

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

function createDropDown(optionsText, optionsValues, id, changeFunction) {
    var select = document.createElement('select');
    select.setAttribute('id', id);
    var tmp;
    for (var i = 0; i < optionsText.length; i++) {
        select.options.add(new Option(optionsText[i], optionsValues[i]));
    }
    select.addEventListener('click', function(event) {
        if (!event) {
            event = window.event;
        }
        event.stopPropagation();
    });
    select.addEventListener('change', changeFunction);
    return select;
}

/* 
 * Create Menu
 * Add additional buttons / submenus here
 */
function createMenu(sidebar, assetList) {
    var menu = document.createElement('ul');
    menu.setAttribute('class', 'mainmenu');
    
    menu.appendChild(createListEle(createDropDown(['Choose Time', '24h', 'Month', '6 Months', '12 Months'], 
        ['None', '-24h', '-1month', '-6months', '-12months'], 'timeSelect', getAPData)));
    assetList.unshift('Choose Model');
    menu.appendChild(createListEle(createDropDown(assetList, assetList, 'modelSelect', getModel)));

    /* SUB MENU 1 CREATION */
    var item2 = createListEle(createA('#', '&#9658 Data per Room'));
    var sub1 = document.createElement('ul');
    sub1.setAttribute('class', 'submenu');
    sub1.appendChild(createListEle(createButton('Avg. per Day', false, function(event) {
        if (!event) {
            event = window.event;
        }
        event.stopPropagation();
        var text = 'Average Room usage in percent. Normalized on room capacity';
        viewConcept1('roomCap', 'value', text);
    })));
    sub1.appendChild(createListEle(createButton('Avg. max. per Day', false, function(event){
        if (!event) {
            event = window.event;
        }
        event.stopPropagation();
        var text = 'Average max. room usage in percent. Normalized on room capacity';
        viewConcept1('roomCap', 'max', text);
    })));
    sub1.appendChild(createDropDown(['None'], ['None'], 'floorDropdown', function(event) {
        floorView('roomCap', 'floorDropdown');
    }));

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

    /* SUB MENU 2 CREATION */
    var item3 = createListEle(createA('#', '&#9658 Data per AP'));
    var sub2 = document.createElement('ul');
    sub2.setAttribute('class', 'submenu');
    sub2.appendChild(createListEle(createButton('Avg. per Day', false, function(event) {
        if (!event) {
            event = window.event;
        }
        event.stopPropagation();
        var text = 'Average Room usage in percent. Total AP value';
        viewConcept1('total', 'value', text);
    })));
    sub2.appendChild(createListEle(createButton('Avg. max. per Day', false, function(event){
        if (!event) {
            event = window.event;
        }
        event.stopPropagation();
        var text = 'Average max. room usage in percent. Total AP value';
        viewConcept1('total', 'max', text);
    })));
    sub2.appendChild(createDropDown(['None'], ['None'], 'floorDropdown2', function(event) {
        floorView('total', 'floorDropdown2');
    }));
    item3.addEventListener('click', function(event) {
        if (sub2.classList.contains('active')) {
            sub2.classList.remove('active');
            sub2.style.maxHeight = '0';
        } else {
            sub2.classList.add('active');
            sub2.style.maxHeight = 'None';
        }
        
    })
    item3.appendChild(sub2);
    menu.appendChild(item3);

    /* ---------- END SUBMENU CREATION -----------*/

    /* Additional menu elements */
    var item4 = createListEle(createA('#', 'Current total'));
    item4.addEventListener('click', function(event) {
        var data = new Graph2(new DataFormat('room', 'current', 'total'),
                            'Current absolut connections, total of AP', 'heat');
        Visualization.applyVisualization(data);
    })
    menu.appendChild(item4);
    var item5 = createListEle(createA('#', 'Current per room'));
    item5.addEventListener('click', function(event) {
        var data = new Graph2(new DataFormat('room', 'current', 'roomCap'),
                            'Current absolut connections, normalized on capacity', 'heat');
        Visualization.applyVisualization(data);
    })
    menu.appendChild(item5);
    var item6 = createListEle(createA('#', 'AP <-> Rooms'));
    item6.addEventListener('click', displayAccessPoints);
    menu.appendChild(item6);

    var item7 = createListEle(createA('#', 'Clear all'));
    item7.addEventListener('click', Visualization.clearAll);
    menu.appendChild(item7);

    var slider = document.createElement('input');
    slider.setAttribute('type', 'range');
    slider.setAttribute('class', 'slider');
    slider.setAttribute('min', '0.1');
    slider.setAttribute('max', '1.0');
    slider.setAttribute('step', '0.1')
    slider.setAttribute('value', '1.0');
    slider.setAttribute('id', 'transparencySlider');
    slider.setAttribute('title', 'Set transparency');
    slider.addEventListener('click', function(event) {
        if (!event) {
            event = window.event;
        }
        event.stopPropagation();
    });
    slider.addEventListener('change', changeTransparency);
    menu.appendChild(slider);

    /* Add created menus to sidebar */
    sidebar.appendChild(menu);
}

/*
 * Initialize sidebar and graph container
 */ 
function initSideBar(container, assetList) {
    // border
    _container = container;
    var border = document.createElement('div');
    border.setAttribute('class', 'topBorder');
    border.setAttribute('id', 'statusBar');

    var sidebar = document.createElement('div');
    sidebar.setAttribute('id', 'sidebarMenu');
    sidebar.setAttribute('class', 'sidebar');
    document.body.appendChild(createButton('☰ Menu', 'menuBtn', function(event) {
        if (sidebar.style.width === '200px') {
            sidebar.style.width = '0px';
            container.style.left = '0px';
            container.style.width = window.innerWidth + 'px';
        } else {
            sidebar.style.width = '200px';
            container.style.left = '200px';
            container.style.width = (window.innerWidth - 200) + 'px';
        }

        EventHandler.onWindowResize(container);
    }));

    createMenu(sidebar, assetList);
    document.body.appendChild(border);
    document.body.appendChild(sidebar);

    var graphContainer = document.createElement('div');
    graphContainer.setAttribute('class', 'graphContainer');
    var graph1 = document.createElement('div');
    var graph2 = document.createElement('div');
    graph1.setAttribute('class', 'graphMain');
    graph2.setAttribute('class', 'graphMain');
    graph1.setAttribute('id', 'graph1');
    graph2.setAttribute('id', 'graph2');
    graphContainer.appendChild(graph1);
    graphContainer.appendChild(graph2);

    container.appendChild(graphContainer);
}




var state = {
    'concept1': false,
    'floors': false,
    'dataType': 'roomCap',
    'dataValue': 'value'
};

function getCurrentState() {
    return state;
}

/*
 * Use to build data object to call Visualization.applyVisualization
 * The object has the format:
 * { 
 *   dataFormat: optional, can be used by all following visualizations
 *   visualizations: own parameters
 * }
 * visualizations are: graph, colormap, pillarmap etc. 
 * Some of them can use their own dataFormat, if you want to display for example
 * two graphs with differen data formats
 */
 function DataObject(dataFormat, args) {
    this.dataFormat = dataFormat;
    for (var i of args) {
        Object.assign(this, i);
    }
 }

function DataFormat(entity, dataType, dataValue) {
    this.entity = entity;
    this.dataType = dataType;
    this.dataValue = dataValue;
}

function Graph1(dataFormat, title, colorType) {
    this.graph1 = { 'dataFormat': dataFormat,
                    'title': title,
                    'colorType': colorType
                };
}

function Graph2(dataFormat, title, colorType) {
    this.graph2 = { 'dataFormat': dataFormat,
                    'title': title,
                    'colorType': colorType
                };
}

function ColorMap(dataFormat) {
    this.colorMap = { 'dataFormat': dataFormat };
}

function PillarMap(dataFormat, floor) {
    this.pillarMap = { 'dataFormat': dataFormat,
                        'floor': floor
                    };
}

function APsphere(bool) {
    this.apSphere = {'draw': bool}
}

function MakeTransparent(area, opac) {
    this.makeTransparent = { 'area': area,
                             'opac': opac
                            };
}

function HideFloors(floor) {
    this.hideFloors = { 'floor': floor };
}

/*-----------------------------------*/ 
 /*
 * Visualization Concepts
 * Map to menu buttons
 */
/*-----------------------------------*/

/* 
 * Used example view concept:
 * Displays colormap and graph based on total AP data or room capacity dependant data
 */
function viewConcept1(dataType, dataValue, title) {
    if (DataHandler.hasData()) {
        var max;
        if (dataValue === 'max') {
            max = ' max.';
        } else { max = ''; }
        var graph2title = 'Avg.' + max + ' AP utilization in percent of supported capacity'

        var baseData = new DataFormat('room', dataType, dataValue);
        var graph2data = new DataFormat('ap', null, dataValue);
        var dataObj = new DataObject(baseData, [new MakeTransparent('all', 0.3),
                        new ColorMap(null),
                        new Graph1(null, title, 'heat'),
                        new Graph2(graph2data, graph2title, 'ap')]);
        Visualization.applyVisualization(dataObj);
        state.dataType = dataType;
        state.dataValue = dataValue;
    } else {
        EventHandler.statusMessage('No data available', 'error');
    }
}

function floorView(dataType, menu) {
    var drop = document.getElementById(menu);
    var floor = drop.options[drop.selectedIndex].value;
    
    if (DataHandler.hasData()) {
        var data = new DataObject(new DataFormat('room', dataType, state.dataValue), 
            [new HideFloors(floor),
             new PillarMap(null, floor)]);
        
    } else {
        EventHandler.statusMessage('No data available', 'error');
    }
    Visualization.applyVisualization(data);
}

function changeTransparency() {
    var value = document.getElementById('transparencySlider').value;
    Visualization.applyVisualization(new MakeTransparent('all', value));
}

function getAPData() {
    var time = timeSelect.options[timeSelect.selectedIndex].value;
    if (time !== 'None') {
        DataHandler.getData(Geometry.apList, time);
    }
    Visualization.clearAll();
    state.dataType = 'roomCap';
    state.dataValue = 'value';
}

function displayAccessPoints() {
    var data = new DataObject(new DataFormat('ap', null, 'value'),     
                [new APsphere(true),
                 new Graph2(null, 'Avg. AP utiliation in percent of supported capacity', 'ap')]);
    Visualization.applyVisualization(data);
}

function getModel() {
    var d = document.getElementById('modelSelect');
    var a = d.options[d.selectedIndex].value;
    var assetUrl = window.location.protocol + '//' + window.location.host + 
            '/getAsset/' + a;
    console.log('Asset URL: ' + assetUrl);
    Geometry.loadZip(assetUrl);
}

/* Called when new model has been loaded */
function updateMenu(roomList) {

    // Update menu floor dropdown
    var drop = document.getElementById('floorDropdown');
    var drop2 = document.getElementById('floorDropdown2');
    while (drop.options.length) {
        drop.remove(0);
        drop2.remove(0);
    }
    drop.options.add(new Option('None', 'None'));
    drop2.options.add(new Option('None', 'None'));
    for (var opt of Object.keys(roomList)) {
        drop.options.add(new Option('Etage ' + opt, opt));
        drop2.options.add(new Option('Etage ' + opt, opt));
    }
}

var _timeDict = {
    '24h': '-24h',
    'week': '-8days',
    'month': '-1month',
    '6 months': '-6months'
}


export {initSideBar, updateMenu, getCurrentState};