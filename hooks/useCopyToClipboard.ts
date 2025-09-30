import { useState } from "react";

export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);

  function handleCopy(value: string) {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return { copied, handleCopy };
}