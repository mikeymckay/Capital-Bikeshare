# Stop Jquery from converting the dom before we are ready
$(document).bind("mobileinit", ->
  $.mobile.autoInitialize = false
)

stationData = {}
stationDataById = {}

handleData = (data) ->
  stationData = data.query.results.stations.station
  stationDataById[station.id]=station for station in stationData

class FrequentStations
  constructor: ->
    #$.cookie("frequent_stations","")
    @data = $.cookie("frequent_stations")
    if @data
      console.log @data
      @data = JSON.parse(@data)
    else
      @data = {}

   empty: ->
     @data is {}

  save: ->
    $.cookie("frequent_stations", JSON.stringify(@data), { expires: 28})

  addStation: (stationId) ->
    if @data[stationId]
      @data[stationId]++
    else
      @data[stationId] = 1
    @save()

  sortedList: () ->
    # todo sorting
    sortedByPopularity = @data
    result = ""
    for stationId, frequency of sortedByPopularity
      station = stationDataById[stationId]
      result += "<li><a href='##{stationId}'>#{station.name} (#{station.nbBikes} bikes, #{station.nbEmptyDocks||0} docks) </a></li>" if station?
    return result

frequentStations = new FrequentStations()

$(document).ready( ->
# Make index page
  stationsList = ""
  for station in stationData
    stationsList += "<li><a href='#"+station.id+"'>"+station.name+"</a></li>"

  content = ""
  content += "<b>Your top viewed stations:</b><br/><br/><ul data-role='listview' data-theme='g'>"+frequentStations.sortedList()+"</ul><br/>" unless frequentStations.empty()
  content +="<b>All stations</b><br/><br/><ul data-role='listview' data-filter='true' data-theme='g'>"+stationsList+"</ul>"

  $('body').append(ich.jqueryMobilePageTemplate({
    pageId: "index",
    header: "Stations",
    content: content,
    footer: ""
  }))

  # Make station pages
  for station in stationData
    $('body').append(ich.jqueryMobilePageTemplate({
      "class": "station",
      pageId: station.id,
      header: station.name,
      content: ich.stationTemplate(station).html(),
      footer: "<a data-role='button' href='#index'>Index</a>"
    }))

  # Make map page
    $('body').append(ich.mapTemplate({
      "class": "station",
      pageId: "map",
      header: "map",
      footer: "<a data-role='button' href='#index'>Index</a>"
    }))

  # Allow jquery mobile to convert all of our divs into jquery mobile pages
  $.mobile.initializePage()
)

# When map page opens get location and display map
$('.station_map').live("pagecreate", ->
  if navigator.geolocation
    navigator.geolocation.getCurrentPosition((position) ->
      initializeMap(position.coords.latitude,position.coords.longitude)
    )
)

initializeMap = (lat,lng) ->
  latlng = new google.maps.LatLng(lat, lng)
  myOptions = {
    zoom: 13,
    center: latlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  }

  map = new google.maps.Map(document.getElementById("map_canvas"),myOptions)


$('div').live('pageshow', (event, ui) ->
  currentPageIndex = document.location.hash.substring(1)
  frequentStations.addStation(currentPageIndex) if parseInt(currentPageIndex)
)
