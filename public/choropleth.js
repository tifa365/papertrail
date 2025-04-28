// Minimal Choropleth Map - German Landkreise
(function() {
  'use strict';

  // --- Configuration & Constants ---
  const MAP_CONTAINER_ID = '#map';
  const GEOJSON_URL = '/geodata.js';
  const NEWSPAPER_DATA_URL = '/newspaper_data_fixed.json';

  // Color scale for newspaper counts (from Legend.astro)
  const DENSITY_COLORS = ["#1a1a1a", "#4d4d4d", "#7a7a7a", "#ababab", "#d9d9d9"];
  const PAPER_COUNTS = [5, 4, 3, 2, 1];
  const NO_DATA_COLOR = "#f9f9f9";
  const BORDER_COLOR = "#cccccc";

  // Initial map view centered on Germany
  const INITIAL_VIEW = {
    bounds: [
      [46.57, 5.71],
      [55.54, 15.13]
    ],
    minZoom: 5,
    maxZoom: 11
  };

  // --- Styling Logic ---
  function getColorByPaperCount(count) {
    if (count === null || count === undefined) {
      return NO_DATA_COLOR;
    }
    
    for (let i = 0; i < PAPER_COUNTS.length; i++) {
      if (count >= PAPER_COUNTS[i]) {
        return DENSITY_COLORS[i];
      }
    }
    
    return NO_DATA_COLOR;
  }

  function geoJsonStyle(feature) {
    const ags = feature.properties.ags;
    const count = feature.properties.newspaperCount || 0;
    const fillColor = getColorByPaperCount(count);

    return {
      fillColor: fillColor,
      fillOpacity: 1,
      color: BORDER_COLOR,
      weight: 0.5,
      opacity: 1
    };
  }

  // --- Data Loading & Processing ---
  async function loadData() {
    try {
      // Load GeoJSON data
      const geoJsonResponse = await fetch(GEOJSON_URL);
      const geoJsonData = await geoJsonResponse.json();
      
      // Load newspaper data
      const newspaperResponse = await fetch(NEWSPAPER_DATA_URL);
      const newspaperData = await newspaperResponse.json();
      
      // Process and merge data
      const mergedData = processData(geoJsonData, newspaperData);
      
      // Initialize map with merged data
      initializeMap(mergedData);
    } catch (error) {
      console.error("Error loading data:", error);
      document.querySelector(MAP_CONTAINER_ID).innerHTML = 
        `<p style="color: red; padding: 20px;">Error loading map data. Please check the console.</p>`;
    }
  }

  function processData(geoJsonData, newspaperData) {
    // For simplicity, let's assume newspaperData has a count by AGS
    // In a real implementation, you would calculate this from the raw data
    
    // Add newspaper count to each region
    if (geoJsonData && geoJsonData.features) {
      geoJsonData.features.forEach(feature => {
        if (feature.properties && feature.properties.ags) {
          const ags = feature.properties.ags;
          // Simplistic matching - in a real implementation, you would
          // need to handle the specific structure of your newspaperData
          feature.properties.newspaperCount = newspaperData[ags]?.count || 0;
        }
      });
    }
    
    return geoJsonData;
  }

  // --- Map Initialization ---
  function initializeMap(geoJsonData) {
    // Create the basic map
    const map = L.map(MAP_CONTAINER_ID.substring(1), {
      minZoom: INITIAL_VIEW.minZoom,
      maxZoom: INITIAL_VIEW.maxZoom,
      zoomControl: true,
      attributionControl: true
    });
    
    // Add the GeoJSON layer
    const geoJsonLayer = L.geoJSON(geoJsonData, {
      style: geoJsonStyle,
      onEachFeature: function(feature, layer) {
        // Basic popup with region name and newspaper count
        if (feature.properties) {
          const name = feature.properties.name || "Unknown";
          const count = feature.properties.newspaperCount || 0;
          
          layer.bindTooltip(`${name}: ${count} ${count === 1 ? 'Zeitung' : 'Zeitungen'}`);
          
          // Click handler to show details
          layer.on('click', function() {
            // You would implement this to update your detail panel
            if (window.updateRegionDetail) {
              window.updateRegionDetail(feature.properties);
            }
          });
        }
      }
    }).addTo(map);
    
    // Set the map view to contain all of Germany
    map.fitBounds(INITIAL_VIEW.bounds);
  }

  // --- Expose Functions for External Use ---
  window.updateRegionDetail = function(properties) {
    const detailElement = document.getElementById('region-detail');
    if (detailElement) {
      const detailTitle = document.getElementById('detail-title');
      const detailContent = document.getElementById('detail-content');
      
      if (detailTitle && detailContent) {
        detailTitle.textContent = properties.name || "Unknown Region";
        
        const count = properties.newspaperCount || 0;
        detailContent.innerHTML = `
          <div class="data-grid">
            <div class="data-item">
              <div class="data-label">Zeitungen</div>
              <div class="data-value">${count}</div>
            </div>
            <div class="data-item">
              <div class="data-label">Bevölkerung</div>
              <div class="data-value">${properties.population || "N/A"}</div>
            </div>
          </div>
        `;
      }
    }
  };

  // --- Initialize on DOM Ready ---
  document.addEventListener('DOMContentLoaded', loadData);
})();