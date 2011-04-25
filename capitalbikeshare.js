var FrequentStations, frequentStations, handleData, stationData, stationDataById;
$(document).bind("mobileinit", function() {
  return $.mobile.autoInitialize = false;
});
stationData = {};
stationDataById = {};
handleData = function(data) {
  var station, _i, _len, _results;
  stationData = data.query.results.stations.station;
  _results = [];
  for (_i = 0, _len = stationData.length; _i < _len; _i++) {
    station = stationData[_i];
    _results.push(stationDataById[station.id] = station);
  }
  return _results;
};
FrequentStations = (function() {
  function FrequentStations() {
    this.data = $.cookie("frequent_stations");
    if (this.data) {
      this.data = JSON.parse(this.data);
    } else {
      this.data = {};
    }
  }
  FrequentStations.prototype.empty = function() {
    return this.data === {};
  };
  FrequentStations.prototype.save = function() {
    return $.cookie("frequent_stations", JSON.stringify(this.data), {
      expires: 28
    });
  };
  FrequentStations.prototype.addStation = function(stationId) {
    if (this.data[stationId]) {
      this.data[stationId]++;
    } else {
      this.data[stationId] = 1;
    }
    return this.save();
  };
  FrequentStations.prototype.sortedList = function() {
    var frequency, result, station, stationFrequencyArray, stationId, stationsSortedByFrequency, _i, _len;
    stationFrequencyArray = (function() {
      var _ref, _results;
      _ref = this.data;
      _results = [];
      for (stationId in _ref) {
        frequency = _ref[stationId];
        _results.push({
          stationId: stationId,
          frequency: frequency
        });
      }
      return _results;
    }).call(this);
    stationsSortedByFrequency = _.sortBy(stationFrequencyArray, function(station) {
      return -station.frequency;
    });
    result = "";
    for (_i = 0, _len = stationsSortedByFrequency.length; _i < _len; _i++) {
      station = stationsSortedByFrequency[_i];
      station = stationDataById[station.stationId];
      if (station != null) {
        if (station != null) {
          result += "<li><a href='#" + station.id + "'>" + station.nbBikes + " <small>bikes</small> " + (station.nbEmptyDocks || 0) + " <small>docks</small> " + station.name + " </a></li>";
        }
      }
    }
    return result;
  };
  return FrequentStations;
})();
frequentStations = new FrequentStations();
$(document).ready(function() {
  var content, station, stationsList, _i, _j, _len, _len2;
  stationsList = "";
  for (_i = 0, _len = stationData.length; _i < _len; _i++) {
    station = stationData[_i];
    stationsList += ("<li id='station" + station.id + "'><a href='#") + station.id + "'>" + station.name + "</a></li>";
  }
  content = "";
  if (!frequentStations.empty()) {
    content += "<b>Your top viewed stations:</b><br/><br/><ul data-role='listview' data-theme='g'>" + frequentStations.sortedList() + "</ul><br/>";
  }
  content += "<b>All stations</b> <small>(sorted by distance when possible)</small><br/><br/><ul id='allStationsByDistance' data-role='listview' data-filter='true' data-theme='g'>" + stationsList + "</ul>";
  $('body').append(ich.jqueryMobilePageTemplate({
    pageId: "index",
    header: "<a data-inline='true' data-role='button' rel='external' href='map.html'>Map</a>",
    content: content,
    footer: ""
  }));
  for (_j = 0, _len2 = stationData.length; _j < _len2; _j++) {
    station = stationData[_j];
    $('body').append(ich.jqueryMobilePageTemplate({
      "class": "station",
      pageId: station.id,
      header: station.name,
      content: ich.stationTemplate(station).html(),
      footer: "<a data-role='button' href='#index'>Index</a>"
    }));
  }
  return $.mobile.initializePage();
});
$('div').live('pageshow', function(event, ui) {
  var currentPageIndex;
  currentPageIndex = document.location.hash.substring(1);
  if (parseInt(currentPageIndex)) {
    frequentStations.addStation(currentPageIndex);
  }
  if (navigator.geolocation) {
    return navigator.geolocation.getCurrentPosition(function(position) {
      var newElement, station, stationsByDistance, _i, _len, _results;
      stationsByDistance = _.sortBy(stationData, function(station) {
        return -distance(position.coords.latitude, station.lat, position.coords.longitude - station.long);
      });
      _results = [];
      for (_i = 0, _len = stationsByDistance.length; _i < _len; _i++) {
        station = stationsByDistance[_i];
        newElement = $("#station" + station.id).clone();
        $("#station" + station.id).remove();
        _results.push($('#allStationsByDistance').prepend(newElement.html()));
      }
      return _results;
    });
  }
});