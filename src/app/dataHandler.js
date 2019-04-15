import * as Conf from './conf';
import {statusMessage} from './eventHandler';

var _baseUrl = 'http://graphite-kom.srv.lrz.de/render/?target=';
var data = {};
var _ssid = ['eduroam', 'lrz', 'mwn-events', '@BayernWLAN', 'other'];
// TODO: Combine with data
var _timeListData = {};
var roomDataperAP = {};
var avgPerDay = {};
var _current = {};
var _loadingManager;
var _numRequests;

function _handleSuccess() {
    //this.callback.apply(this, this.arguments);
    console.log("Success: " + this.arguments[0]);
    var ap = this.arguments[0];
    var timeRange = this.arguments[1];
    var res = this.responseText.split("\n");
    var result = [];
    var _tmp;
    // HACKY, REMOVE AND COMBINE
    var _tmp2 = [];
    var _time;
    _timeListData[ap] = {
        "time": [],
        "value": [],
    }
    var last;
    for (var i of res) {
        _tmp = i.split(",");

        _time = new Date(_tmp[1]);
        if (_time.getDay() > 0 && _time.getDay() < 6 && _time.getHours() > 7 && _time.getHours() < 18) {
            _timeListData[ap]["time"].push(_time);
            last = Number(_tmp[_tmp.length - 1]) || 0
            _timeListData[ap]["value"].push(last)
        }
    }
    _current[ap] = last;

    // calc Data per day
    calcAvgPerDay(ap);
    --_numRequests;
    console.log(_numRequests);
    if (_numRequests === 0) {
        statusMessage('All Data loaded', 'status');
    }
}

function _handleError() {
    console.error(this.statusText);
    statusMessage('Error loading Data', 'error');
}

function _prog(oEvent) {
    console.log(oEvent.loaded / oEvent.total * 100);
}

function _doRequest(url, ap, timeframe) {
    var req = new XMLHttpRequest();
    req.arguments = Array.prototype.slice.call(arguments, 1);
    req.onload = _handleSuccess;
    req.onerror = _handleError;
    //req.onprogress = _loadingManager.onProgress;
    req.open("GET", url, true);
    req.send(null);
}

function _buildURLrest(ap, timeframe) {
    return window.location.protocol + '//' + window.location.host +
            '/getData/' + _buildURL(ap, timeframe); 
}

function _buildURL(ap, timeframe) {

    return `http://graphite-kom.srv.lrz.de/render/?target=alias(sumSeries(ap.${ap}.ssid.eduroam, ap.${ap}.ssid.lrz, ap.${ap}.ssid.mwn-events, ap.${ap}.ssid.@BayernWLAN, ap.${ap}.ssid.other), %22${ap}%22)&format=csv&from=${timeframe}`;

}

/*
 *  Get data from access points
 *  aps: [String] - Access Point names, see lrz apstat
 *  timeframe: String
 */
function getData(aps, timeframe) {
    //_loadingManager.setup('Loading Access Point data...', 'data');
    _numRequests = Object.keys(aps).length;
    for (var ap in aps) {
        //var url = _buildURLrest(ap, timeframe);
        var url = _buildURL(ap, timeframe);
        console.log(url);
        _doRequest(url, ap, timeframe);
    }
}

/*
 * Calculate average loads per day for each AP
 */
function calcAvgPerDay(ap) {
    var curr = _timeListData[ap]["time"][0];
    var count = 0;
    var index = 0;
    var stepCount = 0;
    var max = 0;
    var resultAp = {
        "time": [],
        "value": [],
        "max": [],
    };

    for (var day of _timeListData[ap]["time"]) {
        if (day.getDay() === curr.getDay()) {
            count += _timeListData[ap]["value"][index];
            max = Math.max(max, _timeListData[ap]["value"][index])
            stepCount += 1;
        }
        else {
            count = count / stepCount;
            resultAp["time"].push(curr);
            resultAp["value"].push(count);
            resultAp["max"].push(max);
            count = _timeListData[ap]["value"][index];
            max = count;
            curr = day;
            stepCount = 0;
        }
        index += 1;
    }
    // last day
    resultAp["time"].push(curr);
    resultAp["value"].push(count / stepCount);
    resultAp["max"].push(max);
    avgPerDay[ap] = resultAp;
}

/*
 * Return the total average value for each day in the week as a list
 * As a percentage of the room capacity
*/
function totalAvgPerDay(room) {
    var ap = Conf.getRoomAp(room);
    var perc = getRoomPercentage(room);
    var res = [0, 0, 0, 0, 0];
    var res_avg = [0, 0, 0, 0, 0];
    var index = 0;
    for (var day of avgPerDay[ap]["time"]) {
        res[day.getDay() - 1] += avgPerDay[ap]["max"][index] * perc;
        res_avg[day.getDay() - 1] += 1;
        index += 1;
    }
    
    for (var i = 0; i < res.length; i++) {
        res[i] = res[i] / res_avg[i];
    }

    return res;
}

function getApCapacity(ap) {
    var _sum = 0;
    for (var i of Conf.getApRooms(ap)) {
        _sum += Conf.getRoomCapacity(i);
    }
    return _sum;
}

/*
    Returns the capacity in regards to the total capacity of the ap
    in percent.
*/
function getRoomPercentage(room) {
    return Conf.getRoomCapacity(room) / getApCapacity(Conf.getRoomAp(room));
}


function getPerAP(room) {
    var avg = avgPerDay[Conf.getRoomAp(room)]["max"].reduce(
                function(a,b) {return a + b}, 0) / avgPerDay[Conf.getRoomAp(room)]["max"].length;
    return avg / getApCapacity(Conf.getRoomAp(room));
}

/*  
 * Get normalized data per room
 */
function getRoomData(room, dataType, valueType) {
    if (Conf.getRoomCapacity(room) === 0) {
        return 0;
    }
    var ap = Conf.getRoomAp(room);

    switch(dataType) {
        case 'roomCap':
            var avg = (getRoomPercentage(room) * avgPerDay[ap][valueType].reduce(
                        function(a,b) {return a + b;}, 0)) / avgPerDay[ap][valueType].length;
            return avg / Conf.getRoomCapacity(room);
            break;
        case 'total':
            var avg = avgPerDay[ap][valueType].reduce(
                    function(a,b) {return a + b}, 0) / avgPerDay[ap][valueType].length;
            return avg / Conf.getRoomCapacity(room);
            break;
        case 'current':
            console.log('Current: ' + _current[Conf.getRoomAp(room)]);
            if (valueType === 'roomCap') {
                return _current[Conf.getRoomAp(room)] * getRoomPercentage(room);
            } else {
                return _current[Conf.getRoomAp(room)];
            }
            break;
        default:
            statusMessage('Wrong Graph type', 'error');
            console.log('Type: ' + dataType + ' not valid');
            break;
    }
}

function getAPdata(ap, valueType) {
    return (avgPerDay[ap][valueType].reduce(function(a,b) {return a + b}, 0) /
            avgPerDay[ap][valueType].length) / getApCapacity(ap);
}

function hasData() {
    return Object.keys(avgPerDay).length != 0;
}

export {data, getData, getRoomData, getAPdata,
        getCurrentTotal, totalAvgPerDay, hasData, initDataHandler};
