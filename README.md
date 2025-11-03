# Papertrail

**Papertrail ist eine Open-Source-Anwendung, die Lokalzeitungen in Deutschland auf einer interaktiven Karte nach Landkreis visualisiert.**

Die App basiert auf dem Zeitungsverzeichnis des Bundesverband Digitalpublisher und Zeitungsverleger (BDZV) und wurde durch eigene Recherchen ergänzt. Die Datengrundlage erhebt keinen Anspruch auf Vollständigkeit – sie umfasst größtenteils Zeitungen, die an der ma (Media Analyse) teilnehmen.

## Zeitung hinzufügen oder korrigieren

Da sowohl Code als auch Datenbasis offen zugänglich sind, kann jeder fehlende Zeitungen ergänzen oder veraltete Informationen korrigieren:

1. **Datei bearbeiten**: `public/zeitungen_by_ags.json`
2. **Format**: Strukturiert nach AGS-Code (Amtlicher Gemeindeschlüssel)
3. **Pull Request erstellen**: Änderungen über GitHub einreichen

## 🚀 Development

```bash
npm install          # Abhängigkeiten installieren
npm run dev          # Dev-Server starten (localhost:4321)
npm run build        # Production Build
npm run preview      # Build lokal testen
```

## Technologie

- **Framework**: Astro (Static Site Generation)
- **Karte**: Leaflet.js mit Choropleth-Visualisierung
- **Datenbasis**: JSON, strukturiert nach AGS-Codes

## Datenquellen

- `public/zeitungen_by_ags.json` - Hauptdatei (nach AGS indexiert)
- `public/geodata.js` - GeoJSON für deutsche Landkreise
- Details zur Datenstruktur siehe [CLAUDE.md](CLAUDE.md)
