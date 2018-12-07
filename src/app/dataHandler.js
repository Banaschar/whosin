import * as ApData from './apData';

var _baseUrl = 'http://graphite-kom.srv.lrz.de/render/?target=';
var data = {};
var _ssid = ['eduroam', 'lrz', 'mwn-events', '@BayernWLAN', 'other'];
// TODO: Combine with data
var _timeListData = {};

/*
    Parses data and stores in [date,logins] pair list
    - Right now only for graph display
    TODO: Refactor to combine with the implementation in _handleSuccess
*/
function _parseData(csv, time, ap) {
    var timeList = [];
    var _tmp;
    for (var i of csv) {
        _tmp = i.split(",");
        timeList.push([_tmp[1], (Number(_tmp[_tmp.length - 1]) || 0)]);
    }

    if (_timeListData.hasOwnProperty(time)) {
        _timeListData[time][ap] = result;
    } else {
        _timeListData[time] = {};
        _timeListData[time][ap] = timeList;
    }
}

function _handleSuccess() {
    //this.callback.apply(this, this.arguments);
    console.log("Success: " + this.arguments[0]);
    var ap = this.arguments[0];
    var time = this.arguments[1];
    var res = this.responseText.split("\n");
    var result = [];
    var _tmp;
    for (var i of res) {
        _tmp = i.split(",");
        _tmp = (Number(_tmp[_tmp.length - 1]) || 0);
        if (_tmp > 1) {
            result.push(_tmp);
        }
    }

    if (data.hasOwnProperty(time)) {
        data[time][ap] = result;
    } else {
        data[time] = {};
        data[time][ap] = result;
    }
    console.log(data[time][ap]);
}

function _handleError() {
    console.error(this.statusText);
}

function _doRequest(url, ap, timeframe) {
    var req = new XMLHttpRequest();
    req.arguments = Array.prototype.slice.call(arguments, 1);
    req.onload = _handleSuccess;
    req.onerror = _handleError;
    //console.log(url);
    req.open("GET", url, true);
    req.send(null);
}

function _buildRequest(ap, timeframe) {

    return `http://graphite-kom.srv.lrz.de/render/?target=alias(sumSeries(
                    ap.${ap}.ssid.eduroam, 
                    ap.${ap}.ssid.lrz, 
                    ap.${ap}.ssid.mwn-events, 
                    ap.${ap}.ssid.@BayernWLAN, 
                    ap.${ap}.ssid.other), %22${ap}%22)&format=csv&from=${timeframe}`;

}

function getData(ap, timeframe) {
    var url = _buildRequest(ap, timeframe);
    _doRequest(url, ap, timeframe);
}

// Difficult, because I don't have per-room data. Still not enough data points which
// room belongs to which ap
/*
function getNormalizedCapacity(time, ap) {
    var values
}


function getNormalized(time, ap) {
    var values = data[time][ap];
    var avg = values.reduce(function(a,b) {return a + b;}, 0) / values.length;
    var max = Math.max.apply(null, values);
    //console.log("Room: " + room + ". AVG: " + avg + ". MAX: " + max);
    return avg / max;
    //return values.reduce(function(a,b) {return a + b;}, 0) / Math.max.apply(null, values);
}
*/

/*
    Get normalized value of percentage of average logins for specified room
*/
function getNormalized(time, room) {
    if (ApData.roomCap[room] === 0) {
        return 0;
    }

    var _ap = ApData.roomAp[room];

    var _sum = 0;
    for (var i of ApData.apRooms[_ap]) {
        _sum += ApData.roomCap[i];
    }
    var _perc = ApData.roomCap[room] / _sum;
    var avg = data[time][_ap].reduce(
                function(a,b) {return a + b;}, 0) / data[time][_ap].length;
    var p = avg * _perc;
    //console.log('Room: ' + room + '. Average: ' + avg + '. Room part: ' + p);
    return p / ApData.roomCap[room];
}

export {data, getData, getNormalized};
