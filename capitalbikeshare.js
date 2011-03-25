var FrequentStations, frequentStations, handleData, initializeMap, stationData, stationDataById;
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
      console.log(this.data);
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
    var frequency, result, sortedByPopularity, station, stationId;
    sortedByPopularity = this.data;
    result = "";
    for (stationId in sortedByPopularity) {
      frequency = sortedByPopularity[stationId];
      station = stationDataById[stationId];
      if (station != null) {
        result += "<li><a href='#" + stationId + "'>" + station.name + " (" + station.nbBikes + " bikes, " + (station.nbEmptyDocks || 0) + " docks) </a></li>";
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
    stationsList += "<li><a href='#" + station.id + "'>" + station.name + "</a></li>";
  }
  content = "";
  if (!frequentStations.empty()) {
    content += "<b>Your top viewed stations:</b><br/><br/><ul data-role='listview' data-theme='g'>" + frequentStations.sortedList() + "</ul><br/>";
  }
  content += "<b>All stations</b><br/><br/><ul data-role='listview' data-filter='true' data-theme='g'>" + stationsList + "</ul>";
  $('body').append(ich.jqueryMobilePageTemplate({
    pageId: "index",
    header: "Stations",
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
    $('body').append(ich.mapTemplate({
      "class": "station",
      pageId: "map",
      header: "map",
      footer: "<a data-role='button' href='#index'>Index</a>"
    }));
  }
  return $.mobile.initializePage();
});
$('.station_map').live("pagecreate", function() {
  if (navigator.geolocation) {
    return navigator.geolocation.getCurrentPosition(function(position) {
      return initializeMap(position.coords.latitude, position.coords.longitude);
    });
  }
});
initializeMap = function(lat, lng) {
  var latlng, map, myOptions;
  latlng = new google.maps.LatLng(lat, lng);
  myOptions = {
    zoom: 13,
    center: latlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  return map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
};
$('div').live('pageshow', function(event, ui) {
  var currentPageIndex;
  currentPageIndex = document.location.hash.substring(1);
  if (parseInt(currentPageIndex)) {
    return frequentStations.addStation(currentPageIndex);
  }
});