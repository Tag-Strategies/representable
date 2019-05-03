/******************************************************************************/

// GEO Js file for handling map drawing.
/* https://docs.mapbox.com/mapbox-gl-js/example/mapbox-gl-draw/ */
// Polygon Drawn By User
var ideal_population_LOWER = {
  "nj": 109899,
  "va": 80010,
  "pa": 62573,
  "mi": 89851
};

var ideal_population_UPPER = {
  "nj": 219797,
  "va": 200026,
  "pa": 254048,
  "mi": 260096
};

var ideal_population_CONG = {
  "nj": 710767,
  "va": 710767,
  "pa": 710767,
  "mi": 710767
};

var wkt_obj;
// Formset field object saves a deep copy of the original formset field object.
// (If user deletes all fields, he can add one more according to this one).
var formsetFieldObject;
// flags
// var user_poly_defined;
// var count_user_poly = 0;
// var count_census_poly = 0
// var census_poly_defined;
// used to call a function
// var drawn_polygon;
// var mpolygon = [];


/******************************************************************************/
// Make buttons show the right skin.
document.addEventListener('DOMContentLoaded', function() {
    var conditionRow = $('.form-row:not(:last)');
    conditionRow.find('.btn.add-form-row')
        .removeClass('btn-outline-success').addClass('btn-outline-danger')
        .removeClass('add-form-row').addClass('remove-form-row')
        .html('<span class="" aria-hidden="true">Remove</span>');
}, false);

/******************************************************************************/

// Initialize the Map
/* eslint-disable */
var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/streets-v11', //hosted style id
    center: [-74.65545, 40.341701], // starting position - Princeton, NJ :)
    zoom: 12 // starting zoom
});

var layerList = document.getElementById('menu');
var inputs = layerList.getElementsByTagName('input');


function switchLayer(layer) {
    var layerId = layer.target.id;
    map.setStyle('mapbox://styles/mapbox/' + layerId);
}

for (let i = 0; i < inputs.length; i++) {
    inputs[i].onclick = switchLayer;
}

var geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken
});

/* tutorial reference for draw control properties:
https://bl.ocks.org/dnseminara/0790e53cef9867e848e716937727ab18
*/
var draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
        polygon: true,
        trash: true
    },
    styles: [
        {
            'id': 'gl-draw-polygon-fill-inactive',
            'type': 'fill',
            'filter': ['all', ['==', 'active', 'false'],
                ['==', '$type', 'Polygon'],
                ['!=', 'mode', 'static']
            ],
            'paint': {
                'fill-color': '#3bb2d0',
                'fill-outline-color': '#3bb2d0',
                'fill-opacity': 0.1
            }
        },
        {
            'id': 'gl-draw-polygon-fill-active',
            'type': 'fill',
            'filter': ['all', ['==', 'active', 'true'],
                ['==', '$type', 'Polygon']
            ],
            'paint': {
                'fill-color': '#4a69bd',
                'fill-outline-color': '#4a69bd',
                'fill-opacity': 0.5
            }
        },
        {
            'id': 'gl-draw-polygon-stroke-inactive',
            'type': 'line',
            'filter': ['all', ['==', 'active', 'false'],
                ['==', '$type', 'Polygon'],
                ['!=', 'mode', 'static']
            ],
            'layout': {
                'line-cap': 'round',
                'line-join': 'round'
            },
            'paint': {
                'line-color': '#3bb2d0',
                'line-width': 2
            }
        },
        {
            'id': 'gl-draw-polygon-stroke-active',
            'type': 'line',
            'filter': ['all', ['==', 'active', 'true'],
                ['==', '$type', 'Polygon']
            ],
            'layout': {
                'line-cap': 'round',
                'line-join': 'round'
            },
            'paint': {
                'line-color': '#fbb03b',
                'line-dasharray': [0.2, 2],
                'line-width': 2
            }
        },
        {
            'id': 'gl-draw-line-inactive',
            'type': 'line',
            'filter': ['all', ['==', 'active', 'false'],
                ['==', '$type', 'LineString'],
                ['!=', 'mode', 'static']
            ],
            'layout': {
                'line-cap': 'round',
                'line-join': 'round'
            },
            'paint': {
                'line-color': '#3bb2d0',
                'line-width': 2
            }
        },
        {
            'id': 'gl-draw-line-active',
            'type': 'line',
            'filter': ['all', ['==', '$type', 'LineString'],
                ['==', 'active', 'true']
            ],
            'layout': {
                'line-cap': 'round',
                'line-join': 'round'
            },
            'paint': {
                'line-color': '#fbb03b',
                'line-dasharray': [0.2, 2],
                'line-width': 2
            }
        }, // basic tools - default settings
        {
            'id': 'gl-draw-polygon-and-line-vertex-stroke-inactive',
            'type': 'circle',
            'filter': ['all', ['==', 'meta', 'vertex'],
                ['==', '$type', 'Point'],
                ['!=', 'mode', 'static']
            ],
            'paint': {
                'circle-radius': 5,
                'circle-color': '#fff'
            }
        },
        {
            'id': 'gl-draw-polygon-and-line-vertex-inactive',
            'type': 'circle',
            'filter': ['all', ['==', 'meta', 'vertex'],
                ['==', '$type', 'Point'],
                ['!=', 'mode', 'static']
            ],
            'paint': {
                'circle-radius': 3,
                'circle-color': '#fbb03b'
            }
        },
        {
            'id': 'gl-draw-point-point-stroke-inactive',
            'type': 'circle',
            'filter': ['all', ['==', 'active', 'false'],
                ['==', '$type', 'Point'],
                ['==', 'meta', 'feature'],
                ['!=', 'mode', 'static']
            ],
            'paint': {
                'circle-radius': 5,
                'circle-opacity': 1,
                'circle-color': '#fff'
            }
        },
        {
            'id': 'gl-draw-point-inactive',
            'type': 'circle',
            'filter': ['all', ['==', 'active', 'false'],
                ['==', '$type', 'Point'],
                ['==', 'meta', 'feature'],
                ['!=', 'mode', 'static']
            ],
            'paint': {
                'circle-radius': 3,
                'circle-color': '#3bb2d0'
            }
        },
        {
            'id': 'gl-draw-point-stroke-active',
            'type': 'circle',
            'filter': ['all', ['==', '$type', 'Point'],
                ['==', 'active', 'true'],
                ['!=', 'meta', 'midpoint']
            ],
            'paint': {
                'circle-radius': 7,
                'circle-color': '#fff'
            }
        },
        {
            'id': 'gl-draw-point-active',
            'type': 'circle',
            'filter': ['all', ['==', '$type', 'Point'],
                ['!=', 'meta', 'midpoint'],
                ['==', 'active', 'true']
            ],
            'paint': {
                'circle-radius': 5,
                'circle-color': '#fbb03b'
            }
        }
    ]

});

// create the custom event
/* inspired from: https://gomakethings.com/custom-events-with-vanilla-javascript/ */

// var highlight = function (elem) {

//     elem.classList.add('highlights');

//     // Create a new event
//     var event = new CustomEvent('highlight');

//     // Dispatch the event
//     elem.dispatchEvent(event);

// };

// dispatch event
// var document.getElementById("map").dispatchEvent(event);
// highlight(map);
// initialize the progress bar with pop data
// document.getElementById("ideal-pop").innerHTML = ideal_population_LOWER['nj'];

map.addControl(geocoder, 'top-right');
// Add controls outside of map.
// Source: https://github.com/mapbox/mapbox-gl-draw/blob/master/docs/API.md
map.addControl(draw);
// Insert class into draw buttons so we can differentiate their styling from
// from the nav buttons below.
drawControls = document.querySelector(".draw_polygon_map .mapboxgl-ctrl-group");
drawControls.className += " draw-group";
// Add nav control buttons.
map.addControl(new mapboxgl.NavigationControl());

/* Change mapbox draw button */
var drawButton = document.getElementsByClassName("mapbox-gl-draw_polygon");
drawButton[0].backgroundImg = '';
drawButton[0].innerHTML = "<i class='fas fa-draw-polygon'></i> Draw Polygon";
var trashButton = document.getElementsByClassName("mapbox-gl-draw_trash");
trashButton[0].backgroundImg = '';
trashButton[0].innerHTML = "<i class='fas fa-trash-alt'></i> Delete Polygon";


var polygonError = document.getElementById("polygon_missing");
if (polygonError != null) {
    document.getElementById("map").classList.add("border");
    document.getElementById("map").classList.add("border-warning");
}

/******************************************************************************/


// map.addEventListener('highlighted', highlightBlocks);
// how to trigger the event?

/******************************************************************************/


// After the map style has loaded on the page, add a source layer and default
// styling for a single point.
map.on('style.load', function() {
    map.addSource('single-point', {
        "type": "geojson",
        "data": {
            "type": "FeatureCollection",
            "features": []
        }
    });

    map.addSource("census", {
        type: "vector",
        url: "mapbox://districter-team.aq1twwkc"
      });

    map.addLayer({
    "id": "census-blocks",
    "type": "fill",
    "source": "census",
    "source-layer": "njblockdata",
    "layout": {
        "visibility": "visible"
    },
    "paint": {
        "fill-color": "rgba(200, 100, 240, 0)",
        "fill-outline-color": "rgba(200, 100, 240, 0)"
    }
    });

    // a line so that thickness can be changed
    map.addLayer({
      "id": "census-lines",
      "type": "line",
      "source": "census",
      "source-layer": "njblockdata",
      "layout": {
        "visibility": "visible",
        "line-join": "round",
        "line-cap": "round"
      },
      "paint": {
        "line-color": "rgba(71, 93, 204, 0.25)",
        "line-width": 1
      }
    });

    map.addLayer({
        "id": "blocks-highlighted",
        "type": "fill",
        "source": "census",
        "source-layer": "njblockdata",
        "paint": {
        "fill-outline-color": "#1e3799",
        "fill-color": "#4a69bd",
        "fill-opacity": 0.7
        },
        "filter": ["in", "BLOCKID10", ""]
        });


    map.addLayer({
        "id": "point",
        "source": "single-point",
        "type": "circle",
        "paint": {
            "circle-radius": 10,
            "circle-color": "#007cbf"
        }
    });
    map.on('click', 'Census Blocks', function (e) {
        new mapboxgl.Popup({
            closeButton: false
        })
        .setLngLat(e.lngLat)
        .setHTML(e.features[0].properties.BLOCKID10)
        .addTo(map);
      });

    // Listen for the `geocoder.input` event that is triggered when a user
    // makes a selection and add a symbol that matches the result.
    geocoder.on('result', function(ev) {
        map.getSource('single-point').setData(ev.result.geometry);
        var styleSpec = ev.result;
        var styleSpecBox = document.getElementById('json-response');
        var styleSpecText = JSON.stringify(styleSpec, null, 2);
        var syntaxStyleSpecText = syntaxHighlight(styleSpecText);
        styleSpecBox.innerHTML = syntaxStyleSpecText;

    });
});

var wasLoaded = false;
map.on('render', function() {
    if (!map.loaded() || wasLoaded) return;
    wasLoaded = true;
    if (document.getElementById('id_user_polygon').value !== '') {
        // If page refreshes (or the submission fails), get the polygon
        // from the field and draw it again.
        var feature = document.getElementById('id_user_polygon').value;
        var wkt = new Wkt.Wkt();
        wkt_obj = wkt.read(feature);
        var geoJsonFeature = wkt_obj.toJson();
        var featureIds = draw.add(geoJsonFeature);
        updateCommunityEntry();
    }

});

// map.on('idle', triggerFunc);
// map.on('dataloading', triggerFunc2);

/******************************************************************************/

map.on('draw.create', updateCommunityEntry);
map.on('draw.delete', updateCommunityEntry);
map.on('draw.update', updateCommunityEntry);


/******************************************************************************/

// function triggerFunc(e) {
//     // console.log(user_polygon_wkt);
//     // has to be a global var
//     // debugger
//     // create a custom event and c
//     if (user_poly_defined !== undefined && count_user_poly > 0) {
//         // console.log("polygon drawn and now do something");
//         console.log(count_user_poly);
//         count_user_poly = 0;
//         mpolygon = highlightBlocks();
//         console.log(count_user_poly);

//         // debugger

//         // if (census_poly_defined !== undefined && count_census_poly > 0) {
//         //     count_census_poly = 0;
//         //     mergeBlocks(mpolygon);

//         //     // mergeBlocks(mpolygon);

//         //     // console.log("highlight polygons now that the filter returns something");
//         // }
//     }

// }


// function triggerFunc2(e) {
//     // console.log(user_polygon_wkt);
//     // has to be a global var
//     // debugger
//     // create a custom event and c

//     if (census_poly_defined !== undefined && count_census_poly > 0) {
//         count_census_poly = 0;
//         mergeBlocks(mpolygon);

//         // mergeBlocks(mpolygon);

//         // console.log("highlight polygons now that the filter returns something");
//     }

// }

function mergeBlocks(mpoly, drawn_polygon) {
    var wkt = new Wkt.Wkt();
    var finalpoly = turf.union(mpoly[0], mpoly[1], mpoly[2], mpoly[3], mpoly[4]);
    for(var i = 0; i < mpoly.length - (mpoly.length%5); i+=5) {
        finalpoly = turf.union(mpoly[i], mpoly[i+1], mpoly[i+2], mpoly[i+3], mpoly[i+4], finalpoly);
    }
    for (i; i < (mpoly.length%5); i++) {
        finalpoly = turf.union(mpoly[i], finalpoly);
    }


    var census_blocks_polygon = drawn_polygon;
    // should only be the exterior ring
    console.log("function triggered");
    if (finalpoly.geometry.coordinates[0][0].length > 2) {
        census_blocks_polygon.geometry.coordinates[0] = finalpoly.geometry.coordinates[0][0];
    }
    else {
        census_blocks_polygon.geometry.coordinates[0] = finalpoly.geometry.coordinates[0];
    }
    // Save outline of census blocks.
    let census_blocks_polygon_json = JSON.stringify(census_blocks_polygon['geometry']);
    wkt_obj = wkt.read(census_blocks_polygon_json);
    census_blocks_polygon_wkt = wkt_obj.write();

    // document.getElementById('id_census_blocks_polygon').value = census_blocks_polygon_wkt;
    console.log("function ended");
    return census_blocks_polygon_wkt;
    // debugger
    // prevent the method from being called multiple times
}

function highlightBlocks(drawn_polygon) {
    // Save census blocks polygon outline.
    //
    console.log("called highlight blocks");
    // once the above works, check the global scope of drawn_polygon

    var census_blocks_polygon = drawn_polygon;
    var polygonBoundingBox = turf.bbox(census_blocks_polygon);
    // get the bounds of the polygon to reduce the number of blocks you are querying from
    var southWest = [polygonBoundingBox[0], polygonBoundingBox[1]];
    var northEast = [polygonBoundingBox[2], polygonBoundingBox[3]];

    var northEastPointPixel = map.project(northEast);
    var southWestPointPixel = map.project(southWest);
    var features = map.queryRenderedFeatures([southWestPointPixel, northEastPointPixel], { layers: ['census-blocks'] });
    if (features.length >= 1) {
        var mpoly = [];
        var total = 0.0;

        var filter = features.reduce(function(memo, feature) {
            if (! (turf.intersect(feature, census_blocks_polygon) === null)) {
                memo.push(feature.properties.BLOCKID10);
                mpoly.push(feature);
                total+= feature.properties.POP10;
            }
            return memo;
        }, ["in", "BLOCKID10"]);

        map.setFilter("blocks-highlighted", filter);
        // census_poly_defined = true;
        // count_census_poly = 1;

        // 1. LOWER LEGISLATION PROGRESS BAR __________________________________
        progressL = document.getElementById("pop");
        /*
        // set color of the progress bar depending on population
        if (total < (ideal_population_LOWER['nj'] * 0.33) || total > (ideal_population_LOWER['nj'] * 1.5)) {
            progress.style.background = "red";
        }
        else if (total < (ideal_population_LOWER['nj'] * 0.67) || total > (ideal_population_LOWER['nj'] * 1.33)) {
            progress.style.background = "orange";
        }
        else {
            progress.style.background = "green";
        }
        */
        progressL.style.background = "orange"
        progressL.innerHTML = Math.round(total / (ideal_population_LOWER['nj'] * 1.5) * 100) + "%";
        progressL.setAttribute("aria-valuenow", "total");
        progressL.setAttribute("aria-valuemax", ideal_population_LOWER['nj']);
        popWidth = total / (ideal_population_LOWER['nj'] * 1.5) * 100;
        progressL.style.width = popWidth + "%";


        // 2. UPPER LEGISLATION PROGRESS BAR __________________________________
        progressU = document.getElementById("popU");

        /*
        // set color of the progress bar depending on population
        if (total < (ideal_population_UPPER['nj'] * 0.33) || total > (ideal_population_UPPER['nj'] * 1.5)) {
            progressU.style.background = "red";
        }
        else if (total < (ideal_population_UPPER['nj'] * 0.67) || total > (ideal_population_UPPER['nj'] * 1.33)) {
            progressU.style.background = "orange";
        }
        else {
            progressU.style.background = "green";
        }
        */
        progressU.style.background = "orange"
        progressU.innerHTML = Math.round(total / (ideal_population_UPPER['nj'] * 1.5) * 100) + "%";
        progressU.setAttribute("aria-valuenow", "total");
        progressU.setAttribute("aria-valuemax", ideal_population_UPPER['nj']);
        popWidth = total / (ideal_population_UPPER['nj'] * 1.5) * 100;
        progressU.style.width = popWidth + "%";


        // 3. CONGRESSIONAL DISTRICT PROGRESS BAR __________________________________
        progressC = document.getElementById("popC");
        /*
        // set color of the progress bar depending on population
        if (total < (ideal_population_CONG['nj'] * 0.33) || total > (ideal_population_CONG['nj'] * 1.5)) {
            progressU.style.background = "red";
        }
        else if (total < (ideal_population_CONG['nj'] * 0.67) || total > (ideal_population_CONG['nj'] * 1.33)) {
            progressC.style.background = "orange";
        }
        else {
            progressC.style.background = "green";
        }
        */
        progressC.style.background = "orange"
        progressC.innerHTML = Math.round(total / (ideal_population_CONG['nj'] * 1.5) * 100) + "%";
        progressC.setAttribute("aria-valuenow", "total");
        progressC.setAttribute("aria-valuemax", ideal_population_CONG['nj']);
        popWidth = total / (ideal_population_CONG['nj'] * 1.5) * 100;
        progressC.style.width = popWidth + "%";
    }
    else {
        // census_poly_defined = undefined;
        // count_census_poly = 0;
        document.getElementById('id_census_blocks_polygon').value = "";
    }

    return mpoly;
}

/******************************************************************************/

// updatePolygon responds to the user's actions and updates the polygon field
// in the form.
function updateCommunityEntry(e) {

    var wkt = new Wkt.Wkt();
    var data = draw.getAll();
    // Polygon drawn by user in map.

    // Polygon saved to DB.
    var user_polygon_wkt;
    // Polygon saved to DB.
    var census_blocks_polygon_wkt;
    var drawn_polygon;

    if (data.features.length > 0) {
        // Update User Polygon with the GeoJson data.
        drawn_polygon = data.features[0];
        // Save user polygon.
        let user_polygon_json = JSON.stringify(drawn_polygon['geometry']);
        wkt_obj = wkt.read(user_polygon_json);
        user_polygon_wkt = wkt_obj.write();
        var mpolygon = highlightBlocks(drawn_polygon);
    } else {
        // user_poly_defined = false;
        // count_user_poly = 0;
        // census_poly_defined = false;
        // drawn_polygon = null;
        user_polygon_wkt = '';
        census_blocks_polygon_wkt = '';
        map.setFilter("blocks-highlighted", ["in", "GEOID10"]);
    }
    // Update form fields
    census_blocks_polygon_wkt = '';
    document.getElementById('id_user_polygon').value = user_polygon_wkt;
    document.getElementById('id_census_blocks_multipolygon').value = "";
    document.getElementById('id_census_blocks_polygon').value = "";
}



/******************************************************************************/

function updateElementIndex(el, prefix, ndx) {
    var id_regex = new RegExp('(' + prefix + '-\\d+)');
    var replacement = prefix + '-' + ndx;
    if ($(el).attr("for")) $(el).attr("for", $(el).attr("for").replace(id_regex, replacement));
    if (el.id) el.id = el.id.replace(id_regex, replacement);
    if (el.name) el.name = el.name.replace(id_regex, replacement);
}

/******************************************************************************/

function cloneMore(selector, prefix) {
    // Function that clones formset fields.
    var newElement = $(selector).clone(true);
    var total = $('#id_' + prefix + '-TOTAL_FORMS').val();
    if (total >= 10) {return false;}
    if (total == 0) {
        newElement = formsetFieldObject;
    }
    newElement.find('#description_warning').remove();
    newElement.find('#category_warning').remove();
    newElement.find(':input').each(function() {
        var name = $(this).attr('name').replace('-' + (total - 1) + '-', '-' + total + '-');
        var id = 'id_' + name;
        $(this).attr({
            'name': name,
            'id': id
        }).val('').removeAttr('checked');
    });
    total++;
    $('#id_' + prefix + '-TOTAL_FORMS').val(total);
    if (total == 1) {
        $("#formset_container").after(newElement);
    } else {
        $(selector).after(newElement);
    }
    var conditionRow = $('.form-row:not(:last)');
    conditionRow.find('.btn.add-form-row')
        .removeClass('btn-outline-success').addClass('btn-outline-danger')
        .removeClass('add-form-row').addClass('remove-form-row')
        .html('<span class="" aria-hidden="true">Remove</span>');
    return false;
}

/******************************************************************************/

function deleteForm(prefix, btn) {
    // Function that deletes formset fields.
    var total = parseInt($('#id_' + prefix + '-TOTAL_FORMS').val());
    if (total == 1) {
        // save last formset field object.
        formsetFieldObject = $('.form-row:last').clone(true);
    }
    btn.closest('.form-row').remove();
    var forms = $('.form-row');
    console.log(forms.length);
    $('#id_' + prefix + '-TOTAL_FORMS').val(forms.length);
    for (var i = 0, formCount = forms.length; i < formCount; i++) {
        $(forms.get(i)).find(':input').each(function() {
            updateElementIndex(this, prefix, i);
        });
    }
    return false;
}

/******************************************************************************/

$(document).on('click', '.add-form-row', function(e) {
    // Add form click handler.
    e.preventDefault();
    cloneMore('.form-row:last', 'form');
    return false;
});

/******************************************************************************/

$(document).on('click', '.remove-form-row', function(e) {
    // Remove form click handler.
    e.preventDefault();
    deleteForm('form', $(this));
    return false;
});
