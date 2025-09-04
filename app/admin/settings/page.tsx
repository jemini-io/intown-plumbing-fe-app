"use client";

import { useEffect, useState } from "react";
import { getSettings } from "./actions";
import { SettingsForm } from "./settings-form";
import AdminLayout from "../components/AdminLayout";

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
    <AdminLayout>
        <h3 className="text-xl font-bold">App Settings</h3>

        <SettingsForm onSaved={refresh} />
        
        <div className="space-y-2 mt-4">
          {settings.map((s) => (
            <SettingsForm key={s.id} existing={s} onSaved={refresh} />
          ))}
        </div>
    </AdminLayout>
  );
}
