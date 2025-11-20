"use client";

import { useEffect, useRef } from "react";
import JSONEditor, { JSONEditorOptions } from "jsoneditor";
import "jsoneditor/dist/jsoneditor.css";

/**
 * Recursively restore readonly field values and readonly objects from original to updated object
 */
function restoreReadonlyFields(
  original: JSONValue, 
  updated: JSONValue, 
  readonlyFields: string[],
  readonlyObjects: string[] = []
): JSONValue {
  if (readonlyFields.length === 0 && readonlyObjects.length === 0) return updated;
  
  if (Array.isArray(original) && Array.isArray(updated)) {
    return updated.map((item, index) => {
      const origItem = original[index];
      if (origItem && typeof origItem === 'object' && typeof item === 'object' && !Array.isArray(item)) {
        return restoreReadonlyFields(origItem, item, readonlyFields, readonlyObjects);
      }
      return item;
    });
  }
  
  if (typeof original === 'object' && original !== null && typeof updated === 'object' && updated !== null && !Array.isArray(original) && !Array.isArray(updated)) {
    const result: { [k: string]: JSONValue } = { ...updated };
    
    // Restore readonly fields (like 'id')
    for (const field of readonlyFields) {
      if (field in original) {
        result[field] = (original as { [k: string]: JSONValue })[field];
      }
    }
    
    // Handle readonly objects (like 'skills' array)
    // Allow items to be deleted, but restore values within remaining items
    for (const objField of readonlyObjects) {
      if (objField in original) {
        const origArray = (original as { [k: string]: JSONValue })[objField];
        const updatedArray = updated[objField];
        
        if (Array.isArray(origArray) && Array.isArray(updatedArray)) {
          // Map updated array items to original items by matching IDs or indices
          // If an item was deleted, it won't be in the updated array
          // If an item exists, restore its readonly field values
          const restoredArray = updatedArray.map((updatedItem: JSONValue) => {
            if (typeof updatedItem === 'object' && updatedItem !== null && !Array.isArray(updatedItem)) {
              // Try to find matching original item by id
              const updatedId = (updatedItem as { [k: string]: JSONValue })['id'];
              const matchingOrigItem = origArray.find((origItem: JSONValue) => {
                if (typeof origItem === 'object' && origItem !== null && !Array.isArray(origItem)) {
                  return (origItem as { [k: string]: JSONValue })['id'] === updatedId;
                }
                return false;
              });
              
              if (matchingOrigItem && typeof matchingOrigItem === 'object' && !Array.isArray(matchingOrigItem)) {
                // Restore readonly fields from original item
                const restoredItem = { ...updatedItem as { [k: string]: JSONValue } };
                for (const field of readonlyFields) {
                  if (field in matchingOrigItem) {
                    restoredItem[field] = (matchingOrigItem as { [k: string]: JSONValue })[field];
                  }
                }
                return restoredItem;
              }
            }
            return updatedItem;
          });
          
          result[objField] = restoredArray;
        } else {
          // Not an array, restore the whole object
          result[objField] = origArray;
        }
      }
    }
    
    // Recursively process nested objects (but skip readonly fields and objects)
    for (const key in updated) {
      if (readonlyFields.includes(key) || readonlyObjects.includes(key)) continue;
      const origVal = (original as { [k: string]: JSONValue })[key];
      const updVal = updated[key];
      if (origVal && typeof origVal === 'object' && updVal && typeof updVal === 'object') {
        result[key] = restoreReadonlyFields(origVal, updVal, readonlyFields, readonlyObjects);
      }
    }
    
    return result;
  }
  
  return updated;
}

type JSONValue =
  | string
  | number
  | boolean
  | null
  | { [k: string]: JSONValue }
  | JSONValue[];

interface JSONEditorOptionsWithValidate extends JSONEditorOptions {
  validate?: (json: unknown) => { path: (string | number)[]; message: string }[];
  onEditable?: (node: { path: (string | number)[]; field?: string | number; value?: unknown }) => boolean | { field: boolean; value: boolean };
}

interface JsonTreeEditorProps {
  value: JSONValue;
  onChange: (val: JSONValue) => void;
  height?: string;
  expandAllOnInit?: boolean;
  readonlyFields?: string[];
  readonlyObjects?: string[]; // Array of field names whose values (objects/arrays) should be readonly
}

export function JsonTreeEditor({
  value,
  onChange,
  height = "60vh",
  expandAllOnInit = true,
  readonlyFields = [],
  readonlyObjects = []
}: JsonTreeEditorProps) {
  const readonlySignature = readonlyFields.join("|");
  const readonlyObjectsSignature = readonlyObjects.join("|");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<JSONEditor | null>(null);
  const lastValueRef = useRef<JSONValue>(value);
  const originalValueRef = useRef<JSONValue>(value); // Store original value for readonly field restoration
  const lastSerializedRef = useRef<string>(JSON.stringify(value));
  const destroyedRef = useRef(false);
  const suppressNextSetRef = useRef(false);
  const expandedInitiallyRef = useRef(false);
  const onChangeRef = useRef(onChange);
  const readonlyFieldsRef = useRef(readonlyFields);
  const readonlyObjectsRef = useRef(readonlyObjects);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    readonlyFieldsRef.current = readonlyFields;
    readonlyObjectsRef.current = readonlyObjects;
    originalValueRef.current = value;
  }, [readonlyFields, readonlyObjects, value]);

  useEffect(() => {
    if (!containerRef.current || editorRef.current) return;

    // Function to determine if a field should be editable
    const isEditable = (node: { path: (string | number)[]; field?: string | number; value?: unknown }) => {
      if (!Array.isArray(node.path) || node.path.length === 0) {
        return true;
      }
      
      // Check if the field name itself is readonly
      const fieldName = typeof node.field === 'string' ? node.field : (typeof node.path[node.path.length - 1] === 'string' ? node.path[node.path.length - 1] as string : null);
      
      if (fieldName && readonlyFieldsRef.current.includes(fieldName)) {
        return false;
      }
      
      // Check if we're inside a readonly object (e.g., inside a skill object in the skills array)
      if (readonlyObjectsRef.current.length > 0) {
        // Check if we're at the array level itself (path ends with readonly object name)
        const lastPathSegment = node.path[node.path.length - 1];
        if (typeof lastPathSegment === 'string' && readonlyObjectsRef.current.includes(lastPathSegment)) {
          // This is the array itself (e.g., ['skills']) - allow all operations
          // We want to allow adding/removing items from the array
          return true;
        }
        
        // Check if we're inside an array item
        for (let i = 0; i < node.path.length; i++) {
          const pathSegment = node.path[i];
          if (typeof pathSegment === 'string' && readonlyObjectsRef.current.includes(pathSegment)) {
            // Check if the next segment is a number (array index)
            if (i + 1 < node.path.length && typeof node.path[i + 1] === 'number') {
              // We're inside a readonly object array
              // Check if this is the array item itself (path length is i+2: ['skills', 0])
              if (node.path.length === i + 2) {
                // This is the array item itself - allow delete operations
                // Return object to allow field operations (delete) but prevent value editing
                // For array items, 'field' controls the ability to delete the item
                return { field: true, value: true };
              } else {
                // We're inside an array item (e.g., ['skills', 0, 'id'])
                // Make fields inside readonly
                return false;
              }
            }
          }
        }
      }
      
      return true;
    };

    const options: JSONEditorOptionsWithValidate = {
      mode: "tree",
      mainMenuBar: false,
      navigationBar: false,
      statusBar: false,
      onChangeJSON: (json: unknown) => {
        if (json === undefined) return;
        
        // Restore readonly field values and readonly objects from original value
        const restored = restoreReadonlyFields(
          originalValueRef.current, 
          json as JSONValue, 
          readonlyFieldsRef.current,
          readonlyObjectsRef.current
        );
        
        suppressNextSetRef.current = true;
        lastValueRef.current = restored;
        lastSerializedRef.current = JSON.stringify(restored);
        onChangeRef.current(lastValueRef.current);
      },
      onEditable: (readonlyFieldsRef.current.length > 0 || readonlyObjectsRef.current.length > 0) ? isEditable : undefined,
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
  }, [expandAllOnInit, readonlySignature, readonlyObjectsSignature]);

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
    originalValueRef.current = value; // Update original value when value prop changes
    lastSerializedRef.current = incomingSerialized;

    try {
      editorRef.current.set(value as unknown);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("JSONEditor set failed:", e);
    }
  }, [value]);

  // Add CSS for readonly field tooltips
  useEffect(() => {
    if (readonlyFields.length === 0 && readonlyObjects.length === 0) return;
    
    const styleId = 'jsoneditor-readonly-tooltip-style';
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .jsoneditor-readonly-field {
        position: relative;
        cursor: not-allowed !important;
        opacity: 0.7;
      }
      .jsoneditor-readonly-field-wrapper {
        position: relative;
        display: inline-block;
      }
      .jsoneditor-readonly-field-wrapper:hover .jsoneditor-readonly-tooltip {
        opacity: 1;
        visibility: visible;
      }
      .jsoneditor-readonly-tooltip {
        content: "Edit on its own json";
        position: absolute;
        background: #333;
        color: #fff;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        white-space: nowrap;
        z-index: 10000;
        pointer-events: none;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.2s, visibility 0.2s;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        margin-bottom: 5px;
      }
      .jsoneditor-readonly-tooltip::after {
        content: "";
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 4px solid transparent;
        border-top-color: #333;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, [readonlyFields.length, readonlyObjects.length]);

  // Add event listeners to mark readonly fields with CSS class and tooltip
  useEffect(() => {
    if (!editorRef.current || (readonlyFields.length === 0 && readonlyObjects.length === 0)) return;
    if (!containerRef.current) return;
    
    const markReadonlyFields = () => {
      if (!containerRef.current || !editorRef.current) return;
      
      // jsoneditor structure: each field is in a row with class "jsoneditor-row"
      // The field name is in a span with class "jsoneditor-field"
      // The value input is in a div with class "jsoneditor-value"
      const rows = containerRef.current.querySelectorAll('.jsoneditor-row');
      
      rows.forEach(row => {
        const fieldElement = row.querySelector('.jsoneditor-field');
        if (!fieldElement) return;
        
        const fieldName = fieldElement.textContent?.trim().replace(':', '').trim();
        if (!fieldName) return;
        
        // Check if this field should be readonly
        const shouldBeReadonly = 
          readonlyFields.includes(fieldName) ||
          readonlyObjects.includes(fieldName);
        
        if (shouldBeReadonly) {
          // Find the value container
          const valueContainer = row.querySelector('.jsoneditor-value');
          if (!valueContainer) return;
          
          // Find the input/textarea
          const input = valueContainer.querySelector('input[type="text"], textarea') as HTMLElement;
          if (!input) return;
          
          // Check if already marked
          if (input.classList.contains('jsoneditor-readonly-field')) return;
          
          // Mark as readonly
          input.classList.add('jsoneditor-readonly-field');
          input.setAttribute('readonly', 'true');
          input.style.cursor = 'not-allowed';
          
          // Wrap the input in a tooltip wrapper if not already wrapped
          if (!input.parentElement?.classList.contains('jsoneditor-readonly-field-wrapper')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'jsoneditor-readonly-field-wrapper';
            const tooltip = document.createElement('div');
            tooltip.className = 'jsoneditor-readonly-tooltip';
            tooltip.textContent = 'Edit on its own json';
            wrapper.appendChild(tooltip);
            input.parentNode?.insertBefore(wrapper, input);
            wrapper.appendChild(input);
          }
        }
      });
      
      // Also check for readonly objects (arrays) - mark all children
      // We need to find rows that are children of readonly object fields
      if (readonlyObjects.length > 0) {
        rows.forEach(row => {
          // Check if this row is inside a readonly object
          let parentRow: Element | null = row.previousElementSibling;
          let isInsideReadonlyObject = false;
          
          // Walk backwards to find parent rows
          while (parentRow && !isInsideReadonlyObject) {
            if (parentRow.classList.contains('jsoneditor-row')) {
              const parentField = parentRow.querySelector('.jsoneditor-field');
              const parentFieldName = parentField?.textContent?.trim().replace(':', '').trim();
              
              if (parentFieldName && readonlyObjects.includes(parentFieldName)) {
                isInsideReadonlyObject = true;
                break;
              }
              
              // Check if we've gone up a level (less indentation)
              const rowIndent = row.querySelector('.jsoneditor-indent')?.children.length || 0;
              const parentIndent = parentRow.querySelector('.jsoneditor-indent')?.children.length || 0;
              if (parentIndent < rowIndent) {
                // We've gone up a level, stop checking
                break;
              }
            }
            parentRow = parentRow.previousElementSibling;
          }
          
          if (isInsideReadonlyObject) {
            const valueContainer = row.querySelector('.jsoneditor-value');
            if (!valueContainer) return;
            const input = valueContainer.querySelector('input[type="text"], textarea') as HTMLElement;
            if (!input || input.classList.contains('jsoneditor-readonly-field')) return;
            
            input.classList.add('jsoneditor-readonly-field');
            input.setAttribute('readonly', 'true');
            input.style.cursor = 'not-allowed';
            
            if (!input.parentElement?.classList.contains('jsoneditor-readonly-field-wrapper')) {
              const wrapper = document.createElement('div');
              wrapper.className = 'jsoneditor-readonly-field-wrapper';
              const tooltip = document.createElement('div');
              tooltip.className = 'jsoneditor-readonly-tooltip';
              tooltip.textContent = 'Edit on its own json';
              wrapper.appendChild(tooltip);
              input.parentNode?.insertBefore(wrapper, input);
              wrapper.appendChild(input);
            }
          }
        });
      }
    };
    
    // Use MutationObserver to watch for DOM changes
    const observer = new MutationObserver(() => {
      // Debounce to avoid too many calls
      setTimeout(markReadonlyFields, 100);
    });
    
    observer.observe(containerRef.current, {
      childList: true,
      subtree: true,
    });
    
    // Initial marking after delays to let jsoneditor render
    const timeoutId1 = setTimeout(markReadonlyFields, 500);
    const timeoutId2 = setTimeout(markReadonlyFields, 1000);
    const timeoutId3 = setTimeout(markReadonlyFields, 2000);
    
    return () => {
      observer.disconnect();
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
      clearTimeout(timeoutId3);
    };
  }, [readonlyFields, readonlyObjects]);

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
