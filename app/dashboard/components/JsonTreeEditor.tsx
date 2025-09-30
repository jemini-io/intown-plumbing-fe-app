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

interface JSONEditorOptionsWithValidate extends JSONEditorOptions {
  validate?: (json: unknown) => { path: (string | number)[]; message: string }[];
}

interface JsonTreeEditorProps {
  value: JSONValue;
  onChange: (val: JSONValue) => void;
  height?: string;
  expandAllOnInit?: boolean;
}

export function JsonTreeEditor({
  value,
  onChange,
  height = "60vh",
  expandAllOnInit = true
}: JsonTreeEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<JSONEditor | null>(null);
  const lastValueRef = useRef<JSONValue>(value);
  const lastSerializedRef = useRef<string>(JSON.stringify(value));
  const destroyedRef = useRef(false);
  const suppressNextSetRef = useRef(false);
  const expandedInitiallyRef = useRef(false);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!containerRef.current || editorRef.current) return;

    const options: JSONEditorOptionsWithValidate = {
      mode: "tree",
      mainMenuBar: false,
      navigationBar: false,
      statusBar: false,
      onChangeJSON: (json: unknown) => {
        if (json === undefined) return;
        suppressNextSetRef.current = true;
        lastValueRef.current = json as JSONValue;
        lastSerializedRef.current = JSON.stringify(json);
        onChangeRef.current(lastValueRef.current);
      },
      validate: () => [],
      onError: (err: unknown) => {
        // eslint-disable-next-line no-console
        console.error("JSONEditor error:", err);
      }
    };

    try {
      editorRef.current = new JSONEditor(containerRef.current, options);
      editorRef.current.set(lastValueRef.current as unknown);
      if (expandAllOnInit) {
        requestAnimationFrame(() => {
          if (!destroyedRef.current && editorRef.current && !expandedInitiallyRef.current) {
            try {
              editorRef.current.expandAll();
              expandedInitiallyRef.current = true;
            } catch {
              /* ignore */
            }
          }
        });
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Failed to initialize JSONEditor:", e);
    }

    return () => {
      destroyedRef.current = true;
      try {
        editorRef.current?.destroy();
      } catch {
        /* ignore */
      }
      editorRef.current = null;
    };
  }, [expandAllOnInit]);

  useEffect(() => {
    if (!editorRef.current) return;
    if (destroyedRef.current) return;

    const incomingSerialized = JSON.stringify(value);
    if (incomingSerialized === lastSerializedRef.current) {
      suppressNextSetRef.current = false;
      return;
    }

    if (suppressNextSetRef.current) {
      suppressNextSetRef.current = false;
      return;
    }

    lastValueRef.current = value;
    lastSerializedRef.current = incomingSerialized;

    try {
      editorRef.current.set(value as unknown);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("JSONEditor set failed:", e);
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
        background: "#1e1e1e"
      }}
    />
  );
}
