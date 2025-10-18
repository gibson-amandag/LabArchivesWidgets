export const shimScript = `
// LabArchives compatibility shim for Obsidian pane
(function(){
  // parent_form_script and parent_class provide minimal methods expected by the widget
  window.parent_form_script = window.parent_form_script || {
    _getWidgetData: null,
    init: function(mode, getWidgetDataFn){ this._getWidgetData = getWidgetDataFn; },
    test_data: function(){ return JSON.stringify({}); },
    to_json: function(){ if(this._getWidgetData) return this._getWidgetData(); return JSON.stringify({}); },
    from_json: function(s){ /* no-op */ },
    resize_container: function(){ /* no-op in Obsidian pane */ }
  };
  // alias expected name
  window.parent_class = window.parent_form_script;

  // Provide hooks that the plugin will set so shim can call back to save/load
  window.loadEstrousInstances = window.loadEstrousInstances || function(){ return Promise.resolve([]); };
  window.saveEstrousInstances = window.saveEstrousInstances || function(instances){ return Promise.resolve(); };

  // Utility: allow widget to call a global save function when it wants to persist
  window.saveWidgetToFrontmatter = async function(widgetOutput){
    // widgetOutput is expected to be a JSON string
    try{
      const parsed = JSON.parse(widgetOutput);
      // plugin will override saveEstrousInstances to handle persistence; we'll call it with array of one item
      await window.saveEstrousInstances([parsed]);
    }catch(e){ console.error('Failed to save widget output', e); }
  };
})();
`;
