"use client";

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

type IconType = React.ComponentType<{ className?: string }>;

type CustomNavOptionProps = {
  href: string;
  label: string;
  description?: string;
  icon: IconType;
  collapsed: boolean;
  external?: boolean;
  onClick?: () => void;
  fullWidth?: boolean;
};

export function CustomNavOption({ href, label, description = label, icon: Icon, collapsed, external, onClick, fullWidth }: CustomNavOptionProps) {
  const pathname = usePathname();
  const baseClasses = `group flex items-center ${collapsed ? "justify-center" : "gap-4 px-5"} py-3 rounded transition ${fullWidth ? "w-full" : ""}`;
  const colorClasses = "hover:bg-[#3d5a73] dark:hover:bg-gray-700";
  const isRoutable = !external && !onClick;
  const isActive = isRoutable && typeof pathname === "string" && (
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href)
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title={collapsed ? description : undefined}
        className={`${baseClasses} ${colorClasses}`}
      >
        <Icon className="h-6 w-6 text-white" />
        {!collapsed && (
          <span
            className={`text-white font-medium transition-all duration-200 ${collapsed ? "opacity-0 w-0 ml-0" : "opacity-100 w-auto ml-2"} overflow-hidden`}
          >
            {label}
          </span>
        )}
      </a>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={collapsed ? description : undefined}
        className={`${baseClasses} ${colorClasses}`}
      >
        <Icon className="h-6 w-6 text-white" />
        {!collapsed && (
          <span
            className={`text-white font-medium transition-all duration-200 ${collapsed ? "opacity-0 w-0 ml-0" : "opacity-100 w-auto ml-2"} overflow-hidden`}
          >
            {label}
          </span>
        )}
      </button>
    );
  }

  return (
    <Link href={href} title={collapsed ? description : undefined} className={`${baseClasses} ${colorClasses}`}>
      <Icon className="h-6 w-6 text-white" />
      {!collapsed && (
        <>
          <span
            className={`text-white font-medium transition-all duration-200 ${collapsed ? "opacity-0 w-0 ml-0" : "opacity-100 w-auto ml-2"} overflow-hidden`}
          >
            {label}
          </span>
          {isActive && (
            <ChevronRightIcon className="ml-auto h-4 w-4 text-white/80" />
          )}
        </>
      )}
    </Link>
  );
}


