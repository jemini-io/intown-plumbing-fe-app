"use client";

import { useEffect, useState } from "react";
import { getSettings } from "./actions";
import { SettingsForm } from "./settings-form";
import AdminHeader from "../components/AdminHeader";
// import { signOut } from "next-auth/react";
// import Link from "next/link";

type Setting = {
  id: number;
  key: string;
  value: string;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
    // const [menuOpen, setMenuOpen] = useState(false);

  async function refresh() {
    const all = await getSettings();
    setSettings(all);
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="space-y-6 pt-20">
      <AdminHeader />

      <div className="p-4">
        <h3 className="text-xl font-bold">App Settings</h3>

        <SettingsForm onSaved={refresh} />
        
        <div className="space-y-2 mt-4">
          {settings.map((s) => (
            <SettingsForm key={s.id} existing={s} onSaved={refresh} />
          ))}
        </div>
      </div>
    </div>
  );
}
