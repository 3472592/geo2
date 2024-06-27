/* myLoc.js */

var watchId = null;
var map = null;

var prevCoords = null;

window.onload = getMyLocation;

function getMyLocation() {
	//buttons to activate what we want from our map
	if (navigator.geolocation) {
		var watchButton = document.getElementById("watch");
		watchButton.onclick = watchLocation;
		var clearWatchButton = document.getElementById("clearWatch");
		clearWatchButton.onclick = clearWatch;
	}
	else {
		alert("Oops, no geolocation support");
	}
}

function displayLocation(position) {
	var latitude = position.coords.latitude;
	var longitude = position.coords.longitude;

	var div = document.getElementById("location");
	div.innerHTML = "You are at Latitude: " + latitude + ", Longitude: " + longitude;
	div.innerHTML += " (with " + position.coords.accuracy + " meters accuracy)";

	if (map == null) { // if have not called showMap, call it otherwise no need to call it everytime displayLocation is called
		showMap(position.coords);
		prevCoords = position.coords;
	}
	else {
		var meters = computeDistance(position.coords, prevCoords) * 1000;
		if (meters > 20) {
			scrollMapToPosition(position.coords);
			prevCoords = position.coords;
		}
	}
}

// ------------------ End Ready Bake -----------------

function showMap(coords) {
								//google.mapsprocedes all methods of Google Maps API
	var googleLatAndLong = new google.maps.LatLng(coords.latitude, coords.longitude);
								//constructor, takes lat and long, returns new obj that hold both
	var mapOptions = {
		zoom: 10,
		center: googleLatAndLong,
		mapTypeId: google.maps.MapTypeId.SATELLITE
	};
	var mapDiv = document.getElementById("map");
	map = new google.maps.Map(mapDiv, mapOptions); //grabbing map div and pass it mapOptions to Map constructor to create google map obj. it displays map on the page
	//Map creates and returns map obj

	// add the user marker
	var title = "Your Location";
	var content = "You are here: " + coords.latitude + ", " + coords.longitude;
	addMarker(map, googleLatAndLong, title, content); // passing objects that were created with GM API, title string and content 
}

// this funct takes a map long and lat a title for the marker and content for info window
function addMarker(map, latlong, title, content) {
	var markerOptions = { // creating obj for the function
		position: latlong,
		map: map,
		title: title,
		clickable: true
	};
	// marker obj by using another constructor from GM API and pass it fresh brand new obj.
	var marker = new google.maps.Marker(markerOptions);

	var infoWindowOptions = {
		content: content,
		position: latlong
	};

	var infoWindow = new google.maps.InfoWindow(infoWindowOptions); // creates info window

	// passing listener  funct that activates when user clicks on marker
	// the using addListener method to add listener for click event it is like a handler like onload/onclick
	google.maps.event.addListener(marker, 'click', function() {
		infoWindow.open(map); // opens info when clicked on marker the function is called to show the content on the map
	});
}


function displayError(error) {
	var errorTypes = {
		0: "Unknown error",
		1: "Permission denied",
		2: "Position is not available",
		3: "Request timeout"
	};
	var errorMessage = errorTypes[error.code];
	if (error.code == 0 || error.code == 2) {
		errorMessage = errorMessage + " " + error.message;
	}
	var div = document.getElementById("location");
	div.innerHTML = errorMessage;
}

//
// Code to watch the user's location
//
function watchLocation() {
	watchId = navigator.geolocation.watchPosition(
					displayLocation, 
					displayError);
}

function scrollMapToPosition(coords) {
	var latitude = coords.latitude;
	var longitude = coords.longitude;

	var latlong = new google.maps.LatLng(latitude, longitude);
	map.panTo(latlong);

	// add the new marker
	addMarker(map, latlong, "Your new location", "You moved to: " + 
								latitude + ", " + longitude);
}

function clearWatch() {
	if (watchId) {
		navigator.geolocation.clearWatch(watchId); // stops the watching 
		watchId = null;
	}
}
