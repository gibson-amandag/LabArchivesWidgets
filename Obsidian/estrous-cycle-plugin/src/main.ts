import { App, Modal, Notice, Plugin, WorkspaceLeaf, TFile, ItemView } from 'obsidian';
import * as jsyaml from 'js-yaml';
import { initEstrousWidget } from './paneWidget';

interface MouseEntry {
  id?: string;
  cycleNum?: string | number;
  startDate?: string;
  endDate?: string;
  numDays?: number;
  dates?: string[];
}

interface WidgetInstance {
  name?: string;
  mouseNums: number[];
  mice: { [key: string]: MouseEntry };
  dates?: { [date: string]: { [mouseNum: string]: number } };
}

export default class EstrousCyclePlugin extends Plugin {
  async onload() {
    this.addCommand({
      id: 'insert-estrous-template',
      name: 'Insert Estrous cycle frontmatter template',
      callback: () => this.insertTemplateFrontmatter()
    });

    this.addCommand({
      id: 'open-estrous-editor',
      name: 'Open Estrous cycle editor (frontmatter)',
      callback: () => this.openEditorForActiveFile()
    });

    this.registerView(
      'estrous-cycle-view',
      (leaf: WorkspaceLeaf) => new EstrousView(leaf, this)
    );

    this.addCommand({
      id: 'open-estrous-pane',
      name: 'Open Estrous cycle pane',
      callback: async () => {
        this.app.workspace.detachLeavesOfType('estrous-cycle-view');
        await this.app.workspace.getRightLeaf(false).setViewState({ type: 'estrous-cycle-view' });
      }
    });

    console.log('EstrousCyclePlugin loaded');
  }

  onunload() {
    console.log('EstrousCyclePlugin unloaded');
  }

  async insertTemplateFrontmatter() {
    const file = this.app.workspace.getActiveFile();
    if (!file) {
      new Notice('Open a note to insert the estrous template');
      return;
    }

    const template = `---\n# Estrous cycle widget instances (array)\nestrous_widgets:\n  - name: "Example instance"\n    mouseNums: [1, 2]\n    mice:\n      "1":\n        id: "CRH-01"\n        cycleNum: 1\n        startDate: "2021-04-01"\n        endDate: "2021-04-17"\n      "2":\n        id: "CRH-02"\n        cycleNum: 2\n        startDate: "2021-04-01"\n        endDate: "2021-04-17"\n    dates: {}\n---\n\n# Estrous widget data saved above\n`;

    await this.app.vault.modify(file, template + '\n' + await this.app.vault.read(file));
    new Notice('Estrous template inserted at top of note frontmatter');
  }

  async openEditorForActiveFile() {
    const file = this.app.workspace.getActiveFile();
    if (!file) {
      new Notice('Open a note to edit estrous widget data');
      return;
    }
    const fm = this.app.metadataCache.getFileCache(file)?.frontmatter;
    if (!fm || !fm['estrous_widgets']) {
      new Notice('No `estrous_widgets` found in frontmatter — insert template first');
      return;
    }
    const instances = fm['estrous_widgets'] as any[];
    new EstrousModal(this.app, file, instances).open();
  }
}

class EstrousModal extends Modal {
  file: TFile;
  instances: any[];
  constructor(app: App, file: TFile, instances: any[]) {
    super(app);
    this.file = file;
    this.instances = instances;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl('h3', { text: 'Estrous Cycle Editor' });

    // list instances
    const list = contentEl.createEl('div');
    this.instances.forEach((inst, idx) => {
      const row = list.createEl('div');
      row.createEl('strong', { text: inst.name ?? `Instance ${idx + 1}` });
      row.createEl('span', { text: ` — ${inst.mouseNums?.length ?? 0} mice` });
      const editBtn = row.createEl('button', { text: 'Edit' });
      editBtn.onclick = () => this.openInstanceEditor(idx);
    });

    const addBtn = contentEl.createEl('button', { text: 'Add instance' });
    addBtn.onclick = () => this.createNewInstance();
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }

  openInstanceEditor(index: number) {
    const instance = this.instances[index];
    const instModal = new InstanceEditorModal(this.app, this.file, instance, async (updated) => {
      this.instances[index] = updated;
      await this.saveInstances();
      new Notice('Instance updated');
    });
    instModal.open();
  }

  createNewInstance() {
    const template: WidgetInstance = {
      name: 'New instance',
      mouseNums: [],
      mice: {},
      dates: {}
    };
    this.instances.push(template);
    this.saveInstances();
    new Notice('New instance created — open editor to populate');
  }

  async saveInstances() {
    // Read file, replace frontmatter block estrous_widgets with this.instances
    const fileText = await this.app.vault.read(this.file);
  const fm = this.app.metadataCache.getFileCache(this.file)?.frontmatter;
  if (!fm) throw new Error('Missing frontmatter');
    // naive replacement: find start and end of frontmatter and reconstruct
    const lines = fileText.split('\n');
    if (lines[0].trim() !== '---') throw new Error('No frontmatter');
    let end = -1;
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '---') { end = i; break; }
    }
    if (end === -1) throw new Error('Malformed frontmatter');
    const before = lines.slice(0, end + 1);
    // build new frontmatter string: keep other keys and replace estrous_widgets
    // We'll parse the existing frontmatter with the cached frontmatter
    const existing = fm as any;
    existing['estrous_widgets'] = this.instances;
    // Use js-yaml to dump the entire frontmatter object correctly
    const fmStr = jsyaml.dump(existing);
    const yamlLines = ['---', fmStr.trim(), '---'];
    const rest = lines.slice(end + 1).join('\n');
    const newText = yamlLines.join('\n') + '\n' + rest;
    await this.app.vault.modify(this.file, newText);
  }
}

class EstrousView extends ItemView {
  plugin: Plugin;
  constructor(leaf: WorkspaceLeaf, plugin: Plugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string { return 'estrous-cycle-view'; }
  getDisplayText(): string { return 'Estrous Cycle'; }
  async onOpen() {
  const container = this.containerEl.children[1] as any;
    container.innerHTML = '';
    container.createEl('h2', { text: 'Estrous Cycle Widget Pane' });
    container.createEl('div', { text: 'This pane hosts the ported widget UI (cards, table, charts).' });

    // Adapter functions to load/save frontmatter estrous_widgets
    const loadInstances = async (): Promise<WidgetInstance[]> => {
      const file = this.app.workspace.getActiveFile();
      if (!file) { new Notice('Open a note to load instances'); return []; }
      const fm = this.app.metadataCache.getFileCache(file)?.frontmatter;
      if (fm && fm['estrous_widgets']) {
        return fm['estrous_widgets'] as WidgetInstance[];
      }
      return [];
    };

    const saveInstances = async (instances: WidgetInstance[]) => {
      const file = this.app.workspace.getActiveFile();
      if (!file) { new Notice('Open a note to save instances'); return; }
      const fileText = await this.app.vault.read(file);
      const lines = fileText.split('\n');
      if (lines[0].trim() !== '---') { new Notice('No frontmatter present'); return; }
      let end = -1;
      for (let i = 1; i < lines.length; i++) { if (lines[i].trim() === '---') { end = i; break; } }
      if (end === -1) { new Notice('Malformed frontmatter'); return; }
      // parse existing frontmatter via js-yaml to preserve other keys
      const fmText = lines.slice(1, end).join('\n');
      let existing: any = {};
      try { existing = jsyaml.load(fmText) || {}; } catch (e) { existing = {}; }
      existing['estrous_widgets'] = instances;
      const fmStr = jsyaml.dump(existing);
      const yamlLines = ['---', fmStr.trim(), '---'];
      const rest = lines.slice(end + 1).join('\n');
      const newText = yamlLines.join('\n') + '\n' + rest;
      await this.app.vault.modify(file, newText);
      new Notice('Saved estrous widgets to frontmatter');
    };

    // Initialize the widget pane
    initEstrousWidget({ container, loadInstances, saveInstances });
  }

  async onClose() {}
}

class InstanceEditorModal extends Modal {
  file: TFile;
  instance: any;
  onSave: (inst: any) => Promise<void>;
  constructor(app: App, file: TFile, instance: any, onSave: (inst: any) => Promise<void>) {
    super(app);
    this.file = file;
    this.instance = JSON.parse(JSON.stringify(instance)); // clone
    this.onSave = onSave;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl('h3', { text: 'Edit Estrous Instance' });

    // name
    contentEl.createEl('div', {}, (el) => {
      el.createEl('label', { text: 'Name: ' });
      const input = el.createEl('input') as HTMLInputElement;
      input.value = this.instance.name || '';
      input.oninput = () => { this.instance.name = input.value; };
    });

    // mice list + add
    const miceDiv = contentEl.createEl('div');
    miceDiv.createEl('h4', { text: 'Mice' });
    const list = miceDiv.createEl('div');
    const renderList = () => {
      list.empty();
      const keys = this.instance.mouseNums || [];
      keys.forEach((k: number) => {
        const row = list.createEl('div');
        row.createEl('span', { text: `${k}: ${this.instance.mice?.[k]?.id ?? ''}` });
        const edit = row.createEl('button', { text: 'Edit' });
        edit.onclick = () => this.openMouseEditor(k);
        const del = row.createEl('button', { text: 'Delete' });
        del.onclick = () => { this.deleteMouse(k); renderList(); };
      });
    };
    renderList();

    const addBtn = miceDiv.createEl('button', { text: 'Add mouse' });
    addBtn.onclick = () => { this.addMouse(); renderList(); };

    // save button
    const saveBtn = contentEl.createEl('button', { text: 'Save' });
    saveBtn.onclick = async () => {
      await this.onSave(this.instance);
      this.close();
    };
  }

  onClose() { this.contentEl.empty(); }

  addMouse() {
    const next = this.instance.mouseNums && this.instance.mouseNums.length ? Math.max(...this.instance.mouseNums) + 1 : 1;
    this.instance.mouseNums = this.instance.mouseNums || [];
    this.instance.mouseNums.push(next);
    this.instance.mice = this.instance.mice || {};
    this.instance.mice[next] = { id: '', cycleNum: '', startDate: '', endDate: '' };
  }

  deleteMouse(k: number) {
    const idx = this.instance.mouseNums.indexOf(k);
    if (idx > -1) this.instance.mouseNums.splice(idx, 1);
    delete this.instance.mice[k];
  }

  openMouseEditor(k: number) {
    const mouse = this.instance.mice[k];
    const modal = new Modal(this.app);
    modal.titleEl.setText(`Edit mouse ${k}`);
    modal.contentEl.createEl('div', {}, (el) => {
      el.createEl('label', { text: 'ID: ' });
      const idIn = el.createEl('input') as HTMLInputElement; idIn.value = mouse.id || ''; idIn.oninput = () => mouse.id = idIn.value;
    });
    modal.contentEl.createEl('div', {}, (el) => {
      el.createEl('label', { text: 'Cycle #: ' });
      const cIn = el.createEl('input') as HTMLInputElement; cIn.value = mouse.cycleNum || ''; cIn.oninput = () => mouse.cycleNum = cIn.value;
    });
    modal.contentEl.createEl('div', {}, (el) => {
      el.createEl('label', { text: 'Start Date (YYYY-MM-DD): ' });
      const sIn = el.createEl('input') as HTMLInputElement; sIn.value = mouse.startDate || ''; sIn.oninput = () => mouse.startDate = sIn.value;
    });
    modal.contentEl.createEl('div', {}, (el) => {
      el.createEl('label', { text: 'End Date (YYYY-MM-DD): ' });
      const eIn = el.createEl('input') as HTMLInputElement; eIn.value = mouse.endDate || ''; eIn.oninput = () => mouse.endDate = eIn.value;
    });
    modal.open();
  }
}
