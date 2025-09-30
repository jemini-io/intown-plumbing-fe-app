declare module "jsoneditor" {
  export interface JSONEditorError {
    path: (string | number)[];
    message: string;
  }

  export interface JSONEditorOptions {
    mode?: "tree" | "view" | "form" | "code" | "text";
    mainMenuBar?: boolean;
    navigationBar?: boolean;
    statusBar?: boolean;
    onChangeJSON?: (json: unknown) => void;
    onError?: (err: unknown) => void;
    validate?: (json: unknown) => JSONEditorError[];
  }

  export default class JSONEditor {
    constructor(container: HTMLElement, options?: JSONEditorOptions);
    set(json: unknown): void;
    update(json: unknown): void;
    destroy(): void;
    expandAll(): void;
    collapseAll(): void;
  }
}
