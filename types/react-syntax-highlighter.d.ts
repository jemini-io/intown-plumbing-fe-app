declare module "react-syntax-highlighter" {
  import type { ComponentType } from "react";

  // Componente Prism
  export const Prism: ComponentType<Record<string, unknown>>;

  // Default export (componente)
  const SyntaxHighlighter: ComponentType<Record<string, unknown>>;
  export default SyntaxHighlighter;
}

declare module "react-syntax-highlighter/dist/esm/styles/prism" {
  // Tema(s) de estilos (objetos)
  export const oneLight: Record<string, unknown>;
}