module.exports = class MinimalPlugin extends (require('obsidian').Plugin) {
  onload() {
    console.log('Minimal plugin loaded');
    new (require('obsidian').Notice)('Minimal estrous plugin loaded');
  }
  onunload() {
    console.log('Minimal plugin unloaded');
  }
};
