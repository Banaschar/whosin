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
 * TODO: Make sure all elements are li items
 */
function createMenu(sidebar, assetList) {
    var menu = document.createElement('ul');
    menu.setAttribute('class', 'mainmenu');
    
    //menu.appendChild(createListEle(createA('#', 'Visual')));

    /* Time Select Elements */
    var b = document.createElement('b');
    b.innerHTML = 'Time frame: ';
    menu.appendChild(b);
    menu.appendChild(createDropDown(['None', '24h', 'Month', '6 Months', '12 Months'], 
        ['None', '-24h', '-1month', '-6months', '-12months'], 'timeSelect', getData));
    var loadM = document.createElement('b');
    loadM.innerHTML = 'Building: ';
    menu.appendChild(loadM);
    assetList.unshift('None');
    menu.appendChild(createDropDown(assetList, assetList, 'modelSelect', getModel));

    /* Menu items */
    var item2 = createListEle(createA('#', 'Data per Room'));
    var sub1 = document.createElement('ul');
    sub1.setAttribute('class', 'submenu');
    sub1.appendChild(createListEle(createButton('Avg. per Day', false, function(event) {
        if (!event) {
            event = window.event;
        }
        event.stopPropagation();
        var text = 'Average Room usage in percent of room capacity';
        viewConcept1('room', 'value', text);
    })));
    sub1.appendChild(createListEle(createButton('Avg. max. per Day', false, function(){
        if (!event) {
            event = window.event;
        }
        event.stopPropagation();
        var text = 'Average Max. Room usage in percent of room capacity';
        viewConcept1('room', 'max', text);
    })));
    sub1.appendChild(createListEle(createButton('Graph3', false, function(){
        if (!event) {
            event = window.event;
        }
        event.stopPropagation();
    })));
    sub1.appendChild(createDropDown(['None'], ['None'], 'floorDropdown', function() {
        floorView('room');
    }));
    
    var slider = document.createElement('input');
    slider.setAttribute('type', 'range');
    slider.setAttribute('class', 'slider');
    slider.setAttribute('min', '0.1');
    slider.setAttribute('max', '1.0');
    slider.setAttribute('step', '0.1')
    slider.setAttribute('value', '1.0');
    slider.setAttribute('id', 'transparencySlider');
    slider.addEventListener('click', function(event) {
        if (!event) {
            event = window.event;
        }
        event.stopPropagation();
    });
    slider.addEventListener('change', changeTransparency);
    sub1.appendChild(slider);

    item2.addEventListener('click', function() {
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
    var item3 = createListEle(createA('#', 'Data per Ap'));
    var sub2 = document.createElement('ul');
    sub2.setAttribute('class', 'submenu');
    sub2.appendChild(createListEle(createButton('Avg. per Day', false, function(event) {
        if (!event) {
            event = window.event;
        }
        event.stopPropagation();
        var text = 'Average Room usage in percent of Access Point capacity';
        viewConcept1('ap', 'value', text);
    })));
    sub2.appendChild(createListEle(createButton('Avg. max. per Day', false, function(){
        if (!event) {
            event = window.event;
        }
        event.stopPropagation();
        var text = 'Average Max. Room usage in percent of Access Point capacity';
        viewConcept1('ap', 'max', text);
    })));
    sub2.appendChild(createDropDown(['None'], ['None'], 'floorDropdown2', function() {
        floorView('ap');
    }));
    item3.addEventListener('click', function() {
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

    var item4 = createListEle(createA('#', 'Current total'));
    item4.addEventListener('click', function() {
        Visualization.displayCurrentGraph('ap', 'Current total', _container);
    })
    menu.appendChild(item4);
    var item5 = createListEle(createA('#', 'Current per room'));
    item5.addEventListener('click', function() {
        Visualization.displayCurrentGraph('room', 'Current per room', _container);
    })
    menu.appendChild(item5);
    var item6 = createListEle(createA('#', 'Access Points'));
    item6.addEventListener('click', displayAccessPoints);
    menu.appendChild(item6);

    sidebar.appendChild(menu);

}

function initSideBar(container, assetList) {
    // border
    _container = container;
    var border = document.createElement('div');
    border.setAttribute('class', 'topBorder');
    border.setAttribute('id', 'statusBar');

    var sidebar = document.createElement('div');
    sidebar.setAttribute('id', 'sidebarMenu');
    sidebar.setAttribute('class', 'sidebar');
    document.body.appendChild(createButton('☰ Menu', 'menuBtn', function() {
        if (sidebar.style.width === '250px') {
            sidebar.style.width = '0px';
            container.style.left = '0px';
            // change by adding right: 0 
            container.style.width = window.innerWidth + 'px';
            //document.getElementById('barGraph').style.left = '0px'; 
        } else {
            sidebar.style.width = '250px';
            container.style.left = '250px';
            container.style.width = (window.innerWidth - 250) + 'px';
            //document.getElementById('barGraph').style.left = '250px'; 
        }

        // get container for everything else
        // create container, put webgl canvas inside, full size, and everything else
        // in the same div, overlay stuff
        //document.getElementById('menuButtonDiv').style.marginLeft = '250px';
        EventHandler.onWindowResize(container);
    }));

    createMenu(sidebar, assetList);
    document.body.appendChild(border);
    document.body.appendChild(sidebar);
}


/* Visualization Concepts
 * Map to menu buttons
 */
var activeConcepts = {
    'concept1': false,
    'floors': false
};

function viewConcept1(type, value, title) {
    if (DataHandler.hasData()) {
        Visualization.makeTransparent('all', 0.3);
        Visualization.colorMap(type, value, 'None');
        console.log(_container.style.left);
        Visualization.displayGraph(type, value, title, _container);
        // TODO: Camera angle
        // TODO: 2D view
    } else {
        EventHandler.statusMessage('Keine Daten verfügbar', 'error');
    }
}

function floorView(type) {
    var drop = document.getElementById('floorDropdown');
    var floor = drop.options[drop.selectedIndex].value;
    Visualization.hideFloors(floor);
    if (DataHandler.hasData()) {
        Visualization.pillarMap(type, 'max', floor);
        // TODO: camera angle
    } else {
        EventHandler.statusMessage('Keine Daten verfügbar', 'error');
    }
}

function changeTransparency() {
    var value = document.getElementById('transparencySlider').value;
    Visualization.makeTransparent('all', value);
}

function getData() {
    var time = timeSelect.options[timeSelect.selectedIndex].value;
    if (time !== 'None') {
        DataHandler.getData(Geometry.apList, time);
    }
}

function displayAccessPoints() {
    Visualization.apSphere();
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


export {initSideBar, updateMenu};