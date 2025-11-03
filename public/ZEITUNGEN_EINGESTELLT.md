# Archiv eingestellter Zeitungen

Diese Datei dokumentiert Lokalzeitungen, die eingestellt wurden.

## Datei: `zeitungen_eingestellt.json`

### Struktur

```json
{
  "AGS_CODE": {
    "name": "Landkreisname",
    "zeitungen": [
      {
        "name": "Zeitungsname",
        "verlag": "Verlagsname",
        "erscheinungsort": "Stadt",
        "bundesland": "Bundesland",
        "website": "URL (falls noch verfügbar)",
        "eingestelltAm": "YYYY-MM-DD",
        "anmerkung": "Optional: Grund/Kontext der Einstellung"
      }
    ]
  }
}
```

### Felder

- **eingestelltAm**: Datum der Einstellung (ISO-Format: YYYY-MM-DD)
- **anmerkung**: Optionaler Hinweis (z.B. "Mit [Zeitung] vereint", "Insolvenz", etc.)

### Neue Zeitung hinzufügen

1. Zeitung aus `zeitungen_by_ags.json` entfernen
2. In `zeitungen_eingestellt.json` mit Einstellungsdatum eintragen
3. Pull Request erstellen

## Einträge

### 2025

- **Bürstädter Zeitung** (Kreis Bergstraße) - Mit Starkenburger Echo vereint (01.01.2025)
