"use client";

import AdminHeader from "../components/AdminHeader";
import Image from 'next/image';

export default function UsersPage() {
  return (
    <div className="space-y-6 pt-20">
      <AdminHeader />
      <div className="p-4">
        <h2 className="text-lg font-bold">Users dashboard's coming soon!</h2>
        <Image
            src="/admin.png"
            alt="InTown Plumbing Logo"
            width={200}
            height={134}
            className="h-auto w-64 sm:w-40 lg:w-64"
            priority
        />
      </div>
    </div>
  );
}
