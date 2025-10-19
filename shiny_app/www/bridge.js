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
        // Forward lifecycle or status messages from the iframe to Shiny so server can react
        else if (d && (d.type === 'widgetInitCalled' || d.type === 'widgetReady' || d.type === 'widgetModeChanged')){
          if (window.Shiny && Shiny.setInputValue){
            console.log('[Bridge parent] forwarding iframe event to Shiny:', d.type);
            // include a timestamp to ensure Shiny sees a change each time
            var payload = Object.assign({}, d, {__ts: (new Date()).toISOString()});
            Shiny.setInputValue('iframe_event', payload, {priority: 'event'});
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
