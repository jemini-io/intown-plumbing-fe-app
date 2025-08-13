import { prisma } from "@/lib/prisma";
import { safeCreateUser } from "../actions/safe-user";
import UsersForm from "./users-form";

export default async function UsersPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <main className="p-6">
      <h1 className="text-2xl mb-4">Users</h1>

      <UsersForm action={safeCreateUser} />

      <ul className="mt-6 space-y-2">
        {users.map(u => (
          <li key={u.id} className="rounded border p-3">
            <div className="font-medium">{u.name}</div>
            <div className="text-sm text-neutral-500">{u.email}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
