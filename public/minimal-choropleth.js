// Minimal Choropleth Map - German Landkreise
// Core implementation based on user specification
(function() {
  'use strict';

  // --- Configuration & Constants ---
  const MAP_CONTAINER_ID = '#map';
  
  // Red monochromatic color scale (dark to light)
  const DENSITY_COLORS = ["#8B0000", "#B22222", "#DC143C", "#FF4500", "#FF7F50"];
  const DENSITY_BOUNDS = [5, 4, 3, 2, 1, 0]; // Matching bounds for newspaper counts
  const NO_DATA_COLOR = "#f9f9f9";
  const BORDER_COLOR = "#ffffff";

  // Initial map view centered on Germany - tighter focus
  const INITIAL_VIEW = {
    bounds: [
      [47.27, 5.87],  // Southwest coordinates - narrower focus
      [54.94, 15.02]  // Northeast coordinates - narrower focus
    ],
    center: [51.1657, 10.4515], // Center of Germany
    minZoom: 1,
    maxZoom: 11,
    defaultZoom: 6.5  // Much tighter zoom level
  };

  // --- Styling Logic ---
  function getColorFromScale(value) {
    if (value === null || value === undefined) {
      return NO_DATA_COLOR;
    }
    
    for (let i = 0; i < DENSITY_BOUNDS.length - 1; i++) {
      if (value >= DENSITY_BOUNDS[i]) {
        return DENSITY_COLORS[i];
      }
    }
    
    return NO_DATA_COLOR;
  }

  function geoJsonStyle(feature) {
    // Assign placeholder values for demonstration
    const value = feature.properties.placeholderValue;
    const fillColor = getColorFromScale(value);

    return {
      fillColor: fillColor,
      fillOpacity: 1,
      color: BORDER_COLOR,  // White borders
      weight: 0.7,       // Slightly thicker borders
      opacity: 1
    };
  }

  // --- Placeholder Data Generation ---
  function assignPlaceholderData(features) {
    features.forEach(feature => {
      if (feature.properties) {
        // Generate a random value between 0 and 5
        const value = Math.floor(Math.random() * 6);
        feature.properties.placeholderValue = value;
      } else {
        feature.properties = { placeholderValue: null };
      }
    });
  }

  // --- Map Initialization ---
  function initializeMap(geoJsonData) {
    // Assign placeholder data for demonstration
    assignPlaceholderData(geoJsonData.features);
    
    // Create the basic Leaflet map
    const map = L.map(MAP_CONTAINER_ID.slice(1), {
      minZoom : INITIAL_VIEW.minZoom,
      maxZoom : INITIAL_VIEW.maxZoom,
      zoomSnap: 0.1,        // keep fractional zoom support
      zoomDelta: 0.5,
      dragging : false,
      scrollWheelZoom: false,
      attributionControl: false,
      zoomControl: false
    });
    
    // Add the GeoJSON layer
    L.geoJSON(geoJsonData, {
      style: geoJsonStyle
    }).addTo(map);
    
    // Fit the map to the initial view bounds with some padding and maxZoom
    map.fitBounds(INITIAL_VIEW.bounds, {
      padding: [5, 5], // add a little breathing space
      maxZoom: 8.0,      // never zoom tighter than this
      animate: false     // no pan animation for a “static” map
    });
    
    // Fix potential size issues by automatically updating the map on window resize
    window.addEventListener('resize', function() {
      map.invalidateSize();
    });

    // Log for debugging
    console.log(`Using integer zoom level: ${map.getZoom()} to avoid Leaflet zoom bugs`);
  }
  // --- Data Loading & Execution ---
  function loadData() {
    try {
      // Wait for geoData to be defined
      if (typeof window.geoData !== 'undefined') {
        console.log("Using global geoData variable");
        initializeMap(window.geoData);
      } else {
        console.log("geoData not available yet, waiting...");
        // Try again in 100ms
        setTimeout(loadData, 100);
      }
    } catch (error) {
      console.error("Error processing GeoJSON:", error);
      const mapDiv = document.querySelector(MAP_CONTAINER_ID);
      if (mapDiv) {
        mapDiv.innerHTML = `<p style="color: red; padding: 20px;">Error loading map data: ${error.message}</p>`;
      }
    }
  }

  // --- Initialize on DOM Ready ---
  document.addEventListener('DOMContentLoaded', loadData);
})();