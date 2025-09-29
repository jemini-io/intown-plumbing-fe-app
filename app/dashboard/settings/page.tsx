"use client";

import { useEffect, useState, useCallback } from "react";
import { getSettings } from "./actions";
import DashboardLayout from "../components/DashboardLayout";
import { PencilIcon, ClipboardDocumentIcon, CheckIcon, PlusIcon } from "@heroicons/react/24/outline";
import { isJson } from "@/lib/utils/isJson";
import dynamic from "next/dynamic";
import type { Setting } from "@/lib/types/setting";

const SyntaxHighlighter = dynamic(
  () => import("react-syntax-highlighter").then((m) => m.Prism),
  { ssr: false, loading: () => <pre className="text-xs whitespace-pre-wrap" /> }
);

const SettingsForm = dynamic(
  () => import("./settings-form").then(m => m.SettingsForm), 
  {
    ssr: false,
    loading: () => <div className="p-4 text-sm text-gray-500">Loading...</div>,
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
  const isJsonValue = isJson(value);

  const [prismStyle, setPrismStyle] = useState<PrismStyle | null>(null);
  useEffect(() => {
    let active = true;
    if (isJsonValue) {
      import("react-syntax-highlighter/dist/esm/styles/prism")
        .then((m) => { if (active) setPrismStyle(m.oneLight as PrismStyle); })
        .catch(() => {});
    } else {
      setPrismStyle(null);
    }
    return () => { active = false; };
  }, [isJsonValue]);

  return (
    <div className={`group relative ${isJsonValue ? "min-h-[80px]" : "min-h-[40px]"}`}>
      {isJsonValue ? (
        prismStyle ? (
          <SyntaxHighlighter
            language="json"
            style={prismStyle}
            customStyle={{
              fontSize: "0.85rem",
              borderRadius: "6px",
              padding: "8px",
              background: "#f8fafc",
              minHeight: 80,
              maxHeight: 300,
              overflow: "auto",
            }}
            showLineNumbers={false}
          >
            {JSON.stringify(JSON.parse(value), null, 2)}
          </SyntaxHighlighter>
        ) : (
          <pre className="text-xs whitespace-pre-wrap bg-slate-50 rounded p-2 min-h-[80px]">
            {value}
          </pre>
        )
      ) : (
        <div className="truncate">{value}</div>
      )}
      <button
        type="button"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-1 shadow hover:bg-gray-100"
        title="Copy value"
        onClick={() => handleCopy(value)}
      >
        {copied ? (
          <span className="flex items-center gap-1 text-green-600 font-semibold text-xs">
            <CheckIcon className="h-4 w-4" /> Copied!
          </span>
        ) : (
          <ClipboardDocumentIcon className="h-5 w-5 text-gray-500" />
        )}
      </button>
    </div>
  );
}

function KeyCell({ value }: { value: string }) {
  const { copied, handleCopy } = useCopy();
  return (
    <div className="group relative min-h-[40px] flex items-center">
      <span className="font-mono">{value}</span>
      <button
        type="button"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-1 shadow hover:bg-gray-100"
        title="Copy key"
        onClick={() => handleCopy(value)}
      >
        {copied ? (
          <span className="flex items-center gap-1 text-green-600 font-semibold text-xs">
            <CheckIcon className="h-4 w-4" /> Copied!
          </span>
        ) : (
          <ClipboardDocumentIcon className="h-5 w-5 text-gray-500" />
        )}
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<Setting | null>(null);

  async function refresh() {
    const all = await getSettings();
    setSettings(all);
  }

  useEffect(() => {
    refresh();
  }, []);

  function handleEdit(setting: Setting) {
    setSelectedSetting(setting);
    setModalOpen(true);
  }

  function handleModalClose() {
    setModalOpen(false);
    setSelectedSetting(null);
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
      <div className="min-h-screen p-8 space-y-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-3xl font-bold">App Settings</h3>
          <button className="p-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition" title="Add new user">
            <PlusIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left w-48">Key</th>
                <th className="px-4 py-2 text-left w-64">Value</th>
                <th className="px-4 py-2 text-left w-16">Actions</th>
              </tr>
            </thead>
            <tbody>
              {settings.map((s) => (
                <tr key={s.id} className="border-b hover:bg-blue-50">
                  <td className="px-4 py-2 font-mono text-gray-700 w-48">
                    <KeyCell value={s.key} />
                  </td>
                  <td className="px-4 py-2 text-gray-600 w-64">
                    <ValueCell value={s.value} />
                  </td>
                  <td className="px-4 py-2 w-16">
                    <button onClick={() => handleEdit(s)} className="p-1 rounded hover:bg-gray-200" title="Edit">
                      <PencilIcon className="h-5 w-5 text-blue-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div
              className="bg-white rounded-xl shadow-lg p-8 w-[700px] overflow-auto relative"
              style={{
                minWidth: 400,
                maxHeight: isJson(selectedSetting?.value ?? "") ? "90vh" : "600px",
                height: isJson(selectedSetting?.value ?? "") ? "90vh" : "auto",
              }}
            >
              <button onClick={handleModalClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold">
                ×
              </button>
              <SettingsForm
                existing={selectedSetting!}
                onSaved={() => {
                  refresh();
                  handleModalClose();
                }}
              />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
