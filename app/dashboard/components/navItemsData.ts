import { Squares2X2Icon, ChartBarIcon, Cog6ToothIcon, UserGroupIcon, CalendarDaysIcon, WrenchIcon, CurrencyDollarIcon, TicketIcon } from "@heroicons/react/24/solid";
import React from "react";

export type NavItemData = {
  href: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  external?: boolean;
  requireAdmin?: boolean;
};

export const navItemsData: NavItemData[] = [
  {
    // Dashboard main page link
    href: "/dashboard", 
    label: "Dashboard",
    description: "View your dashboard",
    icon: Squares2X2Icon, 
    requireAdmin: false
  },
  { 
    // Bookings page link
    href: "/dashboard/bookings", 
    label: "Bookings", 
    description: "Manage bookings",
    icon: CalendarDaysIcon, 
    requireAdmin: false 
  },
  { 
    // Customers page link
    href: "/dashboard/customers", 
    label: "Customers", 
    description: "Manage customers",
    icon: UserGroupIcon, 
    requireAdmin: false 
  },
  { 
    // Technicians page link
    href: "/dashboard/technicians", 
    label: "Technicians", 
    description: "Manage technicians",
    icon: UserGroupIcon, 
    requireAdmin: false 
  },
  { 
    // Services page link
    href: "/dashboard/services", 
    label: "Services", 
    description: "Manage services",
    icon: WrenchIcon, 
    requireAdmin: false 
  },
  { 
    // Skills page link
    href: "/dashboard/skills", 
    label: "Skills", 
    description: "Manage skills",
    icon: ChartBarIcon, 
    requireAdmin: false 
  },
  { 
    // Promo Codes page link
    href: "/dashboard/promoCodes", 
    label: "Promo Codes", 
    description: "Manage promo codes",
    icon: TicketIcon, 
    requireAdmin: true 
  },
  { 
    // Revenue external link
    href: "https://dashboard.stripe.com/", 
    label: "Revenue", 
    description: "Go to Stripe dashboard",
    icon: CurrencyDollarIcon, 
    external: true, 
    requireAdmin: false 
  },
  { 
    // Users page link
    href: "/dashboard/users", 
    label: "Users", 
    description: "Manage users",
    icon: UserGroupIcon, 
    requireAdmin: true 
  },
  { 
    // Settings page link
    href: "/dashboard/settings", 
    label: "Settings", 
    description: "Manage the App settings",
    icon: Cog6ToothIcon, 
    requireAdmin: true 
  }
];

export const adminOnlyRoutes: string[] = navItemsData
  .filter(item => item.requireAdmin === true)
  .map(item => item.href);

export const userOnlyRoutes: string[] = navItemsData
  .filter(item => item.requireAdmin === false)
  .map(item => item.href);



