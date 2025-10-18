declare module 'obsidian' {
  export class Plugin {
    app: App;
    addCommand(opt: any): any;
    registerView(type: string, ctor: any): any;
    onunload(): void;
    onload(): void;
  }

  export class App {
    workspace: Workspace;
    vault: Vault;
    metadataCache: any;
  }

  export interface Workspace {
    getActiveFile(): TFile | null;
    detachLeavesOfType(type: string): void;
    getRightLeaf(create?: boolean): WorkspaceLeaf;
  }

  export interface WorkspaceLeaf {
    setViewState(state: any): Promise<void>;
  }

  export interface Vault {
    read(file: TFile): Promise<string>;
    modify(file: TFile, content: string): Promise<void>;
  }

  export class Modal {
    constructor(app: App);
    titleEl: any;
    contentEl: any;
    app: App;
    open(): void;
    close(): void;
  }

  export class Notice {
    constructor(text: string);
  }

  export class ItemView {
    constructor(leaf: WorkspaceLeaf);
    containerEl: any;
    app: App;
    getViewType(): string;
    getDisplayText(): string;
    onOpen?(): void;
    onClose?(): void;
  }

  export type TFile = any;
}
