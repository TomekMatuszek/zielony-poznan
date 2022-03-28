var map = L.map('mapid').setView([52.408, 16.934], 11);
map.createPane('najwyższe');
map.createPane('wysokie');
map.createPane('średnie');
map.createPane('niskie');
map.createPane('najniższe');
map.getPane('najwyższe').style.zIndex = 35;
map.getPane('wysokie').style.zIndex = 30;
map.getPane('średnie').style.zIndex = 20;
map.getPane('niskie').style.zIndex = 15;
map.getPane('najniższe').style.zIndex = 10;

var OSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, attribution: '&copy;<a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    pane: 'najniższe'
}).addTo(map);
var mapbox = L.tileLayer('https://api.mapbox.com/styles/v1/tommat21/cl0zeqb1b000p14pburjv7aur/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoidG9tbWF0MjEiLCJhIjoiY2szdmpseXljMDhsdjNkcGh0YmhhczQyeSJ9.PviNBy-Ul0xrd-L88GgRnw',
                        {pane: 'najniższe'});
var drzewa = L.tileLayer.wms('http://wms2.geopoz.poznan.pl/geoserver/srodowisko/wms',{
    layers: 'srodowisko:mapa_wysokosci_drzew',
    format: 'image/png',
    transparent: true,
    pane: 'najniższe'
})

document.getElementById('dane').style.fontSize = "30px";
function layer_hover(feature, layer) {
    var popupContent = "<b>Nazwa:</b> " + feature.properties.NAZWA +
    "<br><b>L. mieszkańców:</b> " + feature.properties.LICZBA_MIESZKANCOW;
    layer.bindPopup(popupContent);

    layer.on('mouseover', function (e) {
        this.bringToFront();
        this.setStyle({color: 'red', fillOpacity: 0});
        document.getElementById('dane').innerHTML = "<b>Nazwa:</b> " + feature.properties.NAZWA +
        "<br><b>L. mieszkańców:</b> " + feature.properties.LICZBA_MIESZKANCOW;
    });
    layer.on('mouseout', function (e) {
        this.bringToBack()
        this.setStyle({color: 'blue', fillOpacity: 0.1});
        document.getElementById('dane').innerHTML = "Tu będzie treść";
    });
}

var admin = L.geoJson(poznan_admin, {color: 'blue', fillOpacity: 0.1, weight: 2,
    pane: 'średnie',
    onEachFeature: layer_hover
});
var poznan = L.geoJson(poznan, {color: 'black', weight: 4, pane: 'najwyższe'}).addTo(map);
var tereny_zielone = L.geoJson(tereny_zielone, {//color: 'green', weight: 0, fillOpacity: 1, pane: 'niskie',
    onEachFeature: function(feature, layer) {
        var nazwa = feature.properties.NAZWA;
        if (nazwa == null) {
            var nazwa = "<span style='color:red'>brak</span>"
        };
        layer.bindPopup("<b>Rodzaj: </b> " + feature.properties.RODZAJ + "<br><b>Nazwa: </b> " + nazwa);
    },
    style: function(feature) {
        typ = feature.properties.RODZAJ;
        return typ == 'Cmentarz inny' || typ == 'Cmentarz komunalny' || typ == 'Cmentarz parafialny' ? {color: '#9dcea1', weight: 0, fillOpacity: 1, pane: 'niskie'}:
            typ == 'Obiekt sportowy' ? {color: '#bdee93', weight: 0, fillOpacity: 1, pane: 'niskie'}:
            typ == 'Ogród działkowy' ? {color: '#93eeb3', weight: 0, fillOpacity: 1, pane: 'niskie'}:
            typ == 'Park' || typ == 'Skwer' ? {color: '#35c841', weight: 0, fillOpacity: 1, pane: 'niskie'}:
            typ == 'Zieleń' ? {color: 'green', weight: 0, fillOpacity: 1, pane: 'niskie'}:
            typ == 'Fort' ? {color: '#a9c393', weight: 0, fillOpacity: 1, pane: 'najniższe'}:
                {color: 'green', weight: 0, fillOpacity: 1, pane: 'niskie'};
    }
});
var pomniki = L.geoJson(pomniki, {color: 'red', pane: 'wysokie'});
var rezerwaty = L.geoJson(rezerwaty, {color: 'black', pane: 'wysokie'});
var natura2000 = L.geoJson(natura2000, {color: 'red', pane: 'wysokie'});
var obszary_krajobrazu = L.geoJson(obszary_krajobrazu, {color: 'green', pane: 'wysokie'});
var uzytki_ekologiczne = L.geoJson(uzytki_ekologiczne, {color: 'orange', pane: 'wysokie'});
var formy_ochrony = L.layerGroup([pomniki, rezerwaty, natura2000, obszary_krajobrazu, uzytki_ekologiczne]);

var osmGeocoder = new L.Control.OSMGeocoder({text: 'Wyszukaj', placeholder: 'wpisz nazwę...', bounds: L.LatLngBounds(poznan),
                                            collapsed: false, position: 'topleft'});


var baseMaps = {
    "OSM": OSM,
    "Satelita": mapbox
};

var overlayMaps = {
    "Poznań": poznan,
    "osiedla": admin,
    "tereny zielone": tereny_zielone,
    "zadrzewienie": drzewa,
    "formy ochrony przyrody": formy_ochrony
};

var layer_control = L.control.layers(baseMaps, overlayMaps).addTo(map);

var czy_geokoder = 0;
document.getElementById("geokoder_przycisk").addEventListener("click", function(){
    if (czy_geokoder == 1) {
        map.removeControl(osmGeocoder);
        czy_geokoder = 0;
    } else {
        map.addControl(osmGeocoder);
        czy_geokoder = 1;
    }
});

var czy_info = 1;
document.getElementById("info_przycisk").addEventListener("click", function(){
    if (czy_info == 1) {
        document.getElementById("dane").style.display = 'none';
        czy_info = 0;
    } else {
        document.getElementById("dane").style.display = 'block';
        czy_info = 1;
    }
});