"use client";

import { useState, useRef, useTransition, useEffect } from "react";
import { FormComponentProps } from "@/app/dashboard/components/DashboardCard";
import { addBooking, updateBooking } from "../actions";
import { Booking } from "@/lib/types/booking";
import { useCustomersDropdown, useServicesDropdown, useTechniciansDropdown } from "../hooks/useDropdownData";
import { toDatetimeLocalValue } from "@/lib/utils/datetime";
import { BookingStatus } from "@/lib/types/booking";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

type BookingFormProps = FormComponentProps & {
  existing?: Booking;
  initialScheduledFor?: Date;
  initialTechnicianId?: string;
};

export function BookingsForm({ existing, initialScheduledFor, initialTechnicianId, onSaved }: BookingFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [timeError, setTimeError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  // Load dropdown data via hooks
  const { data: allCustomers, isLoading: loadingCustomers } = useCustomersDropdown();
  const { data: allServices, isLoading: loadingServices } = useServicesDropdown();
  const { data: allTechnicians, isLoading: loadingTechnicians } = useTechniciansDropdown();

  // Types
  type CustomerWithImage = { id: string; name: string; image?: { url: string } | null };
  type TechnicianWithImage = { id: string; technicianName: string; image?: { url: string } | null };
  type ServiceWithEmoji = { id: string; displayName: string; emoji?: string };
  
  // States for dropdown selections
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithImage | null>(
    existing?.customerId ? (allCustomers.find(c => c.id === existing.customerId) as CustomerWithImage | undefined) || null : null
  );
  const [selectedService, setSelectedService] = useState<ServiceWithEmoji | null>(
    existing?.serviceId ? (allServices.find(s => s.id === existing.serviceId) as ServiceWithEmoji | undefined) || null : null
  );
  const [selectedTechnician, setSelectedTechnician] = useState<TechnicianWithImage | null>(
    existing?.technicianId ? (allTechnicians.find(t => t.id === existing.technicianId) as TechnicianWithImage | undefined) || null :
    initialTechnicianId ? (allTechnicians.find(t => t.id === initialTechnicianId) as TechnicianWithImage | undefined) || null : null
  );

  // Dropdown open states
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const [technicianDropdownOpen, setTechnicianDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  // Selected status state
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus>(
    existing?.status || initialScheduledFor ? "SCHEDULED" : "PENDING"
  );

  // Search queries
  const [customerQuery, setCustomerQuery] = useState("");
  const [serviceQuery, setServiceQuery] = useState("");
  const [technicianQuery, setTechnicianQuery] = useState("");

  // Refs for click outside detection
  const customerDropdownRef = useRef<HTMLDivElement>(null);
  const serviceDropdownRef = useRef<HTMLDivElement>(null);
  const technicianDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const customerSearchRef = useRef<HTMLInputElement>(null);
  const serviceSearchRef = useRef<HTMLInputElement>(null);
  const technicianSearchRef = useRef<HTMLInputElement>(null);

  // Filtered options based on query
  const filteredCustomers = customerQuery === ""
    ? allCustomers
    : allCustomers.filter((customer) =>
        customer.name.toLowerCase().includes(customerQuery.toLowerCase())
      );

  const filteredServices = serviceQuery === ""
    ? allServices
    : allServices.filter((service) =>
        service.displayName.toLowerCase().includes(serviceQuery.toLowerCase())
      );

  const filteredTechnicians = technicianQuery === ""
    ? allTechnicians
    : allTechnicians.filter((technician) =>
        technician.technicianName.toLowerCase().includes(technicianQuery.toLowerCase())
      );

  // Update selected status when existing booking changes
  useEffect(() => {
    if (existing?.status) {
      setSelectedStatus(existing.status);
    }
  }, [existing]);

  // Update selected values when data loads or existing booking changes
  useEffect(() => {
    if (existing && allCustomers.length > 0 && !selectedCustomer) {
      const customer = allCustomers.find(c => c.id === existing.customerId);
      if (customer) setSelectedCustomer(customer as CustomerWithImage);
    }
  }, [existing, allCustomers, selectedCustomer]);

  useEffect(() => {
    if (existing && allServices.length > 0 && !selectedService) {
      const service = allServices.find(s => s.id === existing.serviceId);
      if (service) setSelectedService(service as ServiceWithEmoji);
    }
  }, [existing, allServices, selectedService]);

  useEffect(() => {
    if (existing && allTechnicians.length > 0 && !selectedTechnician) {
      const technician = allTechnicians.find(t => t.id === existing.technicianId);
      if (technician) setSelectedTechnician(technician as TechnicianWithImage);
    } else if (initialTechnicianId && allTechnicians.length > 0 && !selectedTechnician) {
      const technician = allTechnicians.find(t => t.id === initialTechnicianId);
      if (technician) setSelectedTechnician(technician as TechnicianWithImage);
    }
  }, [existing, initialTechnicianId, allTechnicians, selectedTechnician]);

  // Handle click outside for customer dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
        setCustomerDropdownOpen(false);
      }
    }
    if (customerDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      setTimeout(() => customerSearchRef.current?.focus(), 0);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [customerDropdownOpen]);

  // Handle click outside for service dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(event.target as Node)) {
        setServiceDropdownOpen(false);
      }
    }
    if (serviceDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      setTimeout(() => serviceSearchRef.current?.focus(), 0);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [serviceDropdownOpen]);

  // Handle click outside for technician dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (technicianDropdownRef.current && !technicianDropdownRef.current.contains(event.target as Node)) {
        setTechnicianDropdownOpen(false);
      }
    }
    if (technicianDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      setTimeout(() => technicianSearchRef.current?.focus(), 0);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [technicianDropdownOpen]);

  // Handle click outside for status dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setStatusDropdownOpen(false);
      }
    }
    if (statusDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [statusDropdownOpen]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    // Validate time before submitting
    const scheduledForInput = e.currentTarget.querySelector<HTMLInputElement>('input[name="scheduledFor"]');
    if (scheduledForInput?.value) {
      const selectedDateTime = new Date(scheduledForInput.value);
      const hours = selectedDateTime.getHours();
      const minutes = selectedDateTime.getMinutes();
      const totalMinutes = hours * 60 + minutes;
      
      const minMinutes = 7 * 60 + 30; // 7:30 AM
      const maxMinutes = 23 * 60 + 30; // 11:30 PM
      
      if (totalMinutes < minMinutes || totalMinutes > maxMinutes) {
        setMessage({ type: "error", text: "Time must be between 7:30 AM and 11:30 PM" });
        setTimeError("Time must be between 7:30 AM and 11:30 PM");
        return;
      }
    }
    
    startTransition(async () => {
      const formData = new FormData(formRef.current!);

      const bookingData = {
        customerId: selectedCustomer?.id || existing?.customerId || (formData.get("customerId") as string),
        jobId: existing?.jobId || (formData.get("jobId") as string),
        serviceId: selectedService?.id || existing?.serviceId || (formData.get("serviceId") as string),
        technicianId: selectedTechnician?.id || existing?.technicianId || initialTechnicianId || (formData.get("technicianId") as string),
        scheduledFor: new Date(formData.get("scheduledFor") as string),
        status: selectedStatus || (formData.get("status") as BookingStatus) || existing?.status || "PENDING",
        revenue: Number(formData.get("revenue") || existing?.revenue || 0),
        notes: (formData.get("notes") as string) || existing?.notes || "",
      };

      try {
        if (existing) {
          await updateBooking(existing.id, bookingData);
          setMessage({ type: "success", text: "Booking updated successfully!" });
        } else {
          await addBooking(bookingData);
          setMessage({ type: "success", text: "Booking created successfully!" });
          formRef.current?.reset();
        }

        setMessage(null);
        setTimeError(null);
        onSaved();
      } catch (err) {
        console.error(err);
        setMessage({ type: "error", text: "Something went wrong. Please try again." });
      }
    });
  }

  const statusOptions: BookingStatus[] = ["PENDING", "SCHEDULED", "CANCELED", "COMPLETED"];

  // Get status badge color classes (same as calendar)
  function getStatusBadgeColor(status: BookingStatus): string {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 dark:bg-green-100 text-green-900";
      case "SCHEDULED":
        return "bg-blue-100 dark:bg-blue-100 text-blue-900";
      case "PENDING":
        return "bg-yellow-100 dark:bg-yellow-100 text-yellow-900";
      case "CANCELED":
        return "bg-red-100 dark:bg-red-100 text-red-900";
      default:
        return "bg-gray-100 dark:bg-gray-100 text-gray-900";
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-center dark:text-white">
        {existing ? "Edit Booking" : "Add New Booking"}
      </h2>
      {message && (
        <div
          className={`mb-4 text-center text-base font-medium transition-all ${
            message.type === "success" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="grid grid-cols-2 gap-4 items-start"
      >
        {/* Scheduled For */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Scheduled For</label>
          <input
            type="datetime-local"
            name="scheduledFor"
            defaultValue={
              existing?.scheduledFor
                ? toDatetimeLocalValue(existing.scheduledFor)
                : initialScheduledFor
                ? toDatetimeLocalValue(initialScheduledFor)
                : ""
            }
            onChange={(e) => {
              const selectedDateTime = new Date(e.target.value);
              const hours = selectedDateTime.getHours();
              const minutes = selectedDateTime.getMinutes();
              const totalMinutes = hours * 60 + minutes;
              
              // Check if time is between 7:30 AM (450 minutes) and 11:30 PM (1410 minutes)
              const minMinutes = 7 * 60 + 30; // 7:30 AM
              const maxMinutes = 23 * 60 + 30; // 11:30 PM
              
              if (totalMinutes < minMinutes || totalMinutes > maxMinutes) {
                setTimeError("Time must be between 7:30 AM and 11:30 PM");
              } else {
                setTimeError(null);
              }
            }}
            className={`w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2 ${
              timeError ? "border-red-500 dark:border-red-500" : ""
            }`}
            required
          />
          {timeError && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{timeError}</p>
          )}
        </div>
        {/* Customer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer</label>
          {loadingCustomers ? (
            <div className="text-sm text-gray-500 dark:text-gray-400 py-2">Loading customers...</div>
          ) : (
            <div className="relative" ref={customerDropdownRef}>
              <input type="hidden" name="customerId" value={selectedCustomer?.id || existing?.customerId || ""} />
              <button
                type="button"
                onClick={() => setCustomerDropdownOpen(!customerDropdownOpen)}
                className="w-full flex items-center justify-between border dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {selectedCustomer ? (
                    <>
                      {selectedCustomer.image?.url ? (
                        <Image
                          src={selectedCustomer.image.url}
                          alt={selectedCustomer.name}
                          width={20}
                          height={20}
                          className="rounded-full object-cover flex-shrink-0"
                          unoptimized
                        />
                      ) : (
                        <UserCircleIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                      )}
                      <span className="truncate dark:text-white">{selectedCustomer.name}</span>
                    </>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">Select a customer</span>
                  )}
                </div>
                <ChevronDownIcon
                  className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform flex-shrink-0 ${customerDropdownOpen ? "transform rotate-180" : ""}`}
                />
              </button>
              {customerDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg">
                  <div className="p-2 border-b dark:border-gray-700">
                    <input
                      ref={customerSearchRef}
                      type="text"
                      value={customerQuery}
                      onChange={(e) => setCustomerQuery(e.target.value)}
                      placeholder="Search customers..."
                      className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="max-h-60 overflow-auto">
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((customer) => (
                        <button
                          key={customer.id}
                          type="button"
                          onClick={() => {
                            setSelectedCustomer(customer as CustomerWithImage);
                            setCustomerDropdownOpen(false);
                            setCustomerQuery("");
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors ${
                            selectedCustomer?.id === customer.id ? "bg-blue-100 dark:bg-gray-700" : ""
                          }`}
                        >
                          {(customer as CustomerWithImage).image?.url ? (
                            <Image
                              src={(customer as CustomerWithImage).image!.url!}
                              alt={customer.name}
                              width={20}
                              height={20}
                              className="rounded-full object-cover flex-shrink-0"
                              unoptimized
                            />
                          ) : (
                            <UserCircleIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                          )}
                          <span className="text-sm font-medium dark:text-white">{customer.name}</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                        No customers found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        {/* Job ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job ID</label>
          <input
            type="text"
            name="jobId"
            defaultValue={existing?.jobId ?? ""}
            className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2 disabled:bg-gray-100 dark:disabled:bg-gray-800"
            required
            placeholder="e.g. job123"
            disabled={!!existing}
          />
        </div>
        {/* Service */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service</label>
          {loadingServices ? (
            <div className="text-sm text-gray-500 dark:text-gray-400 py-2">Loading services...</div>
          ) : (
            <div className="relative" ref={serviceDropdownRef}>
              <input type="hidden" name="serviceId" value={selectedService?.id || existing?.serviceId || ""} />
              <button
                type="button"
                onClick={() => setServiceDropdownOpen(!serviceDropdownOpen)}
                className="w-full flex items-center justify-between border dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {selectedService ? (
                    <>
                      {selectedService.emoji && (
                        <span className="text-lg flex-shrink-0">{selectedService.emoji}</span>
                      )}
                      <span className="truncate dark:text-white">{selectedService.displayName}</span>
                    </>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">Select a service</span>
                  )}
                </div>
                <ChevronDownIcon
                  className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform flex-shrink-0 ${serviceDropdownOpen ? "transform rotate-180" : ""}`}
                />
              </button>
              {serviceDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg">
                  <div className="p-2 border-b dark:border-gray-700">
                    <input
                      ref={serviceSearchRef}
                      type="text"
                      value={serviceQuery}
                      onChange={(e) => setServiceQuery(e.target.value)}
                      placeholder="Search services..."
                      className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="max-h-60 overflow-auto">
                    {filteredServices.length > 0 ? (
                      filteredServices.map((service) => (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => {
                            setSelectedService(service as ServiceWithEmoji);
                            setServiceDropdownOpen(false);
                            setServiceQuery("");
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors ${
                            selectedService?.id === service.id ? "bg-blue-100 dark:bg-gray-700" : ""
                          }`}
                        >
                          {(service as ServiceWithEmoji).emoji && (
                            <span className="text-lg flex-shrink-0">{(service as ServiceWithEmoji).emoji}</span>
                          )}
                          <span className="text-sm font-medium dark:text-white">{service.displayName}</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                        No services found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        {/* Technician */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Technician</label>
          {loadingTechnicians ? (
            <div className="text-sm text-gray-500 dark:text-gray-400 py-2">Loading technicians...</div>
          ) : (
            <div className="relative" ref={technicianDropdownRef}>
              <input type="hidden" name="technicianId" value={selectedTechnician?.id || existing?.technicianId || initialTechnicianId || ""} />
              <button
                type="button"
                onClick={() => setTechnicianDropdownOpen(!technicianDropdownOpen)}
                className="w-full flex items-center justify-between border dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {selectedTechnician ? (
                    <>
                      {selectedTechnician.image?.url ? (
                        <Image
                          src={selectedTechnician.image.url}
                          alt={selectedTechnician.technicianName}
                          width={20}
                          height={20}
                          className="rounded-full object-cover flex-shrink-0"
                          unoptimized
                        />
                      ) : (
                        <UserCircleIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                      )}
                      <span className="truncate dark:text-white">{selectedTechnician.technicianName}</span>
                    </>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">Select a technician</span>
                  )}
                </div>
                <ChevronDownIcon
                  className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform flex-shrink-0 ${technicianDropdownOpen ? "transform rotate-180" : ""}`}
                />
              </button>
              {technicianDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg">
                  <div className="p-2 border-b dark:border-gray-700">
                    <input
                      ref={technicianSearchRef}
                      type="text"
                      value={technicianQuery}
                      onChange={(e) => setTechnicianQuery(e.target.value)}
                      placeholder="Search technicians..."
                      className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="max-h-60 overflow-auto">
                    {filteredTechnicians.length > 0 ? (
                      filteredTechnicians.map((technician) => (
                        <button
                          key={technician.id}
                          type="button"
                          onClick={() => {
                            setSelectedTechnician(technician as TechnicianWithImage);
                            setTechnicianDropdownOpen(false);
                            setTechnicianQuery("");
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors ${
                            selectedTechnician?.id === technician.id ? "bg-blue-100 dark:bg-gray-700" : ""
                          }`}
                        >
                          {(technician as TechnicianWithImage).image?.url ? (
                            <Image
                              src={(technician as TechnicianWithImage).image!.url!}
                              alt={technician.technicianName}
                              width={20}
                              height={20}
                              className="rounded-full object-cover flex-shrink-0"
                              unoptimized
                            />
                          ) : (
                            <UserCircleIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                          )}
                          <span className="text-sm font-medium dark:text-white">{technician.technicianName}</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                        No technicians found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
          <div className="relative" ref={statusDropdownRef}>
            <input type="hidden" name="status" value={selectedStatus} />
            <button
              type="button"
              onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
              className="w-full flex items-center justify-between border dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <div className={`px-1.5 py-0.5 rounded text-xs font-semibold ${getStatusBadgeColor(selectedStatus)}`}>
                {selectedStatus}
              </div>
              <ChevronDownIcon
                className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform flex-shrink-0 ${statusDropdownOpen ? "transform rotate-180" : ""}`}
              />
            </button>
            {statusDropdownOpen && (
              <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg">
                <div className="max-h-60 overflow-auto">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => {
                        setSelectedStatus(status);
                        setStatusDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors ${
                        selectedStatus === status ? "bg-blue-100 dark:bg-gray-700" : ""
                      }`}
                    >
                      <div className={`px-1.5 py-0.5 rounded text-xs font-semibold ${getStatusBadgeColor(status)}`}>
                        {status}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Revenue */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Revenue ($)</label>
          <input
            type="number"
            name="revenue"
            defaultValue={existing?.revenue ?? ""}
            className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2"
            step="0.01"
            min="0"
            placeholder="e.g. 150.00"
          />
        </div>
        {/* Notes */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
          <textarea
            name="notes"
            defaultValue={existing?.notes ?? ""}
            className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2"
            rows={3}
            placeholder="Additional notes (optional)"
          />
        </div>
        <div className="col-span-2 flex justify-center mt-2">
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 dark:bg-white hover:bg-blue-700 dark:hover:bg-gray-200 text-white dark:text-gray-900 py-2 rounded-md font-medium shadow-md transition disabled:bg-blue-300 dark:disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isPending ? "Saving..." : existing ? "Update booking" : "Add booking"}
          </button>
        </div>
      </form>
    </div>
  );
}
