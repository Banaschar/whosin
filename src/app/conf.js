var _conf;
const SUPP = "AccessPointSupport";
const CAP = "RoomCapacity";
const SIZE = "RoomSize";
const COLOR = "ColorMap";
const BARGRAPH = "BarGraph";
const BOUNDARIES = 'DataTimeBounds';

function getRoomCapacity(room) {
    return _conf[CAP][room];
}

function getRoomSize(room) {
    return _conf[SIZE][room];
}

function getRoomAp(room) {
    for (var _ap in _conf[SUPP]) {
        if (_conf[SUPP][_ap].includes(room)) {
            return _ap;
        }
    }
    return 0
}

function getApRooms(ap) {
    return _conf[SUPP][ap];
}

function setConfig(conf) {
    _conf = conf;
}

function getColors() {
    return _conf[COLOR];
}

function getBarGraphConf() {
    return _conf[BARGRAPH];
}

function getDayBoundaries() {
    return _conf[BOUNDARIES];
}

export {getRoomCapacity, getRoomAp, getApRooms,
        getDayBoundaries, setConfig, getColors}