import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
// import TileLayer from 'ol/layer/Tile';
import { OSM, TileDebug } from 'ol/source';
import { createStringXY } from 'ol/coordinate';
import MousePosition from 'ol/control/MousePosition';
import { ScaleLine, defaults as defaultControls } from 'ol/control';
import TileState from 'ol/TileState';

import proj4 from 'proj4';
import {Vector as VectorSource, XYZ} from 'ol/source';
import {GPX, GeoJSON, IGC, KML, TopoJSON} from 'ol/format';
import {
    DragAndDrop,
    defaults as defaultInteractions,
} from 'ol/interaction';
import {
    Tile as TileLayer,
    VectorImage as VectorImageLayer,
} from 'ol/layer';

document.getElementById("goButton").addEventListener("click", goButtonClicked)
document.getElementById("remove-vector").addEventListener("click", rmVectorButtonClicked)
document.getElementById("gotoHereButton").addEventListener("click", gotoHereButtonClicked)


var unitsSelect = document.getElementById('units');
var typeSelect = document.getElementById('type');
var stepsSelect = document.getElementById('steps');
var scaleTextCheckbox = document.getElementById('showScaleText');
var showScaleTextDiv = document.getElementById('showScaleTextDiv');
var searchType = document.getElementById('searchType');
var placeSearch = document.getElementById('search');
var urlInput = document.getElementById("wmts_url");

urlInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        goButtonClicked();
    }
});

placeSearch.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        gotoHereButtonClicked();
    }
});

var scaleType = 'scaleline';
var scaleBarSteps = 4;
var scaleBarText = true;
var control;
var mousePositionControl = new MousePosition({
    coordinateFormat: createStringXY(10),
    projection: 'EPSG:4326',
    // comment the following two lines to have the mouse position
    // be placed within the map.
    className: 'custom-mouse-position',
    target: document.getElementById('mouse-position'),
    undefinedHTML: '&nbsp;',
});
function scaleControl() {
    if (scaleType === 'scaleline') {
        control = new ScaleLine({
            units: unitsSelect.value,
        });
        return control;
    }
    control = new ScaleLine({
        units: unitsSelect.value,
        bar: true,
        steps: scaleBarSteps,
        text: scaleBarText,
        minWidth: 140,
    });
    return control;
}

var api_token = ""

function login_func(src) {
    var client = new XMLHttpRequest();
    client.open('POST', src, true);
    client.setRequestHeader('Content-Type', 'application/json');
    var json = {
        "email": "",
        "password": ""
    };

    // client.onreadystatechange = function () {
    //     if (client.readyState == XMLHttpRequest.DONE) {
    //         var body = client.responseText;
    //         var token = JSON.parse(body)['access_token'];
    //         // api_token = token;
    //         console.log(token)
    //         return token
    //     };
    // };

    client.send(JSON.stringify(json));
    var body = client.load;
    console.log('test');
    console.log(body);
}

function customLoader(tile, src) {
    var client = new XMLHttpRequest();
    client.open('GET', src, true);
    client.setRequestHeader("Authorization", "Bearer ***")//.concat(api_token))
    client.responseType = 'blob';
        client.addEventListener('loadend', function (evt) {
            var data = this.response;
            if (data !== undefined) {
                tile.getImage().src = URL.createObjectURL(data);
            } else {
                tile.setState(TileState.ERROR);
            }
        });
        client.send();
}

const dragAndDropInteraction = new DragAndDrop({
    formatConstructors: [GPX, GeoJSON, IGC, KML, TopoJSON],
});


var WMTS_URL = "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"

var PROD_WMTS_URL = "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"

var STG_WMTS_URL = "https://tile.opentopomap.org/{z}/{x}/{y}.png"

var xyz_layer, debug_layer, base_layer, vector_layer, place_coord, place_point, mapview

var layers = [
    base_layer = new TileLayer({
        source: new OSM(),
    }),
    // xyz_layer = new TileLayer({

    //     source:  new OSM({
    //         url: WMTS_URL,
    //         tileLoadFunction: customLoader
    //     }),
    //     opacity: 0.9,
    //     maxZoom: 25,
    // }),
    xyz_layer = new TileLayer({
        source: new OSM({
            url: WMTS_URL,
        }),
        opacity: 0.9,
        maxZoom: 25,
    }),

    debug_layer = new TileLayer({
        source: new TileDebug(),
    }),

];

var mapview = new View({
    center: [14960009.811130341, -3001695.7667663265],
    zoom: 4,
    minZoom: 0,
    maxZoom: 25
})

var map = new Map({
    interactions: defaultInteractions().extend([dragAndDropInteraction]),
    controls: defaultControls().extend([mousePositionControl, scaleControl()]),
    layers: layers,
    target: 'map',
    view: mapview,
});


var projectionSelect = document.getElementById('projection');
projectionSelect.addEventListener('change', function (event) {
    mousePositionControl.setProjection(event.target.value);
});

var precisionInput = document.getElementById('precision');
precisionInput.addEventListener('change', function (event) {
    var format = createStringXY(event.target.valueAsNumber);
    mousePositionControl.setCoordinateFormat(format);
});

var env_selector = document.getElementById('environment-select');
env_selector.addEventListener('change', function (event) {
    if (env_selector.value === "prod") {
        document.getElementById("wmts_url").value = PROD_WMTS_URL;
    } else if (env_selector.value === "stag") {
        document.getElementById("wmts_url").value = STG_WMTS_URL;
    } else {
        document.getElementById("wmts_url").value = '';
        document.getElementById("wmts_url").placeholder = "Your xyz link here"
    }


    goButtonClicked();
})

unitsSelect.addEventListener('change', function event() {
    control.setUnits(unitsSelect.value);
});

typeSelect.addEventListener('change', function event() {
    scaleType = typeSelect.value;
    if (typeSelect.value === 'scalebar') {
        stepsSelect.style.display = 'inline';
        showScaleTextDiv.style.display = 'inline';
        map.removeControl(control);
        map.addControl(scaleControl());
    } else {
        stepsSelect.style.display = 'none';
        showScaleTextDiv.style.display = 'none';
        map.removeControl(control);
        map.addControl(scaleControl());
    }
});

stepsSelect.addEventListener('change', function event() {
    scaleBarSteps = parseInt(stepsSelect.value, 10);
    map.removeControl(control);
    map.addControl(scaleControl());
}
);

scaleTextCheckbox.addEventListener('change', function event() {
    scaleBarText = scaleTextCheckbox.checked;
    map.removeControl(control);
    map.addControl(scaleControl());
});

searchType.addEventListener('change', function event() {
    console.log(searchType.value)
    if (searchType.value === "xyz") {
        placeSearch.placeholder = "Z/Y/X"
    } else if (searchType.value === "latlng") {
        placeSearch.placeholder = "lat,lng in EPSG:4326"
    } else {
        placeSearch.placeholder = "Address"
    }
})

function goButtonClicked() {
    map.removeLayer(xyz_layer)
    var wmts_url = document.getElementById("wmts_url").value;
    WMTS_URL = wmts_url
    xyz_layer = new TileLayer({
        source: new OSM({
            url: WMTS_URL,
            maxZoom: 25,
        }),
        opacity: 0.9
    })
    if (vector_layer) {
        map.removeLayer(vector_layer)
    }
    map.removeLayer(base_layer)
    map.removeLayer(debug_layer)
    map.addLayer(base_layer)
    map.addLayer(xyz_layer)
    map.addLayer(debug_layer)

    if (vector_layer) {
        map.addLayer(vector_layer)
    }

    console.log("goButtonClicked")
    console.log(WMTS_URL)
};

dragAndDropInteraction.on('addfeatures', function (event) {
    const vectorSource = new VectorSource({
      features: event.features,
    });
    if (vector_layer) {
        map.removeLayer(vector_layer)
    }
    vector_layer = new VectorImageLayer({
        source: vectorSource,
    })
    map.addLayer(
        vector_layer
    );
    map.getView().fit(vectorSource.getExtent());
});

function rmVectorButtonClicked() {
    if (vector_layer) {
        map.removeLayer(vector_layer)
        console.log("rmVectorButtonClicked")
    }
    vector_layer = null
};

function numToDeg(z, y, x) {
    x = parseFloat(x)
    y = parseFloat(y)
    z = parseFloat(z)
    console.log(x, y, z)
    var lng = x / Math.pow(2.0, z) * 360.0 -180.0
    var lat_radians = Math.atan(
        Math.sinh(
            Math.PI - (2.0 * Math.PI * y) / Math.pow(2.0, z)
        )
    )
    var lat = lat_radians * (180.0/Math.PI)
    return [lng, lat]
}

function gotoHereButtonClicked() {
    var place = null;
    var zoom = 15
    if (place_point) {
        map.removeLayer(place_point)
    }
    if (searchType.value === "xyz") {
        var zyx = placeSearch.value.trim().split("/");
        if (zyx.length != 3) {
            console.log('xyz should have 3 element')
            return
        }
        zoom = zyx[0]
        place = numToDeg(...zyx)
        // place = numToDeg(...xyz)
        // console.log(place)
    } else if (searchType.value === "latlng") {
        place = placeSearch.value.trim().split(",").reverse();
        if (place.length != 2) {
            console.log(place)
            console.log('latlng should have 2 element')
            return
        }
    } else {
        console.log(placeSearch.value);
        place = addressSearch(placeSearch.value)
        return
    }
    if (place) {
        console.log(place)
        updateView(place, zoom)
    }
    console.log(place)
};

function updateView(place, zoom=15) {
    place = [
        parseFloat(parseFloat(place[0]).toFixed(5)),
        parseFloat(parseFloat(place[1]).toFixed(5))
    ];

    place = proj4("EPSG:3857", place)
    map.setView(
        new View({
            center: place,
            zoom: zoom,
            projection:'EPSG:3857',
            maxZoom: 25
        })
    )
}

function addressSearch(query) {

    $.ajax({
        method: "GET",
        url: "https://nominatim.openstreetmap.org/search?q=" + query + "&format=json&limit=1",
    })
    .done(function( msg ) {
        console.log( msg );
        updateView([msg[0].lon, msg[0].lat], 18)
    });
}
