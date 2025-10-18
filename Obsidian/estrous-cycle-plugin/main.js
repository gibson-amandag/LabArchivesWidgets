// Wrapper entry for Obsidian plugin loader
// Loads the compiled bundle under ./dist and exports the plugin class.
const path = require('path');
try {
  const bundlePath = path.join(__dirname, 'dist', 'main.js');
  const mod = require(bundlePath);
  module.exports = (mod && mod.__esModule && mod.default) ? mod.default : mod;
} catch (e) {
  console.error('Failed to load dist/main.js from plugin root (resolved via __dirname):', e);
  throw e;
}
