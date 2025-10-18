const { Plugin, Notice, Modal, ItemView } = require('obsidian');
// no external YAML dependency; we'll extract the estrous_widgets block as raw text

module.exports = class EstrousV2 extends Plugin {
  onload() {
    this.addCommand({
      id: 'insert-estrous-template-v2',
      name: 'Insert Estrous template (v2)',
      callback: () => this.insertTemplateFrontmatter()
    });

    this.addCommand({
      id: 'open-estrous-modal-v2',
      name: 'Open Estrous modal (v2)',
      callback: () => this.openModal()
    });

    this.registerView('estrous-v2-view', (leaf) => new EstrousV2View(leaf, this));
    this.addCommand({
      id: 'open-estrous-pane-v2',
      name: 'Open Estrous pane (v2)',
      callback: () => this.openPane()
    });

    console.log('Estrous v2 plugin loaded');
  }

  onunload() { console.log('Estrous v2 plugin unloaded'); }
  
  async onunload() {
    this.app.workspace.detachLeavesOfType('estrous-v2-view');
    console.log('Estrous v2 plugin unloaded');
  }

  async insertTemplateFrontmatter() {
    const file = this.app.workspace.getActiveFile();
    if (!file) { new Notice('Open a note to insert the estrous template'); return; }

    const template = `---\nestrous_widgets:\n  - name: "Example v2"\n    mouseNums: [1]\n    mice:\n      "1":\n        id: "M1"\n        cycleNum: 1\n        startDate: "2021-01-01"\n        endDate: "2021-01-05"\n    dates: {}\n---\n\n`;

    const text = await this.app.vault.read(file);
    await this.app.vault.modify(file, template + text);
    new Notice('Inserted estrous template (v2)');
  }

  async openModal() {
    const file = this.app.workspace.getActiveFile();
    if (!file) { new Notice('Open a note to view estrous data'); return; }
    const text = await this.app.vault.read(file);
    const fmMatch = text.match(/^---\n([\s\S]*?)\n---/);
    let display = '(no frontmatter)';
    if (fmMatch) {
      const fmText = fmMatch[1];
      // extract the estrous_widgets block as raw YAML
      const ewMatch = fmText.match(/estrous_widgets:\n([\s\S]*)/);
      if (ewMatch) {
        // trim trailing lines that aren't part of the block by stopping at a top-level key (no indent)
        const block = ewMatch[1].split('\n');
        const lines = [];
        for (const ln of block) {
          if (/^\S/.test(ln)) break; // top-level key reached
          lines.push(ln);
        }
        display = lines.join('\n').trim() || '(empty estrous_widgets)';
      } else {
        display = '(estrous_widgets not found in frontmatter)';
      }
    }

    const modal = new Modal(this.app);
    modal.titleEl.setText('Estrous frontmatter (v2)');
    modal.contentEl.createEl('pre', { text: display });
    modal.open();
  }

  async openPane() {
    // create a right leaf and open our registered view type
    this.app.workspace.detachLeavesOfType('estrous-v2-view');
    const leaf = await this.app.workspace.getRightLeaf(false);
    await leaf.setViewState({ type: 'estrous-v2-view' });
    // simple injection: find the container and append our HTML when the leaf mounts
    // Attempt to find the right-most view-content element (the right pane) and append our UI
  const tryInject = (attemptsLeft) => {
      try {
        const nodes = document.querySelectorAll('.workspace-leaf-content .view-content');
        if (!nodes || nodes.length === 0) {
          if (attemptsLeft > 0) return setTimeout(() => tryInject(attemptsLeft - 1), 150);
          console.warn('Estrous v2: no view-content nodes found to inject into');
          return;
        }
        const container = nodes[nodes.length - 1]; // choose the right-most pane
        if (!container) {
          if (attemptsLeft > 0) return setTimeout(() => tryInject(attemptsLeft - 1), 150);
          return;
        }
  // avoid double-injection
  if (container.querySelector('#estrous-v2-root')) return;
        const root = document.createElement('div');
        root.id = 'estrous-v2-root';
        root.innerHTML = `
          <div style="padding:12px; border:1px solid #ccc">
            <h3>Estrous widget (v2 pane)</h3>
            <div id="widgetContainer">Widget HTML will load here</div>
          </div>
        `;
        container.appendChild(root);

        // inject shim once
        if (!document.getElementById('estrous-v2-shim')){
          const shim = document.createElement('script');
          shim.type = 'text/javascript';
          shim.id = 'estrous-v2-shim';
          shim.text = `(function(){ window.parent_form_script = window.parent_form_script || { init: function(){}, to_json: function(){ return JSON.stringify({}); }, from_json: function(){}}; window.parent_class = window.parent_form_script; })();`;
          document.head.appendChild(shim);
        }
        console.log('Estrous v2: injected pane content');
      } catch (e) {
        console.error('Failed to inject estrous pane content', e);
      }
    };

    tryInject(8);
  }

}

class EstrousV2View extends ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
  }
  getViewType() { return 'estrous-v2-view'; }
  getDisplayText() { return 'Estrous v2'; }
  async onOpen() {
    // render placeholder into the containerEl
    const container = this.containerEl;
    container.empty();
    const root = container.createEl('div');
    root.id = 'estrous-v2-root';
    // Insert the original labArchives.html content from Mouse/estrousCycleScoring
    root.innerHTML = `
<!-- Note: external stylesheet removed to comply with Obsidian CSP; styles below are inline -->
<style type="text/css">
    /* TO DO Place css styling code here */

    /* responsive table doesn't work with xs screen sizes for some reason, so apply a specific width for these */
    @media (max-width: 576px) {
        .xsTableDiv {
            width: 300px !important;
            overflow-x: scroll;
        }
    }

    table {
        border: 2px solid black;
    }

    th {
        padding: 5px;
        border: 2px solid black;
    }

    td {
        padding: 5px;
        border: 1px solid black;
    }

    .fullWidth {
        width: 100%
    }

    button.card-header{
        border: none;
    }
</style>

<!-- TO DO Begin typing your HTML code here -->
<div class="container" id = "addMouseDiv">
    <div class="row mt-2 align-items-center">
        <h3 class="myLeftCol">Mouse Info:</h3>
        <div class="col hideView">
            <input type="button" value="Add new mouse" id="addMouse" name="addmouse" class="fullWidth"/>
        </div>
    </div>
    <div class="row mouseInfo">
        &nbsp;
    </div>
</div>

<div class="container mt-2">
    <div class="row">
        <div class="col-12 col-md font-weight-bold">Sort:</div>
        <div class="col-12 col-md">
            <input type="button" value="By Date" id="sortByDate" name="sortbydate" class="sortButton fullWidth" data-sort="date" />
            </div>
        <div class="col-12 col-md">
            <input type="button" value="By Mouse" id="sortByMouse" name="sortbymouse" class="sortButton fullWidth" data-sort="mouse" />
        </div>
        <div class="col-12 col-md">
            <input type="button" value="By Day" id="sortByDay" name="sortbyday" class="sortButton fullWidth" data-sort="day" />
        </div>
    </div>
    <div class="row mt-2">
        <div class="col">
            <input type="button" value="Show only scoring" id="scoringButton" name="scoringbutton" class="toggleSpec fullWidth"/>
        </div>
    </div>
</div>

<div class="container mt-4 cardContainer">
    <div class="madeCards">
        &nbsp;
    </div>
</div>

<div class="container mt-2" id="copyDiv">
    <div class="row mt-2">
        <div class="col-12 col-sm-6"><input id="toggleTable2" name="toggletable2" type="button"
                value="Show/Hide Table" class="fullWidth toggleTable" data-table="mouseTable"/>
        </div>
        
        <div class="col-12 col-sm-6"><input id="toCSV2" name="tocsv2" type="button" value="Save CSV"
                class="fullWidth toCSV" data-table="mouseTable" /></div>
    </div>
    <div class="row">
        <h4 class="col">Copy options:</h4>
    </div>
    <div class="row mt-2">
        <div class="col-12 col-sm-6">Copy all days, mice as row, without head</div>
        <div class="col">
            <input type="button" id="copyDataButton" name="copydatabutton" value="Copy all" class="fullWidth copyData" data-table="mouseTable" data-copy="simple">
        </div>
    </div>
    <div class="row mt-3">
        <div class="col">Use the buttons below to copy with different orientations, with or without the heading. 
            Enter the start day and end day below before pressing the desired copy button. If it doesn't work the first time, try it again.</div>
    </div>
    <div class="row mt-2">
        <div class="col-12 col-sm-6">
            <div class="row">
                <div class="col-12">
                    Start day for copy (#):
                </div>
                <div class="col">
                    <input type="number" id="startDayCopy" name="startdaycopy" value="1" class="editOnView fullWidth"/>
                </div>
            </div>
        </div>
        <div class="col-12 col-sm-6">
            <div class="row">
                <div class="col-12">
                    End day for copy (#):
                </div>
                <div class="col">
                    <input type="number" id="endDayCopy" name="enddaycopy" value="21" class="editOnView fullWidth"/>
                </div>
            </div>
        </div>
    </div>
    <div class="row mt-2">
        <div class="col-12 col-sm-6">
            <input id="copyDataButton2" name="copydatabutton2" type="button" value="Mice as rows, no head" class="fullWidth copyData" data-table="mouseTable" data-copy="options" data-head="false" data-transpose="false"/>
        </div>
        <div class="col-12 col-sm-6">
            <input id="copyDataButton3" name="copydatabutton3" type="button" value="Mice as cols, no head" class="fullWidth copyData" data-table="mouseTable" data-copy="options" data-head="false" data-transpose="true"/>
        </div>
        <div class="col-12 col-sm-6">
            <input id="copyDataButton4" name="copydatabutton4" type="button" value="Mice as rows, heading" class="fullWidth copyData" data-table="mouseTable" data-copy="options" data-head="true" data-transpose="false"/>
        </div>
        <div class="col-12 col-sm-6">
            <input id="copyDataButton5" name="copydatabutton5" type="button" value="Mice as cols, heading" class="fullWidth copyData" data-table="mouseTable" data-copy="options" data-head="true" data-transpose="true"/>
        </div>
    </div>

    <div id="forCopy">&nbsp;</div>
    <!-- Error Message Div -->
    <div class="container" id="errorMsg">&nbsp;</div>

</div>
    
<!-- Example Table Container that is responsive to window width, including for xs -->
<div class="container mt-2 tableOuterDiv">
    <div class="table-responsive xsTableDiv">
        <table class="table" id="mouseTable">
            <thead>
                <tr>
                    <th class="mouse">mouseID</th>
                    <th class="cycleNum">cycleID</th>
                    <th class="startDate">cycleStartDate</th>
                </tr>
            </thead>
            <tbody>
            </tbody>
        </table>
        <p>&nbsp;</p>
    </div>
</div>


<div class="container">
    <div class="row">
        <div class="col"><input type="button" value="Update Charts" id="makeCharts" name="makecharts"></div>
    </div>
</div>
<div class="container" id="chartDiv">&nbsp;
</div>

<div class="container">&nbsp;</div>
`;

    // Setup plugin-backed helpers on window so the injected widget script can read/write frontmatter
    const plugin = this.plugin;
    // read stored estrous widget JSON (returns the raw JSON string or null)
    window.__estrous_v2_readFrontmatter = async function() {
      try {
        const file = plugin.app.workspace.getActiveFile();
        if(!file) return null;
        const text = await plugin.app.vault.read(file);
        const fmMatch = text.match(/^---\n([\s\S]*?)\n---/);
        if(!fmMatch) return null;
        const fmText = fmMatch[1];
        // find first estrous_widgets entry raw block
        const rawMatch = fmText.match(/estrous_widgets:\n([\s\S]*)/);
        if(!rawMatch) return null;
        const block = rawMatch[1].split('\n');
        // locate 'raw: |' line
        let found = false;
        const lines = [];
        for (let i = 0; i < block.length; i++){
          const ln = block[i];
          if(/\braw:\s*\|\s*$/.test(ln)){
            found = true; // subsequent indented lines are the content
            for (let j = i+1; j < block.length; j++){
              const l2 = block[j];
              if(/^\s{2,}\S/.test(l2)){
                // trim leading indentation (2 spaces minimum)
                lines.push(l2.replace(/^\s{2}/,''));
              } else {
                break;
              }
            }
            break;
          }
        }
        if(!found) return null;
        const jsonText = lines.join('\n').trim();
        return jsonText || null;
      } catch (e) {
        console.error('readFrontmatter error', e);
        return null;
      }
    };

    // write widget JSON string into frontmatter under estrous_widgets[0].raw (creates frontmatter if missing)
    window.__estrous_v2_writeFrontmatter = async function(widgetJsonString) {
      try {
        const file = plugin.app.workspace.getActiveFile();
        if(!file) throw new Error('No active file');
        const text = await plugin.app.vault.read(file);
        const fmMatch = text.match(/^---\n([\s\S]*?)\n---/);
        let newFm = '';
        const rawLines = widgetJsonString.split('\n').map(l => '      ' + l).join('\n');
        const estrousBlock = `estrous_widgets:\n  - name: "Estrous v2"\n    raw: |\n${rawLines}\n`;
        if(!fmMatch){
          // create frontmatter
          newFm = `---\n${estrousBlock}---\n\n` + text;
        } else {
          const fmText = fmMatch[1];
          // if estrous_widgets exists, replace the whole block after 'estrous_widgets:' up to next top-level key or end
          if(/estrous_widgets:\n/.test(fmText)){
            const before = fmText.split(/estrous_widgets:\n/)[0];
            const newFmText = before + estrousBlock;
            newFm = text.replace(/^---\n([\s\S]*?)\n---/, `---\n${newFmText}\n---`);
          } else {
            // append estrous_widgets to frontmatter
            const newFmText = fmText + '\n' + estrousBlock;
            newFm = text.replace(/^---\n([\s\S]*?)\n---/, `---\n${newFmText}\n---`);
          }
        }
        await plugin.app.vault.modify(file, newFm);
        return true;
      } catch (e) {
        console.error('writeFrontmatter error', e);
        return false;
      }
    };

    // Inject the original scriptEditor.js content from plugin-local file so my_widget_script is defined verbatim
    try {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.id = 'estrous-v2-widget-script';
      // Read the local copy placed next to this plugin main
      script.text = `\n${require('fs').readFileSync(require('path').join(__dirname, 'scriptEditor.js'), 'utf8')}\n`;
      document.head.appendChild(script);
    } catch (e) {
      console.error('Failed to inject widget script from disk', e);
    }

    // Add small control buttons (Load / Save)
    const toolbar = root.ownerDocument.createElement('div');
    toolbar.style.margin = '8px 0';
    const loadBtn = root.ownerDocument.createElement('button');
    loadBtn.textContent = 'Load from note';
    loadBtn.className = 'mod-cta';
    loadBtn.style.marginRight = '8px';
    loadBtn.onclick = async () => {
      const stored = await window.__estrous_v2_readFrontmatter();
      if (!stored) { new Notice('No estrous_widgets found in frontmatter'); return; }
      try {
        my_widget_script.from_json(stored);
        new Notice('Loaded widget data from frontmatter');
      } catch (e) { console.error(e); new Notice('Failed to load widget data'); }
    };
    const saveBtn = root.ownerDocument.createElement('button');
    saveBtn.textContent = 'Save to note';
    saveBtn.className = 'mod-cta';
    saveBtn.onclick = async () => {
      try {
        const out = my_widget_script.to_json();
        await window.__estrous_v2_writeFrontmatter(out);
        new Notice('Saved widget JSON to frontmatter');
      } catch (e) { console.error(e); new Notice('Failed to save widget data'); }
    };
    toolbar.appendChild(loadBtn);
    toolbar.appendChild(saveBtn);
    root.prepend(toolbar);

    // Try to initialize widget with stored data if present
    (async () => {
      try {
        const stored = await window.__estrous_v2_readFrontmatter();
        if (stored && typeof my_widget_script !== 'undefined' && my_widget_script.from_json){
          my_widget_script.from_json(stored);
        }
        // call init with mode 'edit' and a callback returning stored widgetData if any
        if (typeof my_widget_script !== 'undefined' && my_widget_script.init){
          const cb = () => stored ? stored : JSON.stringify({});
          my_widget_script.init('edit', cb);
        }
      } catch (e) { console.error('widget init error', e); }
    })();
    // ensure shim exists
    if (!document.getElementById('estrous-v2-shim')){
      const shim = document.createElement('script');
      shim.type = 'text/javascript';
      shim.id = 'estrous-v2-shim';
      shim.text = `(function(){ window.parent_form_script = window.parent_form_script || { init: function(){}, to_json: function(){ return JSON.stringify({}); }, from_json: function(){} }; window.parent_class = window.parent_form_script; })();`;
      document.head.appendChild(shim);
    }
  }
  async onClose() {
    // cleanup if necessary
  }
};
