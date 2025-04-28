// Minimal Choropleth Map - German Landkreise
// Core implementation based on user specification
(function() {
  'use strict';

  // --- Configuration & Constants ---
  const MAP_CONTAINER_ID = '#map';
  
  // Enhanced contrast monochromatic red scale
  const DENSITY_COLORS = ["#5C0000", "#8B0000", "#B22222", "#FF8A8A", "#FFC7C7", "#EFEFEF"];
  const DENSITY_BOUNDS = [5, 4, 3, 2, 1, 0]; // Matching bounds for newspaper counts
  const NO_DATA_COLOR = "#F8F8F8";
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

  // Store newspaper data globally
  let zeitungsData = {};

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
    // Check if this is a Bundesland (federal state) - we want to make these transparent
    const isBundesland = feature.properties.type === "bundesland";
    
    // Get region info
    const ags = feature.properties.ags;
    const regionName = feature.properties.name;
    let value = 0;
    
    // SPECIAL CASE: Explicitly handle Berlin
    if (regionName === "Berlin") {
      // Force Berlin to use AGS 11000
      const berlinData = zeitungsData["11000"];
      if (berlinData) {
        value = berlinData.count;
        console.log(`Berlin styling: Setting newspaper count to ${value} from zeitungsData[11000]`);
      } else {
        console.error("ERROR: Berlin data not found in zeitungsData!");
      }
    }
    // Normal case for other regions
    else if (ags && zeitungsData[ags]) {
      value = zeitungsData[ags].count;
      
      // Debug info for specific regions
      if (regionName === "Wartburgkreis") {
        console.log(`Wartburgkreis (AGS: ${ags}) has newspaper count: ${value}`);
      }
    } else {
      // Log missing data for important regions
      if (regionName === "Wartburgkreis") {
        console.warn(`Wartburgkreis (AGS: ${ags}) has NO newspaper data!`);
      }
    }
    
    // Store the value in the feature properties for later use
    feature.properties.newspaperCount = value;
    const fillColor = getColorFromScale(value);

    // Make Bundesländer transparent but keep borders
    if (isBundesland) {
      return {
        fillColor: 'transparent',
        fillOpacity: 0,  // Transparent fill
        color: '#CCC',   // Light gray borders for states
        weight: 1,       // Slightly thicker borders
        opacity: 0.5     // Semi-transparent borders
      };
    }
    
    // Regular styling for Landkreise
    return {
      fillColor: fillColor,
      fillOpacity: 1,
      color: BORDER_COLOR,  // White borders
      weight: 0.7,       // Slightly thicker borders
      opacity: 1
    };
  }

  // --- Create Popup Content ---
  function createPopupContent(feature) {
    const ags = feature.properties.ags;
    const regionName = feature.properties.name || "Unbekannte Region";
    
    // SPECIAL CASE: Explicitly handle Berlin
    if (regionName === "Berlin") {
      const berlinData = zeitungsData["11000"];
      if (berlinData) {
        const count = berlinData.count;
        let newspapersList = '';
        
        if (berlinData.zeitungen && berlinData.zeitungen.length > 0) {
          newspapersList = '<div class="newspaper-list">';
          berlinData.zeitungen.forEach(zeitung => {
            const website = zeitung.website 
              ? `<a href="${zeitung.website}" target="_blank" class="newspaper-link">🔗 Website</a>` 
              : '';
            
            newspapersList += `
              <div class="newspaper-item">
                <div class="newspaper-name">${zeitung.name}</div>
                <div class="newspaper-details">
                  ${zeitung.verlag || ''} ${zeitung.erscheinungsort ? `(${zeitung.erscheinungsort})` : ''}
                  ${website}
                </div>
              </div>
            `;
          });
          newspapersList += '</div>';
        }
        
        return `
          <div class="region-popup">
            <h3>Berlin</h3>
            <div class="count-badge">${count} ${count === 1 ? 'Zeitung' : 'Zeitungen'}</div>
            ${newspapersList}
          </div>
        `;
      }
    }
    
    // Normal case for other regions
    if (!ags || !zeitungsData[ags]) {
      return `
        <div class="region-popup">
          <h3>${regionName}</h3>
          <p>Keine Zeitungsdaten verfügbar</p>
        </div>
      `;
    }
    
    const regionData = zeitungsData[ags];
    const count = regionData.count;
    
    let newspapersList = '';
    if (regionData.zeitungen && regionData.zeitungen.length > 0) {
      newspapersList = '<div class="newspaper-list">';
      regionData.zeitungen.forEach(zeitung => {
        const website = zeitung.website 
          ? `<a href="${zeitung.website}" target="_blank" class="newspaper-link">🔗 Website</a>` 
          : '';
        
        newspapersList += `
          <div class="newspaper-item">
            <div class="newspaper-name">${zeitung.name}</div>
            <div class="newspaper-details">
              ${zeitung.verlag || ''} ${zeitung.erscheinungsort ? `(${zeitung.erscheinungsort})` : ''}
              ${website}
            </div>
          </div>
        `;
      });
      newspapersList += '</div>';
    }
    
    return `
      <div class="region-popup">
        <h3>${regionName}</h3>
        <div class="count-badge">${count} ${count === 1 ? 'Zeitung' : 'Zeitungen'}</div>
        ${newspapersList}
      </div>
    `;
  }

  // --- Create Popup Style ---
  function addPopupStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .region-popup {
        font-family: 'Libre Baskerville', Georgia, serif;
        padding: 8px;
        max-width: 300px;
      }
      .region-popup h3 {
        margin: 0 0 8px 0;
        font-size: 16px;
        border-bottom: 2px solid #5C0000;
        padding-bottom: 4px;
        color: #333;
      }
      .count-badge {
        display: inline-block;
        background: linear-gradient(135deg, #800000, #FF5252);
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        margin-bottom: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.25);
        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        border: 1px solid rgba(255,255,255,0.2);
      }
      .newspaper-list {
        max-height: 200px;
        overflow-y: auto;
      }
      .newspaper-item {
        margin-bottom: 10px;
        padding-bottom: 8px;
        border-bottom: 1px dotted #eee;
      }
      .newspaper-item:last-child {
        border-bottom: none;
      }
      .newspaper-name {
        font-weight: bold;
        font-size: 14px;
        color: #333;
      }
      .newspaper-details {
        font-size: 12px;
        color: #666;
        margin-top: 3px;
      }
      .newspaper-link {
        display: inline-block;
        margin-top: 4px;
        text-decoration: none;
        color: #5C0000;
        font-weight: bold;
      }
      .newspaper-link:hover {
        text-decoration: underline;
      }
      
      /* Fix popup positioning issues */
      .leaflet-popup {
        position: absolute;
        margin-bottom: 30px;
        z-index: 9999 !important;
      }
      
      .leaflet-popup-content-wrapper {
        border-radius: 8px;
        box-shadow: 0 3px 14px rgba(0,0,0,0.2);
      }
      
      /* Prevent popups from affecting layout */
      .leaflet-container {
        overflow: visible !important;
      }
      
      /* Ensure popup tips are visible */
      .leaflet-popup-tip-container {
        z-index: 9999 !important;
        pointer-events: none;
      }
      
      .newspaper-popup {
        margin-top: -30px; /* Lift popups higher above the region */
      }
      
      /* Special styling for northern regions */
      .northern-popup {
        margin-top: -60px !important; /* Lift northern popups even higher */
      }
      
      /* Ensure popups for Nordfriesland are visible */
      .northern-popup .leaflet-popup-content-wrapper {
        margin-bottom: 15px;
      }
    `;
    document.head.appendChild(styleElement);
  }

  // --- Load Newspaper Data ---
  async function loadNewspaperData() {
    try {
      const response = await fetch('/zeitungen_by_ags.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      zeitungsData = await response.json();
      console.log("Newspaper data loaded successfully", Object.keys(zeitungsData).length);
      
      // Debug: Check specifically for Wartburgkreis data
      if (zeitungsData["16063"]) {
        console.log("Wartburgkreis data found:", zeitungsData["16063"]);
      } else {
        console.log("Wartburgkreis data missing!");
      }
      
      return true;
    } catch (error) {
      console.error("Error loading newspaper data:", error);
      return false;
    }
  }

  // --- Map Initialization ---
  async function initializeMap(geoJsonData) {
    // Load newspaper data first
    await loadNewspaperData();
    
    // Add custom popup styles
    addPopupStyles();
    
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
    
    // ULTRA AGGRESSIVE Berlin handling - completely remove ALL Berlin districts
    console.log("Original feature count:", geoJsonData.features.length);
    
    // First, find the main Berlin feature with AGS 11000
    const mainBerlinFeature = geoJsonData.features.find(f => 
      f.properties.name === "Berlin" && f.properties.ags === "11000");
    
    if (!mainBerlinFeature) {
      console.error("CRITICAL: Couldn't find main Berlin feature with AGS 11000!");
    } else {
      console.log("Found main Berlin with properties:", mainBerlinFeature.properties);
      
      // Ensure it has the correct type
      mainBerlinFeature.properties.type = "kreisfreie Stadt";
    }
    
    // Now extremely aggressively filter out ALL Berlin-related entities EXCEPT the main one
    let processedFeatures = geoJsonData.features.filter(feature => {
      const props = feature.properties || {};
      const name = props.name || "";
      const ags = props.ags || "";
      const partof = props.partof || "";
      const type = props.type || "";
      
      // Check if this is Berlin-related in ANY way, but not the main Berlin
      const isBerlinRelated = (
        // Check name contains Berlin but is not exactly "Berlin" with AGS 11000
        (name.includes("Berlin") && !(name === "Berlin" && ags === "11000")) ||
        // Check if part of Berlin
        partof.includes("Berlin") ||
        // Check if it's a district or borough of Berlin
        (type === "bezirk" || type === "stadtteil") ||
        // Check AGS - any 11xxx except 11000
        (ags.startsWith("11") && ags !== "11000")
      );
      
      // Keep if NOT Berlin-related OR if it's the main Berlin
      return !isBerlinRelated || (name === "Berlin" && ags === "11000");
    });
    
    console.log("After Berlin filtering - feature count:", processedFeatures.length, 
                "Removed:", geoJsonData.features.length - processedFeatures.length);
    
    // Update the original geoData variable with our processed version
    window.geoData.features = processedFeatures;
    
    // Now separate into Bundesländer and Landkreise as before
    const bundeslaenderFeatures = processedFeatures.filter(f => 
      f.properties.type === "bundesland" && f.properties.name !== "Berlin");
    
    const landkreiseFeatures = processedFeatures.filter(f => 
      f.properties.type !== "bundesland" || 
      (f.properties.name === "Berlin" && f.properties.ags === "11000"));
    
    // Create copies of geoJSON structure with separated features
    const bundeslaenderData = {
      ...geoJsonData,
      features: bundeslaenderFeatures
    };
    
    const landkreiseData = {
      ...geoJsonData,
      features: landkreiseFeatures
    };
    
    // Add Bundesländer layer first (in the background)
    const bundeslaenderLayer = L.geoJSON(bundeslaenderData, {
      style: geoJsonStyle,
      interactive: false // No interaction with Bundesländer
    }).addTo(map);
    
    // Find the Berlin entry in the Landkreise data and ensure it has the correct properties
    const berlinFeature = landkreiseData.features.find(f => f.properties.name === "Berlin");
    if (berlinFeature) {
      console.log("Berlin feature found in landkreiseData, updating properties");
      // Set Berlin's type explicitly to "kreisfreie Stadt"
      berlinFeature.properties.type = "kreisfreie Stadt";
      // Make sure it has the correct AGS code
      berlinFeature.properties.ags = "11000";
    } else {
      console.warn("Berlin feature not found in landkreiseData!");
    }
    
    // Add Landkreise layer on top with interactivity
    const landkreiseLayer = L.geoJSON(landkreiseData, {
      style: geoJsonStyle,
      onEachFeature: function(feature, layer) {
        if (feature.properties) {
          // Create tooltip
          layer.bindTooltip(feature.properties.name, {
            permanent: false,
            direction: 'top',
            className: 'region-tooltip'
          });
          
          // Create popup
          const popupContent = createPopupContent(feature);
          
          // Get region name to check if it's a northern region
          const regionName = feature.properties.name || "";
          const isNorthernRegion = /Nord|friesland|schleswig|holstein|hamburg|kiel|flensburg|lübeck/i.test(regionName);
          
          // Add special offset for northern regions to prevent popups from being cut off
          const popupOptions = {
            maxWidth: 320,
            className: isNorthernRegion ? 'newspaper-popup northern-popup' : 'newspaper-popup',
            autoPan: false, // Prevent map from panning when popup opens
            offset: isNorthernRegion ? [0, -25] : [0, 0] // Offset popup for northern regions
          };
          
          layer.bindPopup(popupContent, popupOptions);
          
          // Add hover and click effects
          layer.on({
            mouseover: function(e) {
              const layer = e.target;
              layer.setStyle({
                weight: 1.5,
                fillOpacity: 0.8
              });
              layer.bringToFront();
              
              // Update the region detail panel on hover
              updateRegionDetailPanel(feature);
            },
            mouseout: function(e) {
              const layer = e.target;
              layer.setStyle({
                weight: 0.7,
                fillOpacity: 1
              });
            },
            click: function(e) {
              // On click, update the region detail panel and open popup
              updateRegionDetailPanel(feature);
            }
          });
        }
      }
    }).addTo(map);
    
    // Use a fixed center and zoom for more control over the map size
    map.fitBounds(INITIAL_VIEW.bounds, {
      padding: [5, 5],
      maxZoom: 8.0,
      animate: false
    });
    
    // Fix potential size issues by automatically updating the map on window resize
    window.addEventListener('resize', function() {
      map.invalidateSize();
    });

    // Log for debugging
    console.log(`Using integer zoom level: ${map.getZoom()} to avoid Leaflet zoom bugs`);
  }
  
  // --- Update Region Detail Panel ---
  function updateRegionDetailPanel(feature) {
    const detailTitle = document.querySelector('#detail-title');
    if (!detailTitle) return;
    
    if (!feature || !feature.properties) {
      detailTitle.textContent = "Fahre mit der Maus auf eine Region, um Details anzuzeigen";
      return;
    }
    
    const regionName = feature.properties.name || "Unbekannte Region";
    const ags = feature.properties.ags;
    
    // Just update the title with region name
    if (ags && zeitungsData[ags]) {
      const count = zeitungsData[ags].count;
      detailTitle.textContent = `${regionName} (${count} ${count === 1 ? 'Zeitung' : 'Zeitungen'})`;
    } else {
      detailTitle.textContent = regionName;
    }
    
    // Remove any existing content section to keep only the banner
    const detailPanel = document.querySelector('#region-detail');
    if (detailPanel) {
      const contentSection = detailPanel.querySelector('.detail-content');
      if (contentSection) {
        contentSection.remove();
      }
    }
  }

  // --- Data Loading & Execution ---
  async function loadData() {
    try {
      // Wait for geoData to be defined
      if (typeof window.geoData !== 'undefined') {
        console.log("Using global geoData variable");
        await initializeMap(window.geoData);
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