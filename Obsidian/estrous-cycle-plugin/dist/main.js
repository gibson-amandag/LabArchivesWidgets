"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const obsidian_1 = require("obsidian");
const jsyaml = __importStar(require("js-yaml"));
const paneWidget_1 = require("./paneWidget");
class EstrousCyclePlugin extends obsidian_1.Plugin {
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
        this.registerView('estrous-cycle-view', (leaf) => new EstrousView(leaf, this));
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
            new obsidian_1.Notice('Open a note to insert the estrous template');
            return;
        }
        const template = `---\n# Estrous cycle widget instances (array)\nestrous_widgets:\n  - name: "Example instance"\n    mouseNums: [1, 2]\n    mice:\n      "1":\n        id: "CRH-01"\n        cycleNum: 1\n        startDate: "2021-04-01"\n        endDate: "2021-04-17"\n      "2":\n        id: "CRH-02"\n        cycleNum: 2\n        startDate: "2021-04-01"\n        endDate: "2021-04-17"\n    dates: {}\n---\n\n# Estrous widget data saved above\n`;
        await this.app.vault.modify(file, template + '\n' + await this.app.vault.read(file));
        new obsidian_1.Notice('Estrous template inserted at top of note frontmatter');
    }
    async openEditorForActiveFile() {
        var _a;
        const file = this.app.workspace.getActiveFile();
        if (!file) {
            new obsidian_1.Notice('Open a note to edit estrous widget data');
            return;
        }
        const fm = (_a = this.app.metadataCache.getFileCache(file)) === null || _a === void 0 ? void 0 : _a.frontmatter;
        if (!fm || !fm['estrous_widgets']) {
            new obsidian_1.Notice('No `estrous_widgets` found in frontmatter — insert template first');
            return;
        }
        const instances = fm['estrous_widgets'];
        new EstrousModal(this.app, file, instances).open();
    }
}
exports.default = EstrousCyclePlugin;
class EstrousModal extends obsidian_1.Modal {
    constructor(app, file, instances) {
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
            var _a, _b, _c;
            const row = list.createEl('div');
            row.createEl('strong', { text: (_a = inst.name) !== null && _a !== void 0 ? _a : `Instance ${idx + 1}` });
            row.createEl('span', { text: ` — ${(_c = (_b = inst.mouseNums) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0} mice` });
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
    openInstanceEditor(index) {
        const instance = this.instances[index];
        const instModal = new InstanceEditorModal(this.app, this.file, instance, async (updated) => {
            this.instances[index] = updated;
            await this.saveInstances();
            new obsidian_1.Notice('Instance updated');
        });
        instModal.open();
    }
    createNewInstance() {
        const template = {
            name: 'New instance',
            mouseNums: [],
            mice: {},
            dates: {}
        };
        this.instances.push(template);
        this.saveInstances();
        new obsidian_1.Notice('New instance created — open editor to populate');
    }
    async saveInstances() {
        var _a;
        // Read file, replace frontmatter block estrous_widgets with this.instances
        const fileText = await this.app.vault.read(this.file);
        const fm = (_a = this.app.metadataCache.getFileCache(this.file)) === null || _a === void 0 ? void 0 : _a.frontmatter;
        if (!fm)
            throw new Error('Missing frontmatter');
        // naive replacement: find start and end of frontmatter and reconstruct
        const lines = fileText.split('\n');
        if (lines[0].trim() !== '---')
            throw new Error('No frontmatter');
        let end = -1;
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() === '---') {
                end = i;
                break;
            }
        }
        if (end === -1)
            throw new Error('Malformed frontmatter');
        const before = lines.slice(0, end + 1);
        // build new frontmatter string: keep other keys and replace estrous_widgets
        // We'll parse the existing frontmatter with the cached frontmatter
        const existing = fm;
        existing['estrous_widgets'] = this.instances;
        // Use js-yaml to dump the entire frontmatter object correctly
        const fmStr = jsyaml.dump(existing);
        const yamlLines = ['---', fmStr.trim(), '---'];
        const rest = lines.slice(end + 1).join('\n');
        const newText = yamlLines.join('\n') + '\n' + rest;
        await this.app.vault.modify(this.file, newText);
    }
}
class EstrousView extends obsidian_1.ItemView {
    constructor(leaf, plugin) {
        super(leaf);
        this.plugin = plugin;
    }
    getViewType() { return 'estrous-cycle-view'; }
    getDisplayText() { return 'Estrous Cycle'; }
    async onOpen() {
        const container = this.containerEl.children[1];
        container.innerHTML = '';
        container.createEl('h2', { text: 'Estrous Cycle Widget Pane' });
        container.createEl('div', { text: 'This pane hosts the ported widget UI (cards, table, charts).' });
        // Adapter functions to load/save frontmatter estrous_widgets
        const loadInstances = async () => {
            var _a;
            const file = this.app.workspace.getActiveFile();
            if (!file) {
                new obsidian_1.Notice('Open a note to load instances');
                return [];
            }
            const fm = (_a = this.app.metadataCache.getFileCache(file)) === null || _a === void 0 ? void 0 : _a.frontmatter;
            if (fm && fm['estrous_widgets']) {
                return fm['estrous_widgets'];
            }
            return [];
        };
        const saveInstances = async (instances) => {
            const file = this.app.workspace.getActiveFile();
            if (!file) {
                new obsidian_1.Notice('Open a note to save instances');
                return;
            }
            const fileText = await this.app.vault.read(file);
            const lines = fileText.split('\n');
            if (lines[0].trim() !== '---') {
                new obsidian_1.Notice('No frontmatter present');
                return;
            }
            let end = -1;
            for (let i = 1; i < lines.length; i++) {
                if (lines[i].trim() === '---') {
                    end = i;
                    break;
                }
            }
            if (end === -1) {
                new obsidian_1.Notice('Malformed frontmatter');
                return;
            }
            // parse existing frontmatter via js-yaml to preserve other keys
            const fmText = lines.slice(1, end).join('\n');
            let existing = {};
            try {
                existing = jsyaml.load(fmText) || {};
            }
            catch (e) {
                existing = {};
            }
            existing['estrous_widgets'] = instances;
            const fmStr = jsyaml.dump(existing);
            const yamlLines = ['---', fmStr.trim(), '---'];
            const rest = lines.slice(end + 1).join('\n');
            const newText = yamlLines.join('\n') + '\n' + rest;
            await this.app.vault.modify(file, newText);
            new obsidian_1.Notice('Saved estrous widgets to frontmatter');
        };
        // Initialize the widget pane
        (0, paneWidget_1.initEstrousWidget)({ container, loadInstances, saveInstances });
    }
    async onClose() { }
}
class InstanceEditorModal extends obsidian_1.Modal {
    constructor(app, file, instance, onSave) {
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
            const input = el.createEl('input');
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
            keys.forEach((k) => {
                var _a, _b, _c;
                const row = list.createEl('div');
                row.createEl('span', { text: `${k}: ${(_c = (_b = (_a = this.instance.mice) === null || _a === void 0 ? void 0 : _a[k]) === null || _b === void 0 ? void 0 : _b.id) !== null && _c !== void 0 ? _c : ''}` });
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
    deleteMouse(k) {
        const idx = this.instance.mouseNums.indexOf(k);
        if (idx > -1)
            this.instance.mouseNums.splice(idx, 1);
        delete this.instance.mice[k];
    }
    openMouseEditor(k) {
        const mouse = this.instance.mice[k];
        const modal = new obsidian_1.Modal(this.app);
        modal.titleEl.setText(`Edit mouse ${k}`);
        modal.contentEl.createEl('div', {}, (el) => {
            el.createEl('label', { text: 'ID: ' });
            const idIn = el.createEl('input');
            idIn.value = mouse.id || '';
            idIn.oninput = () => mouse.id = idIn.value;
        });
        modal.contentEl.createEl('div', {}, (el) => {
            el.createEl('label', { text: 'Cycle #: ' });
            const cIn = el.createEl('input');
            cIn.value = mouse.cycleNum || '';
            cIn.oninput = () => mouse.cycleNum = cIn.value;
        });
        modal.contentEl.createEl('div', {}, (el) => {
            el.createEl('label', { text: 'Start Date (YYYY-MM-DD): ' });
            const sIn = el.createEl('input');
            sIn.value = mouse.startDate || '';
            sIn.oninput = () => mouse.startDate = sIn.value;
        });
        modal.contentEl.createEl('div', {}, (el) => {
            el.createEl('label', { text: 'End Date (YYYY-MM-DD): ' });
            const eIn = el.createEl('input');
            eIn.value = mouse.endDate || '';
            eIn.oninput = () => mouse.endDate = eIn.value;
        });
        modal.open();
    }
}
