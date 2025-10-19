#!/usr/bin/env node

/**
 * Transform zeitungen_by_ags_original.json to normalized format
 * Preserves 100% of existing data, just fixes AGS format for map compatibility
 * Optionally enriches verlag data from newspaper_data_fixed.json
 */

const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, 'public', 'zeitungen_by_ags.json');

// Cleanup mapping: Replace verbose research notes with clean publisher names
const cleanPublisherNames = {
  'Pirmasenser Zeitung': 'Die Rheinpfalz Verlag',
  'Märkische Oderzeitung': 'Märkisches Medienhaus',
  'Märkische Oderzeitung (u.a. Spree-Journal)': 'Märkisches Medienhaus',
  'Ostseezeitung (Ribnitz-Damgartener Zeitung, Stralsunder Zeitung, Grimmener Zeitung, Usedom-Peene-Zeitung)': 'Lübecker Nachrichten Verlagsgesellschaft',
  'Ostseezeitung (Grevesmühlener Zeitung, Wismaer Zeitung)': 'Lübecker Nachrichten Verlagsgesellschaft',
  'Ostseezeitung (Greifswalder Zeitung, Usedom-Peene-Zeitung)': 'Lübecker Nachrichten Verlagsgesellschaft',
  'Schweriner Volkszeitung (Gadebusch-Rehnaer Zeitung)': 'Zeitungsverlag Schwerin',
  'Schweriner Volkszeitung (Anzeiger für Sternberg-Brüel-Warin, Parchimer Zeitung, Ludwigsluster Tageblatt, Hagenower Kreisblatt, Zeitung für Lübz-Goldberg-Plau)': 'Zeitungsverlag Schwerin',
  'Nordkurier (div. Titel)': 'Schwäbischer Verlag',
  'WAZ. Westdeutsche Allgemeine/Neue Rhur Zeitung': 'Funke Medien',
  'WAZ. Westdeutsche Allgemeine/Neue Rhein Zeitung': 'Funke Medien',
  'WAZ. Westdeutsche Allgemeine (Velberter Zeitung, Heiligenhauser Zeitung)/Neue Rhein Zeitung': 'Funke Medien',
  'Kölnische Rundschau/Kölner Stadt-Anzeiger': 'M. DuMont Schauberg',
  'Kölnische Rundschau (Rhein-Erft-Rundschau)/Kölner Stadt-Anzeiger': 'M. DuMont Schauberg',
  'Kölnische Rundschau': 'M. DuMont Schauberg',
  'Wiesbadener Kurier/Idsteiner Zeitung': 'VRM',
  'Wiesbadener Kurier/Wiesbadener Tagblatt/Idsteiner Zeitung/Aar-Bote': 'VRM',
  'Trierischer Volksfreund (Mittelmosel-Zeitung)': 'Rheinische Post Mediengruppe',
  'Trierischer Volksfreund': 'Rheinische Post Mediengruppe',
  'Sindelfinger Zeitung/Böblinger Zeitung': 'Röhm Verlag',
  'Schwarzwälder Bote (Calwer Kreiszeitung, Der Gesellschafter, Nagolder Tagblatt)': 'Schwarzwälder Bote GmbH & Co. KG',
  'Schwarzwälder Bote (Kreisnachrichten, Der Gesellschafter, Der Enztäler)': 'Schwarzwälder Bote GmbH & Co. KG',
  'Schwarzwälder Bote (Kreisnachrichten, Der Gesellschafter)': 'Schwarzwälder Bote GmbH & Co. KG',
  'Oberpfälzer Nachrichten': 'Mittelbayerische Zeitung',
  'Frankenpost (Hofer Anzeiger)': 'Süddeutscher Verlag',
  'Der neue Tag (Weiden)': 'Der neue Tag Verlagshaus',
  'NZ. Nürnberger Zeitung (NZ. Nordbayerische Zeitung)': 'Nordbayerische Verlagsgesellschaft',
  'Windsheimer Zeitung': 'Heinrich Delp GmbH',
  'Main-Post/Volksblatt': 'Mediengruppe Pressedruck',
  'Saale-Zeitung': 'Mediengruppe Oberfranken',
  'Lausitzer Rundschau': 'Neue Pressegesellschaft',
  'Mitteldeutsche Zeitung': 'Mediengruppe Mitteldeutsche Zeitung',
  'Thüringische Landeszeitung/Thüringer Allgemeine': 'Funke Medien',
  'Wolfsburger Allgemeine': 'Madsack',
  'WAZ. Westdeutsche Allgemeine/Neue Ruhr Zeitung': 'Funke Medien',
  'Gmünder Tagespost': 'SDZ Druck und Medien GmbH',
  'Südkurier': 'Südkurier GmbH',
  'Straubinger Tagblatt': 'Attenkofer´sche Buch- und Kunstdruckerei',
  'Allgäuer Zeitung (Memminger Zeitung)': 'Allgäuer Zeitungsverlag',
  'Saarbrücker Zeitung': 'Saarbrücker Zeitung Medienhaus GmbH'
};

// STEP 1: Load and normalize the original file (which has all the websites!)
console.log('Loading original zeitungen_by_ags.json with all existing data...');
const originalPath = path.join(__dirname, 'archive', 'zeitungen_by_ags_original.json');
const originalData = JSON.parse(fs.readFileSync(originalPath, 'utf8'));
console.log(`Loaded ${Object.keys(originalData).length} regions`);

// Normalize AGS codes and preserve ALL data
const zeitungenByAgs = {};

Object.entries(originalData).forEach(([ags, regionData]) => {
  // IMPORTANT: Strip leading zeros to match geodata.js format
  // geodata.js uses "1001" while original uses "01001"
  const normalizedAgs = String(parseInt(ags, 10));

  // Copy all region data, but clean up verlag field
  zeitungenByAgs[normalizedAgs] = {
    name: regionData.name || '',
    count: regionData.count || 0,
    zeitungen: (regionData.zeitungen || []).map(newspaper => {
      // Use clean publisher name if available, otherwise keep original
      const verlag = cleanPublisherNames[newspaper.name] || newspaper.verlag || '';

      return {
        ...newspaper,
        verlag: verlag
      };
    })
  };
});

// STEP 2: Optionally enrich verlag data from newspaper_data_fixed.json
console.log('\nEnriching verlag data from newspaper_data_fixed.json...');
const fixedDataPath = path.join(__dirname, 'public', 'newspaper_data_fixed.json');
let verlagEnriched = 0;

if (fs.existsSync(fixedDataPath)) {
  const fixedData = JSON.parse(fs.readFileSync(fixedDataPath, 'utf8'));

  // Build a map for faster lookup
  const fixedByAgsAndName = {};
  fixedData.forEach(entry => {
    const ags = String(parseInt(entry.AGS, 10));
    const name = entry.Titel;
    const key = `${ags}:${name}`;
    fixedByAgsAndName[key] = entry['Besitz/Verlag/Anmerkungen (wenn neu recherchiert)'] || '';
  });

  // Enrich verlag ONLY where it's empty and fixed data is concise (< 150 chars)
  Object.entries(zeitungenByAgs).forEach(([ags, region]) => {
    region.zeitungen.forEach(newspaper => {
      const key = `${ags}:${newspaper.name}`;
      const fixedVerlag = fixedByAgsAndName[key];

      // Only enrich if:
      // 1. Original verlag is empty
      // 2. Fixed verlag exists and is concise (< 150 chars = likely actual publisher name, not research notes)
      const currentVerlag = newspaper.verlag || '';
      if (!currentVerlag.trim() && fixedVerlag && fixedVerlag.length < 150) {
        newspaper.verlag = fixedVerlag;
        verlagEnriched++;
      }
    });
  });

  console.log(`Enriched verlag for ${verlagEnriched} newspapers`);
} else {
  console.log('newspaper_data_fixed.json not found, skipping verlag enrichment');
}

// Count statistics
const totalRegions = Object.keys(zeitungenByAgs).length;
const totalNewspapers = Object.values(zeitungenByAgs).reduce((sum, region) => sum + region.count, 0);
const uniqueNewspapers = new Set(
  Object.values(zeitungenByAgs).flatMap(region => region.zeitungen.map(z => z.name))
).size;

// Count newspapers with complete metadata
let withVerlag = 0;
let withoutVerlag = 0;
let withWebsite = 0;
let withoutWebsite = 0;
let withErscheinungsort = 0;
let withBundesland = 0;

Object.values(zeitungenByAgs).forEach(region => {
  region.zeitungen.forEach(z => {
    if (z.verlag && z.verlag.trim()) {
      withVerlag++;
    } else {
      withoutVerlag++;
    }
    if (z.website && z.website.trim()) {
      withWebsite++;
    } else {
      withoutWebsite++;
    }
    if (z.erscheinungsort && z.erscheinungsort.trim()) {
      withErscheinungsort++;
    }
    if (z.bundesland && z.bundesland.trim()) {
      withBundesland++;
    }
  });
});

console.log('\nTransformation complete:');
console.log(`- Regions: ${totalRegions}`);
console.log(`- Total newspaper entries: ${totalNewspapers}`);
console.log(`- Unique newspapers: ${uniqueNewspapers}`);
console.log(`\nData completeness:`);
console.log(`- With publisher data: ${withVerlag} (${(withVerlag/totalNewspapers*100).toFixed(1)}%)`);
console.log(`- Without publisher data: ${withoutVerlag} (${(withoutVerlag/totalNewspapers*100).toFixed(1)}%)`);
console.log(`- With website: ${withWebsite} (${(withWebsite/totalNewspapers*100).toFixed(1)}%)`);
console.log(`- Without website: ${withoutWebsite} (${(withoutWebsite/totalNewspapers*100).toFixed(1)}%)`);
console.log(`- With erscheinungsort: ${withErscheinungsort} (${(withErscheinungsort/totalNewspapers*100).toFixed(1)}%)`);
console.log(`- With bundesland: ${withBundesland} (${(withBundesland/totalNewspapers*100).toFixed(1)}%)`);

// Write output
console.log('\nWriting to:', outputPath);
fs.writeFileSync(outputPath, JSON.stringify(zeitungenByAgs, null, 2), 'utf8');
console.log('Done!');
