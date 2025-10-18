Estrous Cycle plugin (LabArchives → Obsidian)

What this scaffold does
- Provides an Obsidian plugin scaffold that stores estrous widget instances in YAML frontmatter under the key `estrous_widgets`.
- Adds commands to insert a template frontmatter and open a modal editor.
- Adds a right pane view scaffold where the original widget UI will be ported.

Build & install (local development)
1. From the plugin folder, install dependencies:

```bash
cd Obsidian/estrous-cycle-plugin
npm install
```

2. Build TypeScript:

```bash
npm run build
```

3. Copy the plugin folder into your Obsidian vault's `.obsidian/plugins/estrous-cycle-plugin` folder (or use symlink during development).
4. In Obsidian, enable the plugin in Settings → Community plugins.

Notes
- The scaffold uses `js-yaml` to safely parse/stringify frontmatter. If you edit frontmatter by hand, ensure valid YAML.
- The pane currently contains a placeholder; next step is porting the widget's UI and JS (cards, table, charts) into the pane and replacing LabArchives persistence with frontmatter reads/writes.

Next steps I will implement (after you confirm):
- Port the existing `scriptEditor.js` logic into the pane UI, preserving function names and behavior.
- Wire in Google Charts and recreate charts used by the widget.
- Implement CSV/export & copy behaviors inside the plugin pane.

If you'd like to proceed, confirm and I'll continue porting the widget UI into the pane.
