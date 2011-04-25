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
    # convert from collection to array
    stationFrequencyArray = ({stationId, frequency} for stationId, frequency of @data)
    stationsSortedByFrequency = _.sortBy stationFrequencyArray, (station) ->
      -station.frequency
    result = ""
    for station in stationsSortedByFrequency
      station = stationDataById[station.stationId]
      if station?
        result += "<li><a href='##{station.id}'>#{station.nbBikes} <small>bikes</small> #{station.nbEmptyDocks||0} <small>docks</small> #{station.name} </a></li>" if station?
    return result

frequentStations = new FrequentStations()

$(document).ready( ->
# Make index page
  stationsList = ""
  for station in stationData
    stationsList += "<li id='station#{station.id}'><a href='#"+station.id+"'>"+station.name+"</a></li>"

  content = ""
  content += "<b>Your top viewed stations:</b><br/><br/><ul data-role='listview' data-theme='g'>"+frequentStations.sortedList()+"</ul><br/>" unless frequentStations.empty()
  content +="<b>All stations</b> <small>(sorted by distance when possible)</small><br/><br/><ul id='allStationsByDistance' data-role='listview' data-filter='true' data-theme='g'>"+stationsList+"</ul>"

  $('body').append(ich.jqueryMobilePageTemplate({
    pageId: "index",
    header: "<a data-inline='true' data-role='button' rel='external' href='map.html'>Map</a>",
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

  # Allow jquery mobile to convert all of our divs into jquery mobile pages
  $.mobile.initializePage()
)


$('div').live('pageshow', (event, ui) ->
  currentPageIndex = document.location.hash.substring(1)
  frequentStations.addStation(currentPageIndex) if parseInt(currentPageIndex)

  if navigator.geolocation
    navigator.geolocation.getCurrentPosition (position) ->
      stationsByDistance = _.sortBy stationData, (station) ->
        return -distance(position.coords.latitude, station.lat, position.coords.longitude - station.long)
      for station in stationsByDistance
        newElement = $("#station#{station.id}").clone()
        $("#station#{station.id}").remove()
        $('#allStationsByDistance').prepend(newElement.html())

)
