'use strict';

var restaurants = [
	{
		name: 'Pavarotti Milano',
		addr: '4° piano Piazza Duomo, 21 20121 Milano Italia',
		lat: 45.464826,
		long: 9.18957 	
	},
	{
		name: 'Bys Milano',
		addr: 'Via Alberico Albricci, 3 20122 Milano Italia',
		lat: 45.465454,
		long: 9.186516 	
	},
	{
		name: 'Seafood Bar Milano',
		addr: 'Via Luisa Battistotti Sassi, 11 I-20133 Milano Italia',
		lat: 45.463005,
		long: 9.227596 	
	},
	{
		name: 'Folk',
		addr: 'Via Magolfa, 25 20143 Milano Italia',
		lat: 45.449705,
		long: 9.174445 	
	},
	{
		name: 'Savini Tartufi Truffle Restaurant',
		addr: 'Viale Monte Grappa, 12 - Presso Hotel NH (Palazzo Moscova) 20124 Milano Italia',
		lat: 45.480968,
		long: 9.189977 	
	},
];

var map;

var Restaurant = function(data) {
	var self = this;
	this.name = data.name;
	this.addr = data.addr;
	this.lat = data.lat;
	this.long = data.long;
	
	this.visible = ko.observable(true);

	this.infoWindow = new google.maps.InfoWindow({content: self.contentString});
	
	//create the marker
	this.marker = new google.maps.Marker({
			position: new google.maps.LatLng(data.lat, data.long),
			map: map,
			title: data.name
	});
	
	//show the marker
	this.showMarker = ko.computed(function() {
		if(this.visible() === true) {
			this.marker.setMap(map);
		} else {
			this.marker.setMap(null);
		}
		return true;
	}, this);
	
	//add click listener -> show InfoWindow
	this.marker.addListener('click', function(){
		self.contentString = 	'<div class="info-window-content"><div class="title"><b>' + data.name + '</b></div>' +
								'<div class="content">' + data.addr + '</div>' +
								'</div>';

        self.infoWindow.setContent(self.contentString);
		self.infoWindow.open(map, this);
	});
}

function ViewModel() {
	var self = this;

    this.searchTerm = ko.observable("");

    this.restaurants = ko.observableArray([]);

    //center map to Milan, Italy
	map = new google.maps.Map(document.getElementById('map'), {
	  center: {lat: 45.465454, lng: 9.186516},
	  zoom: 12
	});
	
	restaurants.forEach(function(restaurant){
		self.restaurants.push( new Restaurant(restaurant));
	});

	//apply search filter hiding unwanted restaurant
    this.filteredList = ko.computed( function() {
        var searchString = self.searchTerm().toLowerCase();
        return ko.utils.arrayFilter(self.restaurants(), function(restaurant) {
            var string = restaurant.name.toLowerCase();
            var result = (string.search(searchString) >= 0);
            restaurant.visible(result);
            return result;
        });
    }, self);
}

function initApp() {
	ko.applyBindings(new ViewModel());
}

function onError() {
	alert("Failed to load Milan restaurants map. Try again.");
}