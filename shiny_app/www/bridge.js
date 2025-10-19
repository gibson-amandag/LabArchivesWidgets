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
    }
  }
})();
