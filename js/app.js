/*global google */
/*global $ */
/*global ko */
/*global swal */
/*global sweetAlert */

var restaurants = [
    {
        id: "54ea6352498ed06013b15573",
        name: "Risoelatte",
        lat: 45.466602,
        long: 9.183237
    },
    {
        id: "519167e6454a090dc94f5358",
        name: "Bys Milano",
        lat: 45.46107881317024,
        long: 9.189484119415283
    },
    {
        id: "55984f26498e9a82a9f22999",
        name: "Seafood Bar Milano",
        lat: 45.449944831559115,
        long: 9.179983988963892
    },
    {
        id: "4c4ec76bdb2c20a13639f274",
        name: "De Pasajo",
        lat: 45.457473,
        long: 9.172913
    },
    {
        id: "585c53b3ea1c0d57643629a1",
        name: "Savini Tartufi Truffle Restaurant",
        lat: 45.480972,
        long: 9.189986
    }
];

var map;
var clientId = "KB05ZIGSOYUH3S2PU4LNZDMAVT3IOP1J5ND0XKOFS05Q0K5C";
var secret = "UA24WDSBDYXEQQMO3GFLKJ0SS0KOLKGI1V2M4OVTYK4QWDTD";
var secretDate = "20170101";
var foursquareError = false;

var Restaurant = function(data) {
    var self = this;
    this.id = data.id;
    this.name = data.name;

    this.lat = data.lat;
    this.long = data.long;

    this.visible = ko.observable(true);

    var URL = "https://api.foursquare.com/v2/venues/" + data.id + "?client_id=" + clientId + "&client_secret=" + secret + "&v=" + secretDate;

    $.getJSON(URL, function (retData) {
        var ret = retData.response.venue;
        self.addr = ret.location.formattedAddress[0] + ", " + ret.location.formattedAddress[1];
        self.phone = ret.contact.phone;
        self.price = ret.price.message;
    })
    .fail(function() {
        sweetAlert("Oops...", "Couldn't get address, phone number and price category from foursquare.com. You could use this web site with reduced functionality or retry later.", "error");
        foursquareError = true;
    });

    this.infoWindow = new google.maps.InfoWindow({content: self.contentString});

    //create the marker
    this.marker = new google.maps.Marker({
            position: new google.maps.LatLng(data.lat, data.long),
            map: map,
            title: data.name,
            animation: null
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

        if (self.marker.getAnimation() !== null) {
            self.marker.setAnimation(null);
        } else {
            self.marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                self.marker.setAnimation(null);
            }, 2000);
        }

        self.contentString = '<div class="info-window-content"><div class="title"><b>' + data.name + '</b></div>';

        if(self.addr !== undefined)
            self.contentString += '<div class="content">' + self.addr + '</div>';

        if(self.phone !== undefined)
            self.contentString += '<div class="content">' + self.phone + '</div>';

        if(self.price !== undefined)
            self.contentString += '<div class="content">' + self.price + '</div>';

        self.contentString += '</div>';

        self.infoWindow.setContent(self.contentString);
        self.infoWindow.open(map, this);
    });
};

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
        var r = new Restaurant(restaurant);
        self.restaurants.push(r);
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

    //add clicked element marker animation
    this.itemClicked = function(index, event) {
        google.maps.event.trigger(event.marker, 'click');
    };
}

function initApp() {
    ko.applyBindings(new ViewModel());
}

function onMapsError() {
    $(".app").hide();

    swal({
        title: "Oops...",
        text: "Couldn't get Google Maps data. Retry later.",
        type: "error",
        showConfirmButton: false
    });
}