// This script runs in the parent context when using the iframe.
(function(){
  // If we are inside an iframe, set up a lightweight bridge object
  // This file is intended to be loaded in the iframe or parent depending on inclusion.

  // When included in the parent page (Shiny UI), expose handlers for sending messages into the iframe.
  if (window.self !== window.top) {
    // inside iframe - provide LabBridge to widget to send state to parent via postMessage
    window.LabBridge = {
      postState: function(obj){
        console.log('[LabBridge] posting state to parent', obj);
        window.parent.postMessage({type: 'widgetState', json: obj}, '*');
      }
    };
  } else {
    // parent window: forward messages from iframe to Shiny input
    window.addEventListener('message', function(ev){
      try{
        var d = ev.data;
        console.log('[Bridge parent] received postMessage', d);
        if (d && d.type === 'widgetState'){
          // send to Shiny input
          if (window.Shiny && Shiny.setInputValue){
            console.log('[Bridge parent] forwarding to Shiny.setInputValue');
            Shiny.setInputValue('widget_state', d.json, {priority: 'event'});
          } else {
            console.warn('[Bridge parent] Shiny not available to receive widget_state');
          }
        }
      }catch(e){ console.warn(e) }
    }, false);

    // Accept custom messages from Shiny to load state into iframe
    if (window.Shiny && Shiny.addCustomMessageHandler){
      Shiny.addCustomMessageHandler('loadWidgetState', function(message){
        // message: {json: ...}
        var iframe = document.getElementById('widget_iframe');
        if (!iframe) return;
        iframe.contentWindow.postMessage({type: 'loadWidgetState', json: message.json}, '*');
      });
      // allow server to set iframe src (switch widget)
      Shiny.addCustomMessageHandler('setWidgetSrc', function(message){
        var iframe = document.getElementById('widget_iframe');
        if (!iframe) return;
        console.log('[Bridge parent] setting iframe src to', message.src);
        iframe.src = message.src;
      });
      // set iframe src and store the provided JSON/state on the iframe element (dataset)
      // The iframe's wrapper will read this dataset and use it during its initial init to avoid
      // running a test_data init followed by a load (which caused duplicate dynamic content).
      Shiny.addCustomMessageHandler('setWidgetSrcAndState', function(message){
        // message: {src: 'estrousCycleScoring.html', json: {...}, mode: 'edit' }
        var iframe = document.getElementById('widget_iframe');
        if (!iframe) return;
        console.log('[Bridge parent] setWidgetSrcAndState: src=', message.src);
        try{
          iframe.dataset.initialState = JSON.stringify(message.json);
          if (message.mode) iframe.dataset.initialMode = message.mode;
        }catch(e){ console.warn('[Bridge parent] could not set dataset.initialState', e); }
        // Force a fresh load to ensure a clean DOM (add cache-busting param)
        var src = message.src + (message.src.indexOf('?') === -1 ? '?' : '&') + '_ts=' + Date.now();
        iframe.src = src;
      });
      // allow server to request the iframe to return its JSON (parent will forward to Shiny)
      Shiny.addCustomMessageHandler('requestWidgetJson', function(message){
        var iframe = document.getElementById('widget_iframe');
        if (!iframe) return;
        console.log('[Bridge parent] requesting widget JSON from iframe');
        iframe.contentWindow.postMessage({type: 'requestWidgetJson'}, '*');
      });
      // allow server to change widget mode (edit/view)
      Shiny.addCustomMessageHandler('setWidgetMode', function(message){
        var iframe = document.getElementById('widget_iframe');
        if (!iframe) return;
        console.log('[Bridge parent] setting widget mode to', message.mode);
        iframe.contentWindow.postMessage({type: 'setWidgetMode', mode: message.mode}, '*');
      });
    }
  }
})();
