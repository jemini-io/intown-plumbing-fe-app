"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { HomeIcon, ChartBarIcon, Cog6ToothIcon, UserGroupIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

export default function AdminSidebar() {
  return (
    <aside className="top-0 left-0 h-screen w-20 bg-gray-50 border-r p-4 flex flex-col items-center sticky z-50">
      
      <div className="flex flex-col items-center space-y-6 mt-4">
        <Link href="/admin" title="Home" className="hover:text-gray-900">
          <HomeIcon className="h-6 w-6 text-gray-700" />
        </Link>
        <Link href="/admin/dashboard" title="Dashboard" className="hover:text-gray-900">
          <ChartBarIcon className="h-6 w-6 text-gray-700" />
        </Link>
        <Link href="/admin/settings" title="Settings" className="hover:text-gray-900">
          <Cog6ToothIcon className="h-6 w-6 text-gray-700" />
        </Link>
        <Link href="/admin/users" title="Users" className="hover:text-gray-900">
          <UserGroupIcon className="h-6 w-6 text-gray-700" />
        </Link>
      </div>

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        title="Logout"
        className="mt-auto flex items-center justify-center p-2 rounded hover:bg-gray-200"
      >
        <ArrowRightOnRectangleIcon className="h-6 w-6 text-gray-700" />
      </button>
    </aside>
  );
}
