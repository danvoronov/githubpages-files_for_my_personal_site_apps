	<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="initial-scale=1.0, user-scalable=no">
    <meta charset="utf-8">
    <title>Simple Polylines</title>
<script src='https://code.jquery.com/jquery-1.11.0.min.js'></script>
<script src='https://api.mapbox.com/mapbox.js/v2.4.0/mapbox.js'></script>
<link href='https://api.mapbox.com/mapbox.js/v2.4.0/mapbox.css' rel='stylesheet' />

    <style>
      /* Always set the map height explicitly to define the size of the div
       * element that contains the map. */
      #map {
        height: 100%;
      }
      /* Optional: Makes the sample page fill the window. */
      html, body {
        height: 100%;
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script>

L.mapbox.accessToken = 'pk.eyJ1IjoiZGFuLXZvcm9ub3YiLCJhIjoiM2JDa0VjWSJ9.nWcRbwX0mEG9iFKQh8vseg';
var map = L.mapbox.map('map', 'mapbox.light')
    .setView([50.45,30.499], 10);

var myLayer = L.mapbox.featureLayer();

myLayer.loadURL('https://raw.githubusercontent.com/dankievua/kievfalafel/master/falafel.json')
    .on('ready', function(layer) {
	 
        this.eachLayer(function(marker) { 
	        
	        if (marker.toGeoJSON().properties.price > 0) 
        marker.setIcon(L.mapbox.marker.icon({ 
	        'marker-symbol': marker.toGeoJSON().properties.price, 
	         'marker-color': marker.toGeoJSON().properties['marker-color'] })); 
            
        if (marker.toGeoJSON().properties.state == '-') marker.setIcon(L.mapbox.marker.icon({ 'marker-size': 'small', 'marker-color': '#fff' }));
            
        else if (marker.toGeoJSON().properties.state == '0') marker.setIcon(L.mapbox.marker.icon({ 'marker-size': 'small', 'marker-color': '#888'}));     
        
        });                       
    })
    .addTo(map);


    </script>
  </body>
</html>