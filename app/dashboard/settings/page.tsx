"use client";

import { useEffect, useState } from "react";
import { getSettings } from "./actions";
import { SettingsForm } from "./settings-form";
import DashboardLayout from "../components/DashboardLayout";

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
    <DashboardLayout>
      <div className="min-h-screen p-8 space-y-8">
        <h3 className="text-3xl font-bold mb-8">App Settings</h3>

        <SettingsForm onSaved={refresh} />
        
        <div className="space-y-2 mt-4">
          {settings.map((s) => (
            <SettingsForm key={s.id} existing={s} onSaved={refresh} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
