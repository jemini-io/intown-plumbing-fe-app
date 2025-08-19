"use client";

import { useEffect, useState } from "react";
import { getSettings } from "./actions";
import { SettingsForm } from "./settings-form";

type Setting = {
  id: number;
  key: string;
  value: string;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);

  async function refresh() {
    const all = await getSettings();
    setSettings(all);
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-xl font-bold">Settings</h1>

      {/* Formulario para crear */}
      <SettingsForm onSaved={refresh} />

      {/* Lista de existentes */}
      <div className="space-y-2">
        {settings.map((s) => (
          <SettingsForm key={s.id} existing={s} onSaved={refresh} />
        ))}
      </div>
    </div>
  );
}
