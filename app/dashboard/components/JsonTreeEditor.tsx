"use client";

import { useEffect, useRef } from "react";
import JSONEditor, { JSONEditorOptions } from "jsoneditor";
import "jsoneditor/dist/jsoneditor.css";
import { useTheme } from "../contexts/ThemeContext";

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
  const { theme } = useTheme();
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
    // Keys (field names) are never editable, only values can be edited
    const isEditable = (node: { path: (string | number)[]; field?: string | number; value?: unknown }) => {
      if (!Array.isArray(node.path) || node.path.length === 0) {
        // Root level - allow editing values but not field names
        return { field: false, value: true };
      }
      
      // Check if the field name itself is readonly
      const fieldName = typeof node.field === 'string' ? node.field : (typeof node.path[node.path.length - 1] === 'string' ? node.path[node.path.length - 1] as string : null);
      
      if (fieldName && readonlyFieldsRef.current.includes(fieldName)) {
        // Field is readonly - neither key nor value can be edited
        return false;
      }
      
      // Check if we're inside a readonly object (e.g., inside a skill object in the skills array)
      if (readonlyObjectsRef.current.length > 0) {
        // Check if we're at the array level itself (path ends with readonly object name)
        const lastPathSegment = node.path[node.path.length - 1];
        if (typeof lastPathSegment === 'string' && readonlyObjectsRef.current.includes(lastPathSegment)) {
          // This is the array itself (e.g., ['skills']) - allow adding/removing items but not renaming
          return { field: false, value: true };
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
                // This is the array item itself - allow delete operations but not renaming
                return { field: true, value: false };
              } else {
                // We're inside an array item (e.g., ['skills', 0, 'id'])
                // Make fields inside readonly
                return false;
              }
            }
          }
        }
      }
      
      // Default: keys are never editable, values are editable
      return { field: false, value: true };
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
      onEditable: isEditable,
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
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }
    
    const isDark = theme === 'dark';
    const tooltipBg = isDark ? '#1f2937' : '#333';
    const tooltipText = isDark ? '#f3f4f6' : '#fff';
    
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
        background: ${tooltipBg};
        color: ${tooltipText};
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
        border-top-color: ${tooltipBg};
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, [readonlyFields.length, readonlyObjects.length, theme]);

  // Add CSS to adapt jsoneditor to dark/light theme
  useEffect(() => {
    const styleId = 'jsoneditor-theme-style';
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }
    
    const isDark = theme === 'dark';
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      ${isDark ? `
        .jsoneditor {
          background: #374151 !important;
          border: 1px solid #4b5563 !important;
        }
        .jsoneditor > div {
          background: #374151 !important;
        }
        .jsoneditor-menu {
          background: #374151 !important;
          border-bottom: 1px solid #4b5563 !important;
        }
        .jsoneditor table {
          background: #374151 !important;
        }
        .jsoneditor tbody {
          background: #374151 !important;
        }
        .jsoneditor thead {
          background: #374151 !important;
        }
        .jsoneditor tr {
          background: #374151 !important;
        }
        .jsoneditor td {
          background: #374151 !important;
        }
        .jsoneditor .jsoneditor-tree {
          background: #374151 !important;
        }
        .jsoneditor .jsoneditor-tree > div {
          background: #374151 !important;
        }
        .jsoneditor .jsoneditor-tree table {
          background: #374151 !important;
        }
        .jsoneditor-field {
          color: #9ca3af !important;
        }
        .jsoneditor-field:hover {
          background: #374151 !important;
        }
        .jsoneditor-row:hover .jsoneditor-field {
          background: #374151 !important;
        }
        .jsoneditor-value {
          color: #f3f4f6 !important;
        }
        .jsoneditor-value-string {
          color: #60a5fa !important;
        }
        .jsoneditor-value-number {
          color: #34d399 !important;
        }
        .jsoneditor-value-boolean {
          color: #fbbf24 !important;
        }
        .jsoneditor-value-null {
          color: #f87171 !important;
        }
        .jsoneditor-array {
          color: #e5e7eb !important;
        }
        .jsoneditor-object {
          color: #e5e7eb !important;
        }
        .jsoneditor th {
          background: #374151 !important;
          color: #e5e7eb !important;
        }
        .jsoneditor input[type="text"],
        .jsoneditor textarea {
          background: #374151 !important;
          color: #f3f4f6 !important;
          border: 1px solid #4b5563 !important;
        }
        .jsoneditor input[type="text"]:focus,
        .jsoneditor textarea:focus {
          background: #4b5563 !important;
          border-color: #60a5fa !important;
        }
        .jsoneditor-value-edit input[type="text"],
        .jsoneditor-value-edit textarea {
          background: #4b5563 !important;
          color: #f3f4f6 !important;
        }
        .jsoneditor-value-edit input[type="text"]:focus,
        .jsoneditor-value-edit textarea:focus {
          background: #4b5563 !important;
        }
        .jsoneditor-value-edit {
          background: #4b5563 !important;
        }
        .jsoneditor tr.jsoneditor-selected,
        .jsoneditor tr.jsoneditor-selected td {
          background: #374151 !important;
        }
        .jsoneditor td.jsoneditor-selected,
        .jsoneditor td.jsoneditor-selected input,
        .jsoneditor td.jsoneditor-selected textarea {
          background: #4b5563 !important;
        }
        .jsoneditor [style*="background"] input[type="text"],
        .jsoneditor [style*="background"] textarea {
          background: #4b5563 !important;
        }
        .jsoneditor input[style*="background"] {
          background: #4b5563 !important;
        }
        .jsoneditor textarea[style*="background"] {
          background: #4b5563 !important;
        }
        .jsoneditor-actions {
          background: #374151 !important;
        }
        .jsoneditor-contextmenu {
          background: #374151 !important;
          border: 1px solid #4b5563 !important;
        }
        .jsoneditor-contextmenu .jsoneditor-menu {
          background: #374151 !important;
        }
        .jsoneditor-contextmenu li {
          color: #e5e7eb !important;
        }
        .jsoneditor-contextmenu li:hover {
          background: #4b5563 !important;
        }
      ` : `
        .jsoneditor {
          background: #ffffff !important;
          border: 1px solid #d1d5db !important;
        }
        .jsoneditor-menu {
          background: #f9fafb !important;
          border-bottom: 1px solid #d1d5db !important;
        }
        .jsoneditor table {
          background: #ffffff !important;
        }
        .jsoneditor tr {
          background: #ffffff !important;
        }
        .jsoneditor td {
          background: #ffffff !important;
        }
        .jsoneditor-field {
          color: #6b7280 !important;
        }
        .jsoneditor-value {
          color: #1f2937 !important;
        }
        .jsoneditor-value-string {
          color: #2563eb !important;
        }
        .jsoneditor-value-number {
          color: #059669 !important;
        }
        .jsoneditor-value-boolean {
          color: #d97706 !important;
        }
        .jsoneditor-value-null {
          color: #dc2626 !important;
        }
        .jsoneditor-array {
          color: #111827 !important;
        }
        .jsoneditor-object {
          color: #111827 !important;
        }
        .jsoneditor th {
          background: #f9fafb !important;
          color: #111827 !important;
        }
        .jsoneditor input[type="text"],
        .jsoneditor textarea {
          background: #ffffff !important;
          color: #1f2937 !important;
          border: 1px solid #d1d5db !important;
        }
        .jsoneditor input[type="text"]:focus,
        .jsoneditor textarea:focus {
          border-color: #2563eb !important;
        }
        .jsoneditor-actions {
          background: #f9fafb !important;
        }
        .jsoneditor-contextmenu {
          background: #ffffff !important;
          border: 1px solid #d1d5db !important;
        }
        .jsoneditor-contextmenu .jsoneditor-menu {
          background: #ffffff !important;
        }
        .jsoneditor-contextmenu li {
          color: #111827 !important;
        }
        .jsoneditor-contextmenu li:hover {
          background: #f3f4f6 !important;
        }
      `}
    `;
    document.head.appendChild(style);
    
    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, [theme]);

  // Fix yellow background on input fields when editing in dark mode
  useEffect(() => {
    if (!containerRef.current) return;
    
    const isDark = theme === 'dark';
    if (!isDark) return;
    
    const fixInputStyles = () => {
      if (!containerRef.current) return;
      
      // Find all inputs and textareas within the jsoneditor
      const inputs = containerRef.current.querySelectorAll('input[type="text"], textarea');
      
      inputs.forEach((input) => {
        const htmlInput = input as HTMLInputElement | HTMLTextAreaElement;
        
        // Force dark mode styles on all inputs in dark mode
        // Check if input is visible and editable
        if (htmlInput.offsetParent !== null) {
          const style = window.getComputedStyle(htmlInput);
          const bgColor = style.backgroundColor;
          const isFocused = document.activeElement === htmlInput;
          
          // Check if background is yellow-ish or light colored
          const rgbMatch = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
          let isLightColor = false;
          
          if (rgbMatch) {
            const r = parseInt(rgbMatch[1]);
            const g = parseInt(rgbMatch[2]);
            const b = parseInt(rgbMatch[3]);
            
            // Check if it's a yellow-ish or light color (high values)
            if (r > 200 && g > 200 && b > 150) {
              isLightColor = true;
            }
          }
          
          // Also check inline styles directly
          const inlineBg = htmlInput.style.backgroundColor?.toLowerCase() || '';
          if (inlineBg.includes('yellow') || 
              inlineBg.includes('rgb(255') || 
              inlineBg.includes('#ffff') ||
              inlineBg.includes('#fff')) {
            isLightColor = true;
          }
          
          // If it's a light color, fix it
          if (isLightColor) {
            // If focused, use darker gray, otherwise use transparent/background color
            if (isFocused) {
              htmlInput.style.setProperty('background-color', '#4b5563', 'important');
            } else {
              htmlInput.style.setProperty('background-color', 'transparent', 'important');
            }
            htmlInput.style.setProperty('color', '#f3f4f6', 'important');
            htmlInput.style.setProperty('border-color', '#6b7280', 'important');
          } else if (!isFocused && bgColor && (bgColor.includes('75') || bgColor.includes('91'))) {
            // If not focused and has gray background (from hover), clear it
            htmlInput.style.setProperty('background-color', 'transparent', 'important');
          }
        }
      });
      
      // Also fix parent cells/rows that might have yellow or light background
      const cells = containerRef.current.querySelectorAll('td, .jsoneditor-value');
      cells.forEach((cell) => {
        const htmlCell = cell as HTMLElement;
        const style = window.getComputedStyle(htmlCell);
        const bgColor = style.backgroundColor;
        
        const rgbMatch = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgbMatch) {
          const r = parseInt(rgbMatch[1]);
          const g = parseInt(rgbMatch[2]);
          const b = parseInt(rgbMatch[3]);
          
          // Fix yellow/light backgrounds
          if (r > 200 && g > 200 && b > 150) {
            htmlCell.style.setProperty('background-color', 'transparent', 'important');
          }
          // Clear gray hover backgrounds (but not if it's the base dark color)
          else if (r > 70 && r < 100 && g > 70 && g < 100 && b > 70 && b < 100) {
            // This is likely a hover gray, clear it
            htmlCell.style.setProperty('background-color', 'transparent', 'important');
          }
        }
      });
      
      // Fix field (key) hover styles
      const fields = containerRef.current.querySelectorAll('.jsoneditor-field');
      fields.forEach((field) => {
        const htmlField = field as HTMLElement;
        const style = window.getComputedStyle(htmlField);
        const bgColor = style.backgroundColor;
        
        // Check if the field is being hovered
        const row = htmlField.closest('.jsoneditor-row') as HTMLElement;
        const isHovered = row && row.matches(':hover');
        
        // Check if it has a light/yellow background
        const rgbMatch = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgbMatch) {
          const r = parseInt(rgbMatch[1]);
          const g = parseInt(rgbMatch[2]);
          const b = parseInt(rgbMatch[3]);
          
          // Fix yellow/light backgrounds on hover
          if (r > 200 && g > 200 && b > 150) {
            if (isHovered) {
              htmlField.style.setProperty('background-color', '#374151', 'important');
            } else {
              htmlField.style.setProperty('background-color', 'transparent', 'important');
            }
          }
          // Clear gray background if not hovered
          else if (!isHovered && (r > 50 && r < 60 && g > 50 && g < 60 && b > 50 && b < 60)) {
            // This is the gray hover color (#374151 = rgb(55, 65, 81))
            htmlField.style.setProperty('background-color', 'transparent', 'important');
          }
        }
        
        // Also check inline styles
        const inlineBg = htmlField.style.backgroundColor?.toLowerCase() || '';
        if (inlineBg.includes('yellow') || 
            inlineBg.includes('rgb(255') || 
            inlineBg.includes('#ffff') ||
            inlineBg.includes('#fff')) {
          if (isHovered) {
            htmlField.style.setProperty('background-color', '#374151', 'important');
          } else {
            htmlField.style.setProperty('background-color', 'transparent', 'important');
          }
        } else if (!isHovered && (inlineBg.includes('374151') || inlineBg.includes('rgb(55'))) {
          // Clear gray hover background when not hovered
          htmlField.style.setProperty('background-color', 'transparent', 'important');
        }
      });
      
      // Force dark background on all divs and containers to prevent white background when collapsed
      const allDivs = containerRef.current.querySelectorAll('.jsoneditor div');
      allDivs.forEach((div) => {
        const htmlDiv = div as HTMLElement;
        const style = window.getComputedStyle(htmlDiv);
        const bgColor = style.backgroundColor;
        
        // Skip if it's an input container or has specific classes that need different backgrounds
        if (htmlDiv.closest('input, textarea, .jsoneditor-value-edit')) {
          return;
        }
        
        // Check if it has a white or light background
        const rgbMatch = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgbMatch) {
          const r = parseInt(rgbMatch[1]);
          const g = parseInt(rgbMatch[2]);
          const b = parseInt(rgbMatch[3]);
          
          // If it's white or very light, force dark background
          if (r > 240 && g > 240 && b > 240) {
            htmlDiv.style.setProperty('background-color', '#374151', 'important');
          }
        }
        
        // Also check inline styles
        const inlineBg = htmlDiv.style.backgroundColor?.toLowerCase() || '';
        if (inlineBg.includes('white') || 
            inlineBg.includes('rgb(255') || 
            inlineBg.includes('#fff') ||
            (inlineBg.includes('rgb') && !inlineBg.includes('31') && !inlineBg.includes('55'))) {
          htmlDiv.style.setProperty('background-color', '#374151', 'important');
        }
      });
    };
    
    // Use MutationObserver to watch for DOM changes
    const observer = new MutationObserver(() => {
      fixInputStyles();
    });
    
    observer.observe(containerRef.current, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
    
    // Also listen for focus events on inputs
    const handleFocus = () => {
      fixInputStyles();
    };
    
    const handleBlur = () => {
      // Fix styles immediately when field loses focus
      setTimeout(fixInputStyles, 10);
      setTimeout(fixInputStyles, 50);
      setTimeout(fixInputStyles, 100);
    };
    
    const handleInput = () => {
      fixInputStyles();
    };
    
    const handleMouseLeave = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        fixInputStyles();
      }
    };
    
    const handleMouseEnter = () => {
      fixInputStyles();
    };
    
    let mouseMoveTimeout: NodeJS.Timeout | null = null;
    const handleMouseMove = () => {
      // Debounce mouse move to avoid performance issues
      if (mouseMoveTimeout) {
        clearTimeout(mouseMoveTimeout);
      }
      mouseMoveTimeout = setTimeout(() => {
        fixInputStyles();
      }, 50);
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('focusin', handleFocus, true);
      container.addEventListener('focusout', handleBlur, true);
      container.addEventListener('blur', handleBlur, true);
      container.addEventListener('click', handleFocus, true);
      container.addEventListener('input', handleInput, true);
      container.addEventListener('mouseleave', handleMouseLeave, true);
      container.addEventListener('mouseenter', handleMouseEnter, true);
      container.addEventListener('mousemove', handleMouseMove, true);
    }
    
    // Use interval to constantly fix styles (more aggressive approach)
    const intervalId = setInterval(fixInputStyles, 100);
    
    // Initial fix
    const timeoutId1 = setTimeout(fixInputStyles, 50);
    const timeoutId2 = setTimeout(fixInputStyles, 200);
    const timeoutId3 = setTimeout(fixInputStyles, 500);
    
    return () => {
      clearInterval(intervalId);
      observer.disconnect();
      if (mouseMoveTimeout) {
        clearTimeout(mouseMoveTimeout);
      }
      if (container) {
        container.removeEventListener('focusin', handleFocus, true);
        container.removeEventListener('focusout', handleBlur, true);
        container.removeEventListener('blur', handleBlur, true);
        container.removeEventListener('click', handleFocus, true);
        container.removeEventListener('input', handleInput, true);
        container.removeEventListener('mouseleave', handleMouseLeave, true);
        container.removeEventListener('mouseenter', handleMouseEnter, true);
        container.removeEventListener('mousemove', handleMouseMove, true);
      }
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
      clearTimeout(timeoutId3);
    };
  }, [theme]);

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

  const isDark = theme === 'dark';
  
  return (
    <div
      ref={containerRef}
      style={{
        height,
        minHeight: "400px",
        maxHeight: "600px",
        border: isDark ? "1px solid #4b5563" : "1px solid #d1d5db",
        borderRadius: 6,
        overflow: "hidden",
        background: isDark ? "#374151" : "#f3f4f6"
      }}
    />
  );
}
