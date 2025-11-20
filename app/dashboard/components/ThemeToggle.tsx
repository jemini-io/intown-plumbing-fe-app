"use client";

import { useTheme } from "../contexts/ThemeContext";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

interface ThemeToggleProps {
  collapsed?: boolean;
}

export function ThemeToggle({ collapsed = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  const baseClasses = `group flex items-center ${collapsed ? "justify-center" : "gap-4 px-5"} py-3 rounded transition w-full`;
  const colorClasses = "hover:bg-[#3d5a73] dark:hover:bg-gray-700";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`${baseClasses} ${colorClasses}`}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      title={collapsed ? `Switch to ${theme === "light" ? "dark" : "light"} mode` : undefined}
    >
      {theme === "light" ? (
        <MoonIcon className="h-6 w-6 text-white" />
      ) : (
        <SunIcon className="h-6 w-6 text-white" />
      )}
      {!collapsed && (
        <span className="text-white font-medium transition-all duration-200">
          {theme === "light" ? "Dark" : "Light"} Mode
        </span>
      )}
    </button>
  );
}


