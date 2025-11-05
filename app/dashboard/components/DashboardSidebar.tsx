"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import { UserCircleIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid";
import { logoutAction } from "@/app/actions/logout";
import { CustomNavLink } from "./CustomNavLink";
import { Dispatch, SetStateAction } from "react";
import { navItemsData } from "./navItemsData";
import { UserRole } from "@/app/dashboard/users/types";

interface DashboardSidebarProps {
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
}

export default function DashboardSidebar({
  collapsed,
  setCollapsed,
}: DashboardSidebarProps) {
  const { data: session, update } = useSession();
  const role = session?.user?.role as UserRole | undefined;
  const userImageUrl = session?.user?.image;
  const userName = session?.user?.name || "User";

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


      <div className="flex flex-col space-y-2 mt-4 flex-shrink-0 w-full">
        {navItemsData
          .filter(item => (role === "ADMIN" ? true : !item.requireAdmin))
          .map(item => (
            <CustomNavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              collapsed={collapsed}
              external={item.external}
            />
          ))}
      </div>

      <div className="mt-auto flex flex-col items-center space-y-2 pb-4 flex-shrink-0 w-full">
        {(() => {
          const ProfileIcon: React.ComponentType<{ className?: string }> = () => (
            userImageUrl ? (
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
            )
          );
          return (
            <CustomNavLink
              href="/dashboard/profile"
              label={userName}
              title={userName}
              icon={ProfileIcon}
              collapsed={collapsed}
              fullWidth
            />
          );
        })()}

        <CustomNavLink
          href="#logout"
          label="Logout"
          title="Logout"
          icon={ArrowRightOnRectangleIcon}
          collapsed={collapsed}
          onClick={handleLogout}
          fullWidth
        />
      </div>
    </aside>
  );
}
