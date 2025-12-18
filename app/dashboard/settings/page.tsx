"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { getAllAppSettings, deleteAppSetting } from "./actions";
import DashboardLayout from "../components/DashboardLayout";
import { ClipboardDocumentIcon, CheckIcon } from "@heroicons/react/24/outline";
import { isJson } from "@/lib/utils/isJson";
import dynamic from "next/dynamic";
import type { Setting } from "@/lib/types/setting";
import { DeleteConfirmModal } from "@/app/components/DeleteConfirmModal";
import { useTheme } from "../contexts/ThemeContext";

const SyntaxHighlighter = dynamic(
  () => import("react-syntax-highlighter").then((m) => m.Prism),
  { ssr: false, loading: () => <pre className="text-xs whitespace-pre-wrap" /> }
);

const SingleValueSettingForm = dynamic(
  () => import("./components/SingleValueSettingForm").then(m => m.SingleValueSettingForm), 
  {
    ssr: false,
    loading: () => <div className="p-4 text-sm text-gray-500 dark:text-gray-400">Loading...</div>,
  }
);

const JSONSettingForm = dynamic(
  () => import("./components/JSONSettingForm").then(m => m.JSONSettingForm), 
  {
    ssr: false,
    loading: () => <div className="p-4 text-sm text-gray-500 dark:text-gray-400">Loading...</div>,
  }
);

function useCopy() {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async (text: string) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // noop
    }
  }, []);
  return { copied, handleCopy };
}

type PrismStyle = Record<string, unknown>;

function ValueCell({ value }: { value: string }) {
  const { copied, handleCopy } = useCopy();
  const { theme } = useTheme();
  const isJsonValue = isJson(value);

  const [prismStyle, setPrismStyle] = useState<PrismStyle | null>(null);
  useEffect(() => {
    let active = true;
    if (isJsonValue) {
      import("react-syntax-highlighter/dist/esm/styles/prism")
        .then((m) => {
          if (active) {
            // Use oneLight for both, but we'll override colors in customStyle
            setPrismStyle(m.oneLight as PrismStyle);
          }
        })
        .catch(() => {});
    } else {
      setPrismStyle(null);
    }
    return () => { active = false; };
  }, [isJsonValue, theme]);

  // Inject CSS to override syntax highlighter colors in dark mode
  useEffect(() => {
    if (!isJsonValue || theme !== "dark") return;
    
    const styleId = 'syntax-highlighter-dark-override';
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .dark pre[class*="language-"] *,
      .dark code[class*="language-"] *,
      .dark span[class*="token"] {
        color: #e5e7eb !important;
        background: transparent !important;
      }
      .dark span[class*="token"].string {
        color: #60a5fa !important;
      }
      .dark span[class*="token"].number {
        color: #34d399 !important;
      }
      .dark span[class*="token"].boolean {
        color: #fbbf24 !important;
      }
      .dark span[class*="token"].null {
        color: #f87171 !important;
      }
      .dark span[class*="token"].punctuation {
        color: #9ca3af !important;
      }
      .dark span[class*="token"].property {
        color: #a78bfa !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, [isJsonValue, theme]);

  return (
    <div className={`group relative ${isJsonValue ? "min-h-[80px]" : "min-h-[40px]"} w-full`}>
      {isJsonValue ? (
        prismStyle ? (
          <div className="w-full overflow-hidden">
            <SyntaxHighlighter
              language="json"
              style={prismStyle}
              customStyle={{
                fontSize: "0.85rem",
                borderRadius: "6px",
                padding: "8px",
                background: theme === "dark" ? "#1f2937" : "#f8fafc",
                color: theme === "dark" ? "#e5e7eb" : undefined,
                minHeight: 80,
                maxHeight: 300,
                overflow: "auto",
                width: "100%",
                maxWidth: "100%",
              }}
              codeTagProps={{
                style: {
                  color: theme === "dark" ? "#e5e7eb" : undefined,
                }
              }}
              showLineNumbers={false}
            >
              {JSON.stringify(JSON.parse(value), null, 2)}
            </SyntaxHighlighter>
          </div>
        ) : (
          <pre className="text-xs whitespace-pre-wrap bg-slate-50 dark:bg-gray-800 rounded p-2 min-h-[80px] w-full max-w-full overflow-auto dark:text-gray-200">
            {value}
          </pre>
        )
      ) : (
        <div className="truncate w-full">{value}</div>
      )}
      <button
        type="button"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-700 rounded-full p-1 shadow hover:bg-gray-100 dark:hover:bg-gray-600"
        title="Copy value"
        onClick={() => handleCopy(value)}
      >
        {copied ? (
          <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold text-xs">
            <CheckIcon className="h-4 w-4" /> Copied!
          </span>
        ) : (
          <ClipboardDocumentIcon className="h-5 w-5 text-gray-500 dark:text-gray-300" />
        )}
      </button>
    </div>
  );
}

const VIRTUAL_SETTING_KEYS = ['serviceToJobTypes', 'quoteSkills', 'technicianToSkills'] as const;

const VIRTUAL_SETTING_TABLE_NAMES: Record<typeof VIRTUAL_SETTING_KEYS[number], string> = {
  serviceToJobTypes: 'ServiceToJobType',
  quoteSkills: 'Skill',
  technicianToSkills: 'Technician',
};

function KeyCell({ settingKey }: { settingKey: string }) {
  const { copied, handleCopy } = useCopy();
  const isVirtualSetting = VIRTUAL_SETTING_KEYS.includes(settingKey as typeof VIRTUAL_SETTING_KEYS[number]);
  const tableName = isVirtualSetting ? VIRTUAL_SETTING_TABLE_NAMES[settingKey as typeof VIRTUAL_SETTING_KEYS[number]] : null;
  
  return (
    <div className="group relative min-h-[40px] flex flex-col items-start justify-center">
      <div className="flex items-center w-full">
        <span className="font-mono">{settingKey}</span>
        <button
          type="button"
          className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-700 rounded-full p-1 shadow hover:bg-gray-100 dark:hover:bg-gray-600"
          title="Copy key"
          onClick={() => handleCopy(settingKey)}
        >
          {copied ? (
            <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold text-xs">
              <CheckIcon className="h-4 w-4" /> Copied!
            </span>
          ) : (
            <ClipboardDocumentIcon className="h-5 w-5 text-gray-500 dark:text-gray-300" />
          )}
        </button>
      </div>
      {isVirtualSetting && tableName && (
        <span className="text-xs text-gray-500 dark:text-gray-400 italic mt-1">
          (pointing to the real &quot;{tableName}&quot; table in db)
        </span>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<Setting | null>(null);
  const [formType, setFormType] = useState<"single" | "json" | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [settingToDelete, setSettingToDelete] = useState<Setting | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [maxKeyWidth, setMaxKeyWidth] = useState<number>(256); // Default 256px (w-64)
  const [mounted, setMounted] = useState(false);

  async function refresh() {
    const all = await getAllAppSettings();
    setSettings(all);
    
    // Calculate max key width
    if (all.length > 0) {
      const maxLength = Math.max(...all.map(s => s.key.length));
      // Approximate width: ~9px per character for monospace font, plus padding
      const calculatedWidth = Math.max(256, maxLength * 9 + 48);
      setMaxKeyWidth(calculatedWidth);
    }
  }

  useEffect(() => {
    refresh();
    setMounted(true);
  }, []);

  function handleEdit(setting: Setting) {
    setSelectedSetting(setting);
    // Determine form type based on existing value
    const isJsonValue = isJson(setting.value);
    setFormType(isJsonValue ? "json" : "single");
    setModalOpen(true);
  }

  function handleAddClick() {
    setSelectedSetting(null);
    setFormType(null); // Will show type selector
    setModalOpen(true);
  }

  function handleModalClose() {
    setModalOpen(false);
    setSelectedSetting(null);
    setFormType(null);
  }

  function handleDelete(setting: Setting) {
    setSettingToDelete(setting);
    setConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!settingToDelete?.id) return;
    setDeleting(true);
    try {
      await deleteAppSetting(settingToDelete.id);
      setConfirmOpen(false);
      setSettingToDelete(null);
      await refresh();
    } catch (error) {
      console.error("Error deleting setting:", error);
    } finally {
      setDeleting(false);
    }
  }

  // Estos efectos solo corren en cliente (ok):
  useEffect(() => {
    if (!modalOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        handleModalClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalOpen]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (modalOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      if (typeof document !== "undefined") {
        document.body.classList.remove("overflow-hidden");
      }
    };
  }, [modalOpen]);

  return (
    <DashboardLayout>
      <div className="min-h-screen p-8 space-y-8 w-full">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-3xl font-bold dark:text-white">App Settings</h3>
          <button 
            onClick={handleAddClick}
            className="bg-blue-600 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded font-semibold shadow hover:bg-blue-700 dark:hover:bg-gray-200 transition flex items-center gap-2"
          >
            Add Setting
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow w-full dark:shadow-gray-700/50" style={{ width: "100%" }}>
          {/* Header */}
          <div className="flex gap-4 bg-gray-200 dark:bg-gray-700 px-6 py-2 border-b dark:border-gray-600" style={{ width: "100%" }}>
            <div className="text-left font-semibold text-gray-800 dark:text-gray-200 flex-shrink-0" style={{ width: `${maxKeyWidth}px` }}>Key</div>
            <div className="text-left font-semibold text-gray-800 dark:text-gray-200 flex-1">Value</div>
            <div className="text-right font-semibold text-gray-800 dark:text-gray-200 w-32 flex-shrink-0">Actions</div>
          </div>
          
          {/* Rows */}
          {settings.map((s) => (
            <div 
              key={s.id} 
              className="flex gap-4 px-6 py-2 border-b dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700 items-start"
              style={{ width: "100%" }}
            >
              <div className="font-mono text-gray-700 dark:text-gray-300 flex-shrink-0 whitespace-nowrap" style={{ width: `${maxKeyWidth}px` }}>
                <KeyCell settingKey={s.key} />
              </div>
              <div className="text-gray-600 dark:text-gray-300 flex-1 min-w-0">
                <ValueCell value={s.value} />
              </div>
              <div className="flex items-start justify-end gap-2 whitespace-nowrap w-32 flex-shrink-0">
                <button onClick={() => handleEdit(s)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600" title="Edit">
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">EDIT</span>
                </button>
                <button onClick={() => handleDelete(s)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600" title="Remove">
                  <span className="text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">REMOVE</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {mounted && modalOpen && createPortal(
          <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-30 flex items-center justify-center" style={{ zIndex: 9999 }}>
            <div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 w-[700px] overflow-auto relative"
              style={{
                minWidth: 400,
                maxHeight: formType === "json" ? "90vh" : "600px",
                height: formType === "json" ? "90vh" : "auto",
              }}
            >
              <button onClick={handleModalClose} className="absolute top-2 right-2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl font-bold">
                ×
              </button>
              
              {!formType && !selectedSetting ? (
                // Type selector for new settings
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-6 dark:text-white">Select Setting Type</h2>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => setFormType("single")}
                      className="px-6 py-3 bg-blue-600 dark:bg-white hover:bg-blue-700 dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded-md font-medium shadow-md transition"
                    >
                      Simple Value
                    </button>
                    <button
                      onClick={() => setFormType("json")}
                      className="px-6 py-3 bg-blue-600 dark:bg-white hover:bg-blue-700 dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded-md font-medium shadow-md transition"
                    >
                      JSON Value
                    </button>
                  </div>
                </div>
              ) : formType === "single" || (selectedSetting && !isJson(selectedSetting.value)) ? (
                <SingleValueSettingForm
                  existing={selectedSetting ?? undefined}
                  onSaved={() => {
                    refresh();
                    handleModalClose();
                  }}
                />
              ) : (
                <JSONSettingForm
                  existing={selectedSetting ?? undefined}
                  onSaved={() => {
                    refresh();
                    handleModalClose();
                  }}
                  allowEditJSONAsRawText={true}
                />
              )}
            </div>
          </div>,
          document.body
        )}

        {confirmOpen && settingToDelete && (
          <DeleteConfirmModal
            open={confirmOpen}
            title="Confirm Deletion"
            message={`Are you sure you want to delete the setting "${settingToDelete.key}"? This action cannot be undone.`}
            onCancel={() => {
              if (!deleting) setConfirmOpen(false);
            }}
            onConfirm={confirmDelete}
            loading={deleting}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
