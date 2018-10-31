var _baseUrl = 'http://graphite-kom.srv.lrz.de/render/?target=';
var data = {};
var _ssid = ['eduroam', 'lrz', 'mwn-events', '@BayernWLAN', 'other'];

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

function getNormalized(time, ap) {
    var values = data[time][ap];
    var avg = values.reduce(function(a,b) {return a + b;}, 0) / values.length;
    var max = Math.max.apply(null, values);
    //console.log("Room: " + room + ". AVG: " + avg + ". MAX: " + max);
    return avg / max;
    //return values.reduce(function(a,b) {return a + b;}, 0) / Math.max.apply(null, values);
}

export {data, getData, getNormalized};
