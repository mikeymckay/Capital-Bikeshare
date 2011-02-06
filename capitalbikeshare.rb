require 'rubygems'
require 'sinatra'
require 'nokogiri'
require 'open-uri'

get '/station/:identifier_type/:identifier' do |identifier_type, identifier|
  station = Nokogiri::XML(open('http://www.capitalbikeshare.com/stations/bikeStations.xml')).css("stations station #{identifier_type}:contains('#{identifier}')").first.parent
  template_data = {
    :header => station.css("name").first.content,
    :content => station.children.map{|e|e.name + ": " + e.content}.join("<br/>"),
    :footer => "# Bikes: #{station.css("nbBikes").first.content} # Docks: #{station.css("nbEmptyDocks")}"
  }
  jquery_mobile_template(template_data)
end

get '/' do
  stations = Nokogiri::XML(open('http://www.capitalbikeshare.com/stations/bikeStations.xml')).css("stations station name").map{|station|
    "<li><a href='station/terminalName/#{station.parent.css("terminalName").first.content}'>#{station.content}</a></li>"
  }.join
  stations = "<ul data-role='listview' data-filter='true' data-theme='g'>#{stations}</ul>"
  
  template_data = {
    :header => "Stations",
    :content => stations,
    :footer => ""
  }
  
  jquery_mobile_template(template_data)

end

def jquery_mobile_template(params)
  return <<EOF
<!DOCTYPE html> 
<html> 
	<head> 
	<title>Page Title</title> 
	<link rel='stylesheet' href='http://code.jquery.com/mobile/1.0a3/jquery.mobile-1.0a3.min.css' />
	<script type='text/javascript' src='http://code.jquery.com/jquery-1.4.3.min.js'></script>
	<script type='text/javascript' src='http://code.jquery.com/mobile/1.0a3/jquery.mobile-1.0a3.min.js'></script>
</head> 
<body> 

<div data-role='page'>

	<div data-role='header'>
		<h1>#{params[:header]}</h1>
	</div><!-- /header -->

	<div data-role='content'>	
  #{params[:content]}
	</div><!-- /content -->

	<div data-role='footer'>
		<h4>#{params[:footer]}</h4>
	</div><!-- /footer -->
</div><!-- /page -->

</body>
</html>
EOF
end
