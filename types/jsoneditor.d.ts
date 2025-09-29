declare module "jsoneditor" {
  export interface JSONEditorOptions {
    mode?: string;
    mainMenuBar?: boolean;
    navigationBar?: boolean;
    statusBar?: boolean;
    onChangeJSON?: (json: unknown) => void;
    onError?: (err: unknown) => void;
  }

  export default class JSONEditor {
    constructor(container: HTMLElement, options?: JSONEditorOptions);
    set(json: unknown): void;
    update(json: unknown): void;
    destroy(): void;
  }
}