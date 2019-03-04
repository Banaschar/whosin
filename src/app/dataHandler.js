import * as ApData from './apData';

var _baseUrl = 'http://graphite-kom.srv.lrz.de/render/?target=';
var data = {};
var _ssid = ['eduroam', 'lrz', 'mwn-events', '@BayernWLAN', 'other'];
// TODO: Combine with data
var _timeListData = {};
var roomData = {};

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

    for (var i of res) {
        _tmp = i.split(",");

        _time = new Date(_tmp[1]);
        if (_time.getDay() > 0 && _time.getDay() < 6 && _time.getHours() > 7 && _time.getHours() < 18) {
            _timeListData[ap]["time"].push(_time);
            _timeListData[ap]["value"].push(Number(_tmp[_tmp.length - 1]) || 0)
        }


        //_tmp = (Number(_tmp[_tmp.length - 1]) || 0);
        //result.push(_tmp);
    }

    /*
    // old single value
    if (data.hasOwnProperty(time)) {
        data[time][ap] = result;
    } else {
        data[time] = {};
        data[time][ap] = result;
    }
    console.log(data[time][ap]);
    */
    //console.log(_timeListData[ap]);
    // Handle data per room
    calcPerRoom(ap);
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
    Calculate different values for all rooms. Call async when getting data
    Store in dict -> [time][room][data_type]
    data_type: Normalized, average, total, peak etc....
*/

/*
 * per Room average data for each day
 */
function calcPerRoom(ap) {
    for (var room of ApData.apRooms[ap]) {
        roomData[room] = avgPerDay(room);
    }
    //console.log(roomData[room]);
}

/*
 * Calculates the list of the average loads per day
 * With value a percentage of total average by room capacity compared to total
 */
function avgPerDay(room) {
    var ap = ApData.roomAp[room];
    var _perc = getRoomPercentage(ap, room);
    var curr = _timeListData[ap]["time"][0];
    var count = 0;
    var index = 0;
    var stepCount = 0;
    var max = 0;
    var result = {
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
            result["time"].push(curr);
            result["value"].push(count * _perc);
            result["max"].push(max * _perc);
            count = _timeListData[ap]["value"][index];
            max = count;
            curr = day;
            stepCount = 0;
        }
        index += 1;
    }
    // last day
    result["time"].push(curr);
    result["value"].push((count / stepCount) * _perc);
    result["max"].push(max * _perc);

    return result;
}

/*
 * Return the total average value for each day in the week as a list
*/
function totalAvgPerDay(room) {
    var res = [0, 0, 0, 0, 0];
    var res_avg = [0, 0, 0, 0, 0];
    var index = 0;
    for (var day of roomData[room]["time"]) {
        res[day.getDay() - 1] += roomData[room]["max"][index];
        res_avg[day.getDay() - 1] += 1;
        index += 1;
    }
    
    for (var i = 0; i < res.length; i++) {
        res[i] = res[i] / res_avg[i];
    }

    return res;
}

function cleanData(ap) {
    var _curr = _timeListData[ap][0][0].split(" ")[0];
    var _sum = 0;
    var _points = 0;
    var _max = 0;

    var _roomPerc = {}
    perDay[ap] = {};
    for (var croom of ApData.apRooms[ap]) {
        // get normalized room value by cap
        _roomPerc[croom] = getRoomPercentage(ap, croom);
        roomData[croom] = [];
    }

    for (var a of _timeListData[ap]) {
        if (a[0].split(" ")[0] === _curr) {
            _sum += a[1];
            _points += 1;
            _max = max(_max, a[1]);
        }
        else {
            //perDay[ap][_curr] = [_sum / points, _max];
            perDay[ap][_curr] = _sum / points;
            _sum = 0;
            _points = 0;
            _max = 0;
            _curr = a[0].split(" ")[0]
        }
    }

    hackKeys = Object.keys(perDay[ap]).sort(function(a ,b) {
        return Date.parse(a) > Date.parse(b);
    })
    // Get data per room here, or somewhere else?
    for (var key in _keys) {
        for (var c of ApData.apRooms[ap]) {
            roomData[croom].append(_roomPerc[c] * perDay[ap][key]);
        }
    }
    
}

/*
    Returns the capacity in regards to the total capacity of the ap
    in percent.
*/
function getRoomPercentage(ap, room) {
    var _sum = 0;
    for (var i of ApData.apRooms[ap]) {
        _sum += ApData.roomCap[i];
    }
    return ApData.roomCap[room] / _sum;
}

/*
    Get normalized value of percentage of average logins for specified room
*/
function getNormalized(room) {
    if (ApData.roomCap[room] === 0) {
        return 0;
    }
    var _ap = ApData.roomAp[room];

    var avg = roomData[room]["max"].reduce(
                function(a,b) {return a + b;}, 0) / roomData[room]["max"].length;
    var p = avg * getRoomPercentage(_ap, room);
    //console.log('Room: ' + room + '. Average: ' + avg + '. Room part: ' + p);
    // Normalize on room capacity
    return p / ApData.roomCap[room];
}

function hasData() {
    return Object.keys(roomData).length != 0;
}

export {data, getData, getNormalized, roomData, totalAvgPerDay, hasData};
