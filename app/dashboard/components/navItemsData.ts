import { Squares2X2Icon, ChartBarIcon, Cog6ToothIcon, UserGroupIcon, CalendarDaysIcon, WrenchIcon, CurrencyDollarIcon } from "@heroicons/react/24/solid";
import React from "react";

export type NavItemData = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  external?: boolean;
  requireAdmin?: boolean;
};

export const navItemsData: NavItemData[] = [
  {
    // Dashboard main page link
    href: "/dashboard", 
    label: "Dashboard", 
    icon: Squares2X2Icon, 
    requireAdmin: false
  },
  { 
    // Bookings page link
    href: "/dashboard/bookings", 
    label: "Bookings", 
    icon: CalendarDaysIcon, 
    requireAdmin: true 
  },
  { 
    // Customers page link
    href: "/dashboard/customers", 
    label: "Customers", 
    icon: UserGroupIcon, 
    requireAdmin: true 
  },
  { 
    // Technicians page link
    href: "/dashboard/technicians", 
    label: "Technicians", 
    icon: UserGroupIcon, 
    requireAdmin: true 
  },
  { 
    // Services page link
    href: "/dashboard/services", 
    label: "Services", 
    icon: WrenchIcon, 
    requireAdmin: true 
  },
  { 
    // Skills page link
    href: "/dashboard/skills", 
    label: "Skills", 
    icon: ChartBarIcon, 
    requireAdmin: true 
  },
  { 
    // Revenue external link
    href: "https://dashboard.stripe.com/", 
    label: "Revenue", 
    icon: CurrencyDollarIcon, 
    external: true, 
    requireAdmin: true 
  },
  { 
    // Users page link
    href: "/dashboard/users", 
    label: "Users", 
    icon: UserGroupIcon, 
    requireAdmin: true 
  },
  { 
    // Settings page link
    href: "/dashboard/settings", 
    label: "Settings", 
    icon: Cog6ToothIcon, 
    requireAdmin: true 
  }
];


