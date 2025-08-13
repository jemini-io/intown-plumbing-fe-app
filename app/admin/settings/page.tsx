import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  await requireAdmin(); // guard page
  const settings = await prisma.appSetting.findMany({ orderBy: { key: "asc" } });

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">App Settings</h1>
      <SettingsForm />

      <ul className="space-y-2">
        {settings.map(s => (
          <li key={s.id} className="border rounded p-3">
            <div className="font-mono text-sm">{s.key}</div>
            <pre className="text-xs opacity-80 overflow-auto">{JSON.stringify(s.value, null, 2)}</pre>
            <SettingsForm existing={s} />
          </li>
        ))}
      </ul>
    </main>
  );
}
