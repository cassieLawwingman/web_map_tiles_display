import React, { useEffect } from 'react';
import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';

import './App.css';

function MapComponent() {
  useEffect(() => {
      var osmTileLayer = new TileLayer({
        source: new OSM(),
      })
      var mapview = new View({
        center: [14960009.811130341, -3001695.7667663265],
        zoom: 4,
        minZoom: 0,
        maxZoom: 25
      })

      const map = new Map({
          target: "map",
          layers: [osmTileLayer],
          view: mapview
        });
    return () => map.setTarget()
  }, []);

  return (
    <div id="map" className="map-container" />
  );
}

function App() {
  return MapComponent();
}

export default App;
