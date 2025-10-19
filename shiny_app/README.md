# Minimal LabArchives Widgets Shiny App

This small example shows how to embed an existing LabArchives widget HTML into an RShiny app, and save/load its JSON state to disk.

Structure:
- `app.R` - the Shiny app
- `www/widget.html` - the widget HTML (stripped down)
- `www/bridge.js` - JS that mediates between the widget and Shiny
- `data/` - where JSON states are saved


Run:

1. From the `shiny_app` folder run (this ensures `www/` and `data/` are on the app's working path):

```bash
R -e "shiny::runApp('.')"
```

2. The widget HTML is served from `shiny_app/www` and is embedded by the app as `widget.html`.
3. Use the Save/Load buttons in the app to persist widget JSON to `shiny_app/data/`.

Debugging tip:
- Open your browser developer tools (Console). When you click the widget's "Send state to parent" button you should see logs from both the widget (iframe) and the parent bridge, e.g. `[widget] emitState ...` in the iframe console and `[Bridge parent] received postMessage ...` in the parent console. If you don't see these logs, open the console for the iframe or the parent page and try again.

Notes:
- This is a minimal proof-of-concept. For production, add validation, user isolation, and stronger file handling.
