# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Papertrail** is an Astro-based web application that visualizes local newspapers (Tageszeitungen) across German regions (Landkreise) using an interactive choropleth map. The map displays newspaper density by region and provides detailed information about newspapers in each Landkreis.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (localhost:4321)
npm run dev

# Build production site to ./dist/
npm run build

# Preview production build locally
npm run preview

# Run Astro CLI commands
npm run astro ...
npm run astro -- --help
```

## Architecture

### Component Structure

This is an Astro SSG (Static Site Generation) application with the following component hierarchy:

- **MainLayout.astro**: Base layout providing HTML structure and fonts (Libre Baskerville)
- **index.astro**: Main page composition:
  - RegionDetail.astro: Banner showing selected region info
  - GermanyMap.astro: Interactive Leaflet map with legend
  - TopRegions.astro: List of regions with highest newspaper density
- **Global styles**: src/styles/global.css

### Map Implementation

The map visualization is powered by **Leaflet.js** and uses a custom choropleth implementation:

- **GermanyMap.astro**: Map container with dual legends (desktop overlay + mobile below-map)
- **public/minimal-choropleth.js**: Core map logic (800+ lines)
  - Loads GeoJSON data from `geodata.js` (German Landkreise boundaries)
  - Loads newspaper data from `/zeitungen_by_ags.json` (indexed by AGS codes)
  - Implements color scaling (6-tier red monochromatic scale)
  - Handles popups with newspaper details
  - Special handling for Berlin (AGS 11000) and filtering of Berlin districts
  - Mobile modal on small screens (<480px), standard popups on larger screens

### Data Sources

- **public/geodata.js**: GeoJSON features for German Landkreise and Bundesländer
- **public/zeitungen_by_ags.json**: Newspaper data indexed by AGS (Amtlicher Gemeindeschlüssel) codes
  - Structure: `{ "AGS": { count: number, zeitungen: [...] } }`
  - Each newspaper has: name, verlag, erscheinungsort, website

### Key Technical Details

1. **AGS Code Handling**: The AGS (Amtlicher Gemeindeschlüssel) is the unique identifier for each German administrative region. Berlin uses AGS "11000" and requires special handling throughout the codebase.

2. **Berlin District Filtering**: The map aggressively filters out all Berlin districts/boroughs (AGS starting with "11" except "11000") to show Berlin as a single unified region.

3. **Bundesländer vs Landkreise**: The GeoJSON contains both federal states (Bundesländer) and counties (Landkreise). Bundesländer are rendered transparent with light gray borders, while Landkreise are styled based on newspaper count.

4. **Map Layout Constraints**: The map uses fixed dimensions (560px desktop, 400px mobile, 300px small mobile) with aggressive overflow control to prevent layout shifts while allowing popups to extend beyond boundaries.

5. **Responsive Design**:
   - Desktop: Legend overlays the map at top-left
   - Mobile (<768px): Legend appears below map in horizontal layout
   - Small mobile (<480px): Standard popups replaced with full-screen modals

6. **Color Scale**: 6-tier enhanced contrast monochromatic red scale:
   - `#5C0000` (darkest): 5+ newspapers
   - `#8B0000`: 4 newspapers
   - `#B22222`: 3 newspapers
   - `#FF8A8A`: 2 newspapers
   - `#FFC7C7`: 1 newspaper
   - `#EFEFEF` (lightest): 0 newspapers

## Map Interaction Flow

1. On hover: Region highlights + RegionDetail banner updates
2. On click (desktop): Leaflet popup appears with newspaper list
3. On click (mobile <480px): Full-screen modal with newspaper list
4. Popups include newspaper names, publishers, locations, and website links

## Working with the Map

When modifying the map behavior:

- **Styling logic**: `geoJsonStyle()` in minimal-choropleth.js (line ~45)
- **Popup content**: `createPopupContent()` in minimal-choropleth.js (line ~105)
- **Color scale**: `getColorFromScale()` in minimal-choropleth.js (line ~31)
- **Berlin handling**: Multiple sections require special case logic for AGS "11000"
- **Map initialization**: `initializeMap()` in minimal-choropleth.js (line ~474)

## Important Constraints

- Map uses `dragging: false` and `scrollWheelZoom: false` - the map is static
- Fixed zoom level (6.5) centered on Germany - do not use `fitBounds()` as it causes layout issues
- The map container dimensions are aggressively locked to prevent Leaflet from expanding the page
- Popups use high z-index (9999) to ensure visibility over all other elements
- Northern regions (Schleswig-Holstein, Hamburg) get special popup offset to prevent cutoff at top of screen
