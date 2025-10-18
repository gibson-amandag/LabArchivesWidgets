"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scriptEditorCode = void 0;
exports.scriptEditorCode = `
/* Minimal embedded version of scriptEditor.js for Obsidian pane.
   This preserves the widget API (my_widget_script.init/to_json/from_json)
   and keeps state fields (mouseNums, mice) so the shim can call into it.
*/
var my_widget_script = {
  mouseNums: [],
  mice: {},
  dates: {},

  init: function(mode, json_data) {
    try {
      var parsed = this.parseInitJson(json_data);
      if (parsed) {
        if (parsed.mice) this.mice = parsed.mice;
        if (parsed.mouseNums) this.mouseNums = parsed.mouseNums;
      }
      // call parent init to populate any static inputs
      if (this.parent_class && this.parent_class.init) {
        this.parent_class.init(mode, function(){ return JSON.stringify((parsed && parsed.widgetData) ? parsed.widgetData : {}); });
      }
      // lightweight hooks
      this.addEventListeners();
      this.makeCharts();
    } catch (err) {
      console.error('my_widget_script.init error', err);
    }
  },

  to_json: function() {
    var widgetJsonString = (this.parent_class && this.parent_class.to_json) ? this.parent_class.to_json() : '{}';
    var output = {
      widgetData: JSON.parse(widgetJsonString || '{}'),
      mouseNums: this.mouseNums,
      mice: this.mice
    };
    return JSON.stringify(output);
  },

  from_json: function(json_data) {
    try {
      var parsed = JSON.parse(json_data);
      if (this.parent_class && this.parent_class.from_json) {
        this.parent_class.from_json(JSON.stringify(parsed.widgetData || {}));
      }
      if (parsed.mice) this.mice = parsed.mice;
      if (parsed.mouseNums) this.mouseNums = parsed.mouseNums;
    } catch (err) {
      console.error('my_widget_script.from_json error', err);
    }
  },

  parseInitJson: function(json_data) {
    var jsonString = (typeof json_data === 'string') ? json_data : ((typeof json_data === 'function') ? json_data() : '{}');
    return JSON.parse(jsonString || '{}');
  },

  addEventListeners: function() {
    // placeholder for original event wiring
  },

  makeCharts: function() {
    // placeholder for Google Charts render code; left intentionally minimal
  },

  is_valid: function() { return []; },
  is_edited: function() { return (this.parent_class && this.parent_class.is_edited) ? this.parent_class.is_edited() : false; },
  reset_edited: function() { if (this.parent_class && this.parent_class.reset_edited) this.parent_class.reset_edited(); }
};

/* End minimal scriptEditor */
`;
