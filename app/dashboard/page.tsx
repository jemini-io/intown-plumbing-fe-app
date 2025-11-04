"use client";

import { memo, useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import DashboardLayout from "./components/DashboardLayout";
import { BookingsFormDataProvider } from "./bookings/contexts/BookingsFormDataContext";
import { DashboardCard } from "./components/DashboardCard";
import { DashboardHeaderPanel, DashboardHeaderTop } from "./components/DashboardHeader";
import { DashboardProvider } from "./contexts/DashboardContext";
import { ComingSoonModal } from "@/app/components/ComingSoonModal";
import { ServiceToJobTypesListView } from "./services/components";
import { TechnicianToSkillsListView } from "./technicians/components";
import { BookingsListView } from "./bookings/components/BookingsListView";
import {
  CalendarDaysIcon,
  CurrencyDollarIcon,
  WrenchIcon,
} from "@heroicons/react/24/outline";
import { getAllServiceToJobTypes } from "./services/actions";
import { getAllBookings, totalRevenue } from "./bookings/actions";

// Optional: if DashboardCard not already memoized and you want to reduce renders,
// you can wrap it in React.memo at its definition file instead.

const ServicesCard = memo(function ServicesCard() {
  const [expanded, setExpanded] = useState(false);
  const toggle = useCallback(() => setExpanded(prev => !prev), []);
  const ListView = useCallback(
    () => <ServiceToJobTypesListView limit={expanded ? undefined : 3} />,
    [expanded]
  );
  return (
    <DashboardCard
      viewAllLabel={expanded ? "Collapse" : "View All Services"}
      onViewAll={toggle}
      iconsData={{ plusIconTitle: "Add Service" }}
      listView={ListView}
    />
  );
});

const TechniciansCard = memo(function TechniciansCard() {
  const [expanded, setExpanded] = useState(false);
  const toggle = useCallback(() => setExpanded(prev => !prev), []);
  const ListView = useCallback(
    () => <TechnicianToSkillsListView limit={expanded ? undefined : 6} showImage={false} showSkills={false} />,
    [expanded]
  );
  return (
    <DashboardCard
      viewAllLabel={expanded ? "Collapse" : "View All Technicians"}
      onViewAll={toggle}
      iconsData={{ plusIconTitle: "Add Technician" }}
      listView={ListView}
    />
  );
});

const BookingsCard = memo(function BookingsCard() {
  const [expanded, setExpanded] = useState(false);
  const toggle = useCallback(() => setExpanded(prev => !prev), []);
  const ListView = useCallback(
    () => (
      <div className="overflow-x-hidden">
        <BookingsListView
          canEdit={false}
          canDelete={false}
          limit={expanded ? undefined : 3}
        />
      </div>
    ),
    [expanded]
  );
  return (
    <DashboardCard
      viewAllLabel={expanded ? "Collapse" : "View All Bookings"}
      onViewAll={toggle}
      iconsData={{ plusIconTitle: "Add Booking" }}
      listView={ListView}
    />
  );
});

export default function DashboardPage() {
  const [bookingsCount, setBookingsCount] = useState<number>(0);
  const [servicesCount, setServicesCount] = useState<number>(0);
  const [revenueTotal, setRevenueTotal] = useState<number>(0);
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const refresh = useCallback(async () => {
    const [bookings, services, revenue] = await Promise.all([
      getAllBookings(),
      getAllServiceToJobTypes(),
      totalRevenue(),
    ]);
    setBookingsCount(bookings.length);
    setServicesCount(services.filter(service => service.enabled === true).length);
    setRevenueTotal(revenue);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <DashboardProvider refresh={refresh}>
      <BookingsFormDataProvider>
      <DashboardLayout>
        <div className="bg-gray-100 min-h-screen p-8 space-y-8 rounded-lg">
          {/* Dashboard Header Row */}
          <DashboardHeaderTop />

          {/* Header with three panels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <DashboardHeaderPanel 
              title="Number of Bookings" 
              content={<span>{bookingsCount}</span>}
              icon={CalendarDaysIcon}
              linkText="SHOW ALL"
              onLinkClick={() => setComingSoonOpen(true)}
            />
            <DashboardHeaderPanel 
              title="Total of Revenue" 
              content={<span>${revenueTotal.toFixed(2)}</span>}
              icon={CurrencyDollarIcon}
              linkText="VIEW"
              onLinkClick={() => setComingSoonOpen(true)}
            />
            <DashboardHeaderPanel 
              title="Services Used" 
              content={<span>{servicesCount}</span>}
              icon={WrenchIcon}
              linkText="SHOW ALL"
              onLinkClick={() => setComingSoonOpen(true)}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="flex flex-col gap-6">
              <ServicesCard />
            </div>
            <div className="flex flex-col gap-6">
              <TechniciansCard />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <BookingsCard />
          </div>
        </div>
      </DashboardLayout>
      {mounted && createPortal(
        <ComingSoonModal
          open={comingSoonOpen}
          onClose={() => setComingSoonOpen(false)}
        />,
        document.body
      )}
      </BookingsFormDataProvider>
    </DashboardProvider>
  );
}
