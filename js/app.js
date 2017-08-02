//favorite addresses
var favouriteAddress = [
    {title: 'Ain-Shams University', address: {lat: 30.076262, lng: 31.286101}, description: 'Ain Shams University is an institute of higher education located in Cairo, Egypt. Founded in 1950, the university provides education at the undergraduate, graduate and post-graduate levels', img: 'img/ain-shams.png'},
    {title: 'El Nour Mosque', address: {lat: 30.075259, lng: 31.282926}, description: 'muslims pray here', img: 'img/elnour.jpg'},
    {title: 'North Cairo Elementary Court', address: {lat: 30.072288, lng: 31.287775}, description: 'the place where the criminals judged', img: 'img/court.jpg'},
    {title: 'Computer science', address: {lat: 30.078267, lng: 31.284932}, description: 'this where i studying', img: 'img/computer science.png'},
    {title: 'Ain Shams University Specialized Hospital', address: {lat: 30.076633, lng: 31.290264}, description: 'the place where Treatment of a patient', img: 'img/hospital.png'}
];

var filteredaddress = ko.observableArray([]);
var markers = ko.observableArray([]);

//Google Map
function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 30.076262, lng: 31.286101},
        zoom: 15
    });
    
    //marker
        function pushMarker(id, position, title) {
            var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            id: id,
            icon: 'img/marker.png'
        });
        markers.push(marker);
        marker.addListener('click', function () {
        InfoWindowModel(this, largeInfowindow);
        });
    }
    
       for (var i = 0; i < favouriteAddress.length; i++) {
        var position = favouriteAddress[i].address;
        var title = favouriteAddress[i].title;
        pushMarker(i, position, title);
    }
    // infowindow
    var largeInfowindow = new google.maps.InfoWindow();
}

function mapError() {
    $('.mapError').addClass('display-block');
}

function InfoWindowModel(marker, infowindow) {
    
    if (infowindow.marker != marker) {
        infowindow.marker = marker;
        //Wikipedia request
        var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&format=json&callback=wikiCallback';
        var url;
        //error
        var wikiRequestTimeout = setTimeout(function() {
            $wikiElem.text("failed to get wikipedia resources");
        }, 8000);

        $.ajax({
            url: wikiUrl,
            dataType: "jsonp",          
            success: function(response) {
                var articleList = response[0];
                var url = 'http://en.wikipedia.org/wiki/' + articleList[0];
                if(!url.includes('undefined')) {
                    infowindow.setContent('<div class="infowindow"> <img src="' + favouriteAddress[marker.id].img + ' "/> <h3> ' + marker.title + ' </h3> <p> ' + favouriteAddress[marker.id].description + ' </p> <a href="' + url + ' "> ' + marker.title + ' <span> Wikipedia </span> </a> </div> ');
                }
                else {
                    infowindow.setContent('<div class="infowindow"> <img src="' + favouriteAddress[marker.id].img + '"/> <h3>' + marker.title + '</h3> <p>' + favouriteAddress[marker.id].description + '</p> </div>');
                }
                clearTimeout(wikiRequestTimeout);
            }
        });
        infowindow.open(map, marker);
        marker.setAnimation(google.maps.Animation.DROP);
        infowindow.addListener('closeclick', function () {
        infowindow.setMarker(null);
        }
    );}
}

//viewModel
var viewModel = {
    filteredaddress: ko.observableArray(favouriteAddress),
    keywords: ko.observable(''),
    init: function() {
        if ($(window).width() < 600) {
            viewModel.collapse();
        }
        $(window).on('resize', function () {
            var windowWidth = $(window).width();
            if (windowWidth < 600) {
                viewModel.collapse();
            }
        });
    },
    toggle: function() {
        $('.addresses').toggleClass('collapse');
    },
    collapse: function() {
        $('.addresses').addClass('collapse');
    },
    filter: function(value) {
    //new filtered locations
        for (var i = 0; i < favouriteAddress.length; i++) {
            if (!favouriteAddress[i].title.toLowerCase().includes(viewModel.keywords().toLowerCase())) {
                markers()[i].setVisible(false);
            } else {
                markers()[i].setVisible(true);
            }
        }
        viewModel.filteredaddress([]);
        for (var j = 0; j < favouriteAddress.length; j++) {
            if(favouriteAddress[j].title.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                viewModel.filteredaddress.push(favouriteAddress[j]);
            }
        }
    },
    info: function(title) {
        var favouriteMarkers = markers();
        for (var i = 0; i < favouriteMarkers.length; i++){
            if(favouriteMarkers[i].title === title) {
                google.maps.event.trigger(markers()[i], 'click');
            }
        }
    }
};

viewModel.init();
ko.applyBindings(viewModel);
viewModel.keywords.subscribe(viewModel.filter);