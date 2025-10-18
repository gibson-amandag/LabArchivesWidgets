const { Plugin, Notice, Modal } = require('obsidian');
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

    this.addCommand({
      id: 'open-estrous-pane-v2',
      name: 'Open Estrous pane (v2)',
      callback: () => this.openPane()
    });

    console.log('Estrous v2 plugin loaded');
  }

  onunload() { console.log('Estrous v2 plugin unloaded'); }

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
    // create a right leaf and inject minimal widget HTML + shim
    this.app.workspace.detachLeavesOfType('estrous-v2-view');
    const leaf = await this.app.workspace.getRightLeaf(false);
    await leaf.setViewState({ type: 'estrous-v2-view' });
    // simple injection: find the container and append our HTML when the leaf mounts
    setTimeout(() => {
      try {
        const container = document.querySelector('.workspace-leaf-content .view-content');
        if (!container) return;
        const root = document.createElement('div');
        root.id = 'estrous-v2-root';
        root.innerHTML = `
          <div style="padding:12px; border:1px solid #ccc">
            <h3>Estrous widget (v2 pane)</h3>
            <div id="widgetContainer">Widget HTML will load here</div>
          </div>
        `;
        container.appendChild(root);

        // inject shim
        const shim = document.createElement('script');
        shim.type = 'text/javascript';
        shim.text = `(function(){ window.parent_form_script = window.parent_form_script || { init: function(){}, to_json: function(){ return JSON.stringify({}); }, from_json: function(){}}; window.parent_class = window.parent_form_script; })();`;
        document.head.appendChild(shim);
      } catch (e) {
        console.error('Failed to inject estrous pane content', e);
      }
    }, 200);
  }
};
