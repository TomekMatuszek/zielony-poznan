// stworzenie mapy i poziomów danych
var map = L.map('mapid').setView([52.408, 16.934], 11);
map.createPane('najwyższe'); map.createPane('wysokie'); map.createPane('średnie');
map.createPane('niskie'); map.createPane('najniższe');
map.getPane('najwyższe').style.zIndex = 35;
map.getPane('wysokie').style.zIndex = 30;
map.getPane('średnie').style.zIndex = 20;
map.getPane('niskie').style.zIndex = 15;
map.getPane('najniższe').style.zIndex = 10;

// wczytanie podkładów oraz WMS
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

// interakcje z warstwą osiedli
function layer_hover(feature, layer) {
    var popupContent = "<b>Nazwa:</b> " + feature.properties.NAZWA +
    "<br><b>L. mieszkańców:</b> " + feature.properties.LICZBA_MIESZKANCOW;
    layer.bindPopup(popupContent);

    layer.on('mouseover', function (e) {
        this.bringToFront();
        this.setStyle({color: 'red', fillOpacity: 0});
        document.getElementById('dane').innerHTML = "<b>Nazwa:</b> " + feature.properties.NAZWA +
        "<br><b>Liczba mieszkańców:</b> " + feature.properties.LICZBA_MIESZKANCOW +
        "<br><b>Gęstość zaludnienia:</b> " + feature.properties.GESTOSC_ZALUDNIEINA + " os./km<sup>2</sup>" ;
    });
    layer.on('mouseout', function (e) {
        this.bringToBack()
        this.setStyle({color: 'blue', fillOpacity: 0.1});
        document.getElementById('dane').innerHTML = "Najedź na osiedle aby zobaczyć dane na jego temat";
    });
}

// ikona pomników przyrody
var ikona = L.icon({
    iconUrl: 'pomnik_przyrody.png',
    iconSize: [20, 20],
    iconAnchor: [12, 12],
    popupAnchor: [0, 0]
});

// funkcje tworzące dwa rodzaje punktów dla pomników przyrody
function pomniki_ikony(point, latlng) {
    return L.marker(latlng, {icon: ikona});
}
function pomniki_punkty(point, latlng) {
    return L.circleMarker(latlng, {radius: 1, color: '#043812'});
}

// popupy pomników przyrody
function pomniki_popup(feature, layer){
    var gatunek = feature.properties.gatunek;
    if (gatunek == 'brak danych') {
        var gatunek = "<span style='color:red'>brak danych</span>"
    };
    layer.bindPopup("<b><u><center>Pomnik przyrody</center></u><br>Rodzaj:</b> " + feature.properties.obiekt + "<br><b>Gatunek:</b> <i>" + gatunek)
}

// dodawanie odpowiedniej ikony pomników w zależności od zoomu
map.on('zoomend', function(ev){
    if (map.getZoom() > 15) {
        formy_ochrony.removeLayer(pomniki_pkt)
        formy_ochrony.addLayer(pomniki_icon)
    } else {
        formy_ochrony.removeLayer(pomniki_icon)
        formy_ochrony.addLayer(pomniki_pkt)
    }
});

// WARSTWY
var admin = L.geoJson(poznan_admin, {color: 'blue', fillOpacity: 0.1, weight: 2,
    pane: 'średnie',
    onEachFeature: layer_hover
});
var poznan = L.geoJson(poznan, {color: 'black', weight: 4, pane: 'najwyższe'}).addTo(map);
var tereny_zielone = L.geoJson(tereny_zielone, {
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
var pomniki_pkt = L.geoJson(pomniki, {pointToLayer: pomniki_punkty, pane: 'wysokie', onEachFeature: pomniki_popup});
var pomniki_icon = L.geoJson(pomniki, {pointToLayer: pomniki_ikony, pane: 'wysokie', onEachFeature: pomniki_popup});
var rezerwaty = L.geoJson(rezerwaty, {color: '#4f9839', fillOpacity: 0.4, pane: 'wysokie',
onEachFeature: function(feature, layer) {
    layer.bindPopup("<b><u><center>Rezerwat</center></u><br>Nazwa:</b> " + feature.properties.nazwa);
}
});
var natura2000 = L.geoJson(natura2000, {color: '#4ac626', fillOpacity: 0.4, pane: 'wysokie',
onEachFeature: function(feature, layer) {
    layer.bindPopup("<b><u><center>Obszar Natura 2000</center></u><br>Nazwa:</b> " + feature.properties.nazwa);
}
});
var obszary_krajobrazu = L.geoJson(obszary_krajobrazu, {color: '#82c338', fillOpacity: 0.4, pane: 'wysokie',
onEachFeature: function(feature, layer) {
    layer.bindPopup("<b><u><center>Obszar chronionego krajobrazu</center></u><br>Nazwa:</b> " + feature.properties.nazwa);
}
});
var uzytki_ekologiczne = L.geoJson(uzytki_ekologiczne, {color: '#bae537', fillOpacity: 0.4, pane: 'wysokie',
onEachFeature: function(feature, layer) {
    layer.bindPopup("<b><u><center>Użytek ekologiczny</center></u><br>Nazwa:</b> " + feature.properties.nazwa);
}
});

// stworzenie grupy warstw dla form ochrony przyrody
var formy_ochrony = L.layerGroup([pomniki_pkt, rezerwaty, natura2000, obszary_krajobrazu, uzytki_ekologiczne]);

// dodanie geokodera OSM
var osmGeocoder = new L.Control.OSMGeocoder({text: 'Wyszukaj', placeholder: 'wpisz nazwę...', bounds: L.LatLngBounds(poznan),
                                            collapsed: true, position: 'topleft'}).addTo(map);

// mapy podkładowe
var baseMaps = {
    "OSM": OSM,
    "Satelita": mapbox
};

// warstwy z danymi
var overlayMaps = {
    "Poznań": poznan,
    "osiedla": admin,
    "tereny zielone": tereny_zielone,
    "zadrzewienie": drzewa,
    "formy ochrony przyrody": formy_ochrony
};

// przycisk zmiany widoczności warstw
var layer_control = L.control.layers(baseMaps, overlayMaps).addTo(map);

// obsługa przycisku info
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

// funkcje kolorów legendy
function getColor_zielen(x) {
    return x == 'Cmentarze' ? "#9dcea1" :
           x == 'Obiekt sportowy' ? "#bdee93" :
           x == 'Ogród działkowy' ? "#93eeb3" :
           x == 'Parki i skwery' ? "#35c841" :
           x == 'Zieleń' ? "green":
           x == 'Fort' ? "#a9c393":
                        "green";
}

function getColor_formy(x) {
    return x == 'Rezerwaty' ? "#4f9839" :
           x == 'Obszary Natura 2000' ? "#4ac626" :
           x == 'Użytki ekologiczne' ? "#bae537" :
           x == 'Obszary chronionego krajobrazu' ? "#82c338" :
                        "green";
}

// legenda warstwy terenów zielonych
var legend_zielen = L.control({position: 'bottomleft'});
legend_zielen.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'info legend');
    labels = ["<strong><span style='line-height: 30px;'>Typy terenów zielonych</span></strong>"],
    categories = ['Cmentarze', 'Obiekt sportowy', 'Ogród działkowy', 'Parki i skwery', 'Zieleń', 'Fort'];
    
    for (var i = 0; i < categories.length; i++) {
            div.innerHTML += 
            labels.push(
                '<i class="square" style="height:20px;width:20px;background:' + getColor_zielen(categories[i]) + '"></i> ' + (categories[i] ? categories[i] : '+')
                );
        }
        div.innerHTML = labels.join('<br>');
    return div;
};

// legenda warstwy form ochrony przyrody
var legend_formy = L.control({position: 'bottomleft'});
legend_formy.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'info legend');
    labels = ["<strong><span style='line-height: 30px;'>Formy ochrony przyrody</span></strong>"],
    categories = ['Rezerwaty', 'Natura 2000', 'Użytki ekologiczne', 'Obszary chronionego krajobrazu'];
    
    for (var i = 0; i < categories.length; i++) {
            div.innerHTML += 
            labels.push(
                '<i class="square" style="height:20px;width:20px;background:' + getColor_formy(categories[i]) + '"></i> ' + (categories[i] ? categories[i] : '+')
                );
        }
        div.innerHTML = labels.join('<br>');
    return div;
};

// dodawanie i usuwanie legend
map.on('overlayadd', function(ev) {
    if (map.hasLayer(tereny_zielone) == true) {
        legend_zielen.addTo(map);
    }
    if (map.hasLayer(formy_ochrony) == true) {
        legend_formy.addTo(map);
    }
});

map.on('overlayremove', function(eventLayer) {
    if (map.hasLayer(tereny_zielone) == false) {
        map.removeControl(legend_zielen);
    }
    if (map.hasLayer(formy_ochrony) == false) {
        map.removeControl(legend_formy);
    }
});
