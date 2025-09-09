"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { ChartBarIcon, 
         Cog6ToothIcon, 
         UserGroupIcon,
         UserCircleIcon,
         ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid";
import { logoutAction } from "@/app/actions/logout";

interface SessionWithRole {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: "USER" | "ADMIN";
  };
}

export default function DashboardSidebar() {
  const { data: session, update } = useSession() as { data: SessionWithRole | null };;
  const role = session?.user?.role;
  const userImageUrl = session?.user?.image;
  const userName = session?.user?.name || "User";

  const handleLogout = async () => {
    await logoutAction();
    await update();
  };

  console.log("Session user image:", session?.user?.image);

  return (
    <aside className="top-0 left-0 h-screen w-20 bg-gray-50 border-r p-4 flex flex-col items-center sticky z-50">
      
      <div className="flex flex-col items-center space-y-6 mt-4">
        <div className="h-10 w-10 rounded-full flex items-center justify-center rounded hover:bg-gray-200">
          <Link href="/dashboard" title="Dashboard" className="hover:text-gray-900 rounded hover:bg-gray-200">
            <ChartBarIcon className="h-6 w-6 text-gray-700" />
          </Link>
        </div>

        {role === "ADMIN" && (
        <>
          <Link href="/dashboard/settings" title="App Settings" className="hover:text-gray-900">
            <div className="h-10 w-10 rounded-full flex items-center justify-center rounded hover:bg-gray-200">
              <Cog6ToothIcon className="h-6 w-6 text-gray-700" />
            </div>
          </Link>
          <Link href="/dashboard/users" title="Users" className="hover:text-gray-900">
            <div className="h-10 w-10 rounded-full flex items-center justify-center rounded hover:bg-gray-200">
              <UserGroupIcon className="h-6 w-6 text-gray-700" />
            </div>
          </Link>
        </>
        )}
      </div>

  <div className="mt-auto flex flex-col items-center space-y-2">
    {/* Avatar */}
    <Link 
      href="#"
      title={userName}
      className="hover:text-gray-900 rounded hover:bg-gray-200"
    >
      {userImageUrl ? (
        <Image
          src={userImageUrl}
          alt={userName || "User"}
          width={32}
          height={32}
          className="rounded-full object-cover"
          unoptimized
        />
      ) : (
        <div className="h-10 w-10 rounded-full flex items-center justify-center rounded hover:bg-gray-200">
          <UserCircleIcon className="h-6 w-6 text-gray-700" />
        </div>
      )}
    </Link>

    {/* Botón logout */}
    <button
      onClick={handleLogout}
      title="Logout"
      className="flex items-center justify-center p-2 rounded hover:bg-gray-200"
    >
      <ArrowRightOnRectangleIcon className="h-6 w-6 text-gray-700" />
    </button>
  </div>
    </aside>
  );
}
