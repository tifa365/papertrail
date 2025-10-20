# Data Directory

This directory contains the core newspaper data for the Papertrail project.

## Files

### zeitungen_by_ags.json
**Main dataset** - Complete newspaper data organized by AGS (Amtlicher Gemeindeschlüssel) regional codes.

- **Structure**: `{ "AGS": { name, count, zeitungen: [...] } }`
- **Total entries**: 1,186 newspapers across all German regions
- **Coverage**: 100% of entries have website URLs
- **Fields per newspaper**:
  - `name`: Newspaper name
  - `verlag`: Publisher
  - `erscheinungsort`: Place of publication
  - `bundesland`: Federal state
  - `website`: Newspaper website URL

**Note**: This file is also available in `public/zeitungen_by_ags.json` for frontend access.

### unique-newspapers.json
**Deduplicated dataset** - List of unique newspapers by name.

- **Structure**: Array of unique newspaper entries
- **Total entries**: 729 unique newspaper names
- **Additional info**: Each entry includes a `regions` array listing all AGS codes where the newspaper appears
- **Purpose**: Useful for analysis, avoiding double-counting newspapers that appear in multiple regions

## Data Quality

- All entries include verified website URLs
- Data includes only local daily newspapers (Tageszeitungen)
- Excludes advertising papers and national newspapers
- Some fields may be incomplete and are being continuously updated

## Usage

These files are the source of truth for the application. The `public/` directory contains copies used by the frontend application.

## Updates

Last updated: October 2025
- Added 123 manually researched website URLs
- Achieved 100% URL coverage
