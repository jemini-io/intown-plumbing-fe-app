"use client";

import { useEffect, useRef } from "react";
import JSONEditor, { JSONEditorOptions } from "jsoneditor";
import "jsoneditor/dist/jsoneditor.css";

type JSONValue =
  | string
  | number
  | boolean
  | null
  | { [k: string]: JSONValue }
  | JSONValue[];

interface JsonTreeEditorProps {
  value: JSONValue;
  onChange: (val: JSONValue) => void;
  height?: string;
}

export function JsonTreeEditor({ value, onChange, height = "60vh" }: JsonTreeEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<JSONEditor | null>(null);
  const lastValueRef = useRef<JSONValue>(value);

  useEffect(() => {
    if (!containerRef.current) return;

    const options: JSONEditorOptions = {
      mode: "tree",
      mainMenuBar: false,
      navigationBar: false,
      statusBar: false,
      onChangeJSON: (json) => {
        if (json !== undefined) {
          lastValueRef.current = json as JSONValue;
            onChange(lastValueRef.current);
        }
      },
      onError: (err) => {
        console.error("JSONEditor error:", err);
      },
    };

    editorRef.current = new JSONEditor(containerRef.current, options);
    editorRef.current.set(lastValueRef.current);

    return () => {
      editorRef.current?.destroy();
      editorRef.current = null;
    };
  }, [onChange]);

  useEffect(() => {
    if (!editorRef.current) return;
    if (value !== lastValueRef.current) {
      lastValueRef.current = value;
      editorRef.current.update(value);
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      style={{
        height,
        minHeight: "400px",
        maxHeight: "600px",
        border: "1px solid #444",
        borderRadius: 6,
        overflow: "hidden",
        background: "#1e1e1e",
      }}
    />
  );
}