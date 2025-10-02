"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { ChartBarIcon, 
         Cog6ToothIcon, 
         UserGroupIcon,
         UserCircleIcon,
         ArrowRightOnRectangleIcon,
         CalendarDaysIcon } from "@heroicons/react/24/solid";
import { logoutAction } from "@/app/actions/logout";
import { useRouter } from "next/navigation";

// interface SessionWithRole {
//   user: {
//     name?: string | null;
//     email?: string | null;
//     image?: string | null;
//     role?: "USER" | "ADMIN";
//   };
// }

export default function DashboardSidebar() {
  const { data: session, update } = useSession(); // as { data: SessionWithRole | null };
  const role = session?.user?.role as ("USER" | "ADMIN") | undefined;
  const userImageUrl = session?.user?.image;
  const userName = session?.user?.name || "User";
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAction();
    await update();
  };

  console.log("Session user image:", session?.user?.image);

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-20 bg-gray-50 border-r p-4 flex flex-col items-center z-50 overflow-y-auto">
      <div className="flex flex-col items-center space-y-6 mt-4 flex-shrink-0">
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
          <Link href="/dashboard/bookings" title="Bookings" className="hover:text-gray-900">
            <div className="h-10 w-10 rounded-full flex items-center justify-center rounded hover:bg-gray-200">
              <CalendarDaysIcon className="h-6 w-6 text-gray-700" />
            </div>
          </Link>
        </>
        )}
      </div>

      <div className="mt-auto flex flex-col items-center space-y-2 pb-4 flex-shrink-0">
        {/* user avatar (non-interactive) */}
        <button
          type="button"
          onClick={() => router.push("/dashboard/profile")}
          title={userName}
          aria-label={`Profile of ${userName}`}
          className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
        >
          {userImageUrl ? (
            <Image
              src={userImageUrl}
              alt={userName}
              width={40}
              height={40}
              className="rounded-full object-cover"
              unoptimized
            />
          ) : (
            <UserCircleIcon className="h-6 w-6 text-gray-700" />
          )}
        </button>

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
