"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import Image from "next/image";
import {
  Squares2X2Icon,
  ChartBarIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  CalendarDaysIcon,
  WrenchIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/solid";
import { logoutAction } from "@/app/actions/logout";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction } from "react";

// interface SessionWithRole {
//   user: {
//     name?: string | null;
//     email?: string | null;
//     image?: string | null;
//     role?: "USER" | "ADMIN";
//   };
// }

interface DashboardSidebarProps {
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
}

export default function DashboardSidebar({
  collapsed,
  setCollapsed,
}: DashboardSidebarProps) {
  const { data: session, update } = useSession(); // as { data: SessionWithRole | null };
  const role = session?.user?.role as ("USER" | "ADMIN") | undefined;
  const userImageUrl = session?.user?.image;
  const userName = session?.user?.name || "User";
  const router = useRouter();
  // const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logoutAction();
    await update();
  };

  console.log("Session user image:", session?.user?.image);

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 ${
        collapsed ? "w-20" : "w-72"
      } bg-[#1e3a4f] border-r p-4 flex flex-col items-start z-50 overflow-y-auto transition-all duration-200`}
    >
      {/* Collapse/Expand button */}
      <div className="w-full flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <span className="text-white text-3xl font-bold px-6 py-2">
              PipeLine
            </span>
          </div>
        )}
        <button
          type="button"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setCollapsed((v: boolean) => !v)}
          className="self-center bg-[#25405a] text-white rounded-full p-2 hover:bg-[#3d5a73] transition"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg width="24" height="24" fill="none">
            <path
              d={collapsed ? "M8 6l8 6-8 6" : "M16 6l-8 6 8 6"}
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Header */}

      <div className="flex flex-col space-y-2 mt-4 flex-shrink-0 w-full">
        <Link
          href="/dashboard"
          title="Dashboard"
          className={`group flex items-center ${
            collapsed ? "justify-center" : "gap-4 px-5"
          } py-3 rounded hover:bg-[#3d5a73] transition`}
        >
          <Squares2X2Icon className="h-6 w-6 text-white" />
          {!collapsed && (
            <span
              className={`text-white font-medium transition-all duration-200
                ${collapsed ? "opacity-0 w-0 ml-0" : "opacity-100 w-auto ml-2"}
                overflow-hidden`}
            >
              Dashboard
            </span>
          )}
        </Link>

        {role === "ADMIN" && (
          <>
            <Link
              href="/dashboard/bookings"
              title="Bookings"
              className={`group flex items-center ${
                collapsed ? "justify-center" : "gap-4 px-5"
              } py-3 rounded hover:bg-[#3d5a73] transition`}
            >
              <CalendarDaysIcon className="h-6 w-6 text-white" />
              {!collapsed && (
                <span
                  className={`text-white font-medium transition-all duration-200
                ${collapsed ? "opacity-0 w-0 ml-0" : "opacity-100 w-auto ml-2"}
                overflow-hidden`}
                >
                  Bookings
                </span>
              )}
            </Link>
            <Link
              href="/dashboard/technicians"
              title="Technicians"
              className={`group flex items-center ${
                collapsed ? "justify-center" : "gap-4 px-5"
              } py-3 rounded hover:bg-[#3d5a73] transition`}
            >
              <UserGroupIcon className="h-6 w-6 text-white" />
              {!collapsed && (
                <span
                  className={`text-white font-medium transition-all duration-200
                ${collapsed ? "opacity-0 w-0 ml-0" : "opacity-100 w-auto ml-2"}
                overflow-hidden`}
                >
                  Technicians
                </span>
              )}
            </Link>
            <Link
              href="/dashboard/services"
              title="Services"
              className={`group flex items-center ${
                collapsed ? "justify-center" : "gap-4 px-5"
              } py-3 rounded hover:bg-[#3d5a73] transition`}
            >
              <WrenchIcon className="h-6 w-6 text-white" />
              {!collapsed && (
                <span
                  className={`text-white font-medium transition-all duration-200
                ${collapsed ? "opacity-0 w-0 ml-0" : "opacity-100 w-auto ml-2"}
                overflow-hidden`}
                >
                  Services
                </span>
              )}
            </Link>
            <a
              href="https://dashboard.stripe.com/"
              target="_blank"
              rel="noopener noreferrer"
              title="Revenue (Stripe Dashboard)"
              className={`group flex items-center ${
                collapsed ? "justify-center" : "gap-4 px-5"
              } py-3 rounded hover:bg-[#3d5a73] transition`}
            >
              <CurrencyDollarIcon className="h-6 w-6 text-white" />
              {!collapsed && (
                <span
                  className={`text-white font-medium transition-all duration-200
                ${collapsed ? "opacity-0 w-0 ml-0" : "opacity-100 w-auto ml-2"}
                overflow-hidden`}
                >
                  Revenue
                </span>
              )}
            </a>
            <Link
              href="/dashboard/users"
              title="Users"
              className={`group flex items-center ${
                collapsed ? "justify-center" : "gap-4 px-5"
              } py-3 rounded hover:bg-[#3d5a73] transition`}
            >
              <UserGroupIcon className="h-6 w-6 text-white" />
              {!collapsed && (
                <span
                  className={`text-white font-medium transition-all duration-200
                ${collapsed ? "opacity-0 w-0 ml-0" : "opacity-100 w-auto ml-2"}
                overflow-hidden`}
                >
                  Users
                </span>
              )}
            </Link>
            <Link
              href="/dashboard/settings"
              title="App Settings"
              className={`group flex items-center ${
                collapsed ? "justify-center" : "gap-4 px-5"
              } py-3 rounded hover:bg-[#3d5a73] transition`}
            >
              <Cog6ToothIcon className="h-6 w-6 text-white" />
              {!collapsed && (
                <span
                  className={`text-white font-medium transition-all duration-200
                ${collapsed ? "opacity-0 w-0 ml-0" : "opacity-100 w-auto ml-2"}
                overflow-hidden`}
                >
                  Settings
                </span>
              )}
            </Link>
          </>
        )}
      </div>

      <div className="mt-auto flex flex-col items-center space-y-2 pb-4 flex-shrink-0 w-full">
        <button
          type="button"
          onClick={() => router.push("/dashboard/profile")}
          title={userName}
          aria-label={`Profile of ${userName}`}
          className={`group flex items-center ${
            collapsed ? "justify-center" : "gap-3 px-3"
          } py-2 rounded hover:bg-[#3d5a73] transition w-full`}
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
            <UserCircleIcon className="h-6 w-6 text-white" />
          )}
          {!collapsed && (
            <span
              className={`text-white font-medium transition-all duration-200
                ${collapsed ? "opacity-0 w-0 ml-0" : "opacity-100 w-auto ml-2"}
                overflow-hidden`}
            >
              {userName}
            </span>
          )}
        </button>

        <button
          onClick={handleLogout}
          title="Logout"
          className={`group flex items-center ${
            collapsed ? "justify-center" : "gap-3 px-3"
          } py-2 rounded hover:bg-[#3d5a73] transition w-full`}
        >
          <ArrowRightOnRectangleIcon className="h-6 w-6 text-white" />
          {!collapsed && (
            <span
              className={`text-white font-medium transition-all duration-200
                ${collapsed ? "opacity-0 w-0 ml-0" : "opacity-100 w-auto ml-2"}
                overflow-hidden`}
            >
              Logout
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
