# Astro Starter Kit: Minimal

```sh
npm create astro@latest -- --template minimal
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/minimal)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/minimal)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/minimal/devcontainer.json)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 📊 Data Sources

The project uses newspaper data for German regions, organized in the following files:

### Primary Data Files

#### `public/newspaper_data_fixed.json` (Added: April 28, 2025)
- **Structure**: Array of newspaper entries with temporal and ownership data
- **Total entries**: 1,149
- **Unique newspapers**: 791
- **Key fields**:
  - `Titel`: Newspaper name
  - `AGS`: Amtlicher Gemeindeschlüssel (region code)
  - `Besitz/Verlag/Anmerkungen`: Publisher and ownership information
  - Temporal data: Years 1989-2023 (binary presence indicator)
- **Characteristics**: Rich metadata including publisher history and ownership changes

#### `public/zeitungen_by_ags.json` (Added: May 20, 2025)
- **Structure**: Object indexed by AGS codes, grouping newspapers by region
- **Total entries**: 1,186 (newspapers across all regions)
- **Unique newspapers**: 730
- **Regional entries**: 402
- **Key fields per newspaper**:
  - `name`: Newspaper name
  - `verlag`: Publisher
  - `erscheinungsort`: Place of publication
  - `bundesland`: Federal state
  - `website`: Website URL
- **Characteristics**: Optimized for map visualization, currently used by the application
- **Note**: Some entries have empty metadata fields (verlag, erscheinungsort, website)

#### `archive/zeitungen_by_ags_original.json`
- **Purpose**: Archived version of the region-indexed data
- **Difference from current**: Contains publisher data that was lost in current version
- **Example**: "Märkische Allgemeine" shows `"verlag": "seit 1991: FAZ, seit 2012: Madsack"` in archive but `"verlag": ""` in current version

### Data Relationships

- **Duplicates across regions**: Newspapers serving multiple regions appear multiple times
  - Example: "Die Rheinpfalz" appears in 15 different regions
  - Example: "Rheinische Post" appears in 13 different regions
  - This explains why zeitungen_by_ags.json has 1,186 entries from only 730 unique newspapers

- **Missing metadata**: 56 newspapers (4%) in zeitungen_by_ags.json have all fields empty
  - These newspapers exist in newspaper_data_fixed.json with complete metadata
  - Data was lost during transformation process

### Data Transformation History

Based on git history:
1. **April 28, 2025**: `newspaper_data_fixed.json` added (research dataset)
2. **May 20, 2025**: `zeitungen_by_ags.json` added (region-indexed structure for map)

The current application uses `zeitungen_by_ags.json` for the map visualization, as it's structured by AGS codes for efficient lookup.

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
