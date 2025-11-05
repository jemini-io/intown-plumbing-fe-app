import React, { useEffect, useState, Fragment } from "react";
import { Booking, BookingStatus } from "@/lib/types/booking";
import { getAllBookings, deleteBooking, totalRevenue } from "../actions";
import { BookingsForm } from "./BookingsForm";
import { DeleteConfirmModal } from "@/app/components/DeleteConfirmModal";
import { Combobox } from "@headlessui/react";
import { PlusIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

function statusColor(status: BookingStatus) {
  switch (status) {
    case "SCHEDULED":
      return "bg-blue-100 text-blue-700";
    case "PENDING":
      return "bg-yellow-100 text-yellow-700";
    case "CANCELED":
      return "bg-red-100 text-red-700";
    case "COMPLETED":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

const columns = [
  { key: "scheduledFor", label: "Date & Time" },
  { key: "customerId", label: "Customer ID" },
  { key: "jobId", label: "Job ID" },
  { key: "service", label: "Service" },
  { key: "technician", label: "Technician" },
  { key: "status", label: "Status" },
];

export interface BookingsListViewProps {
  showHeader?: boolean;
  showJobId?: boolean;
  showStatus?: boolean;
  showNotes?: boolean;
  showRevenue?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  limit?: number;
}

export function BookingsListView({ 
  showHeader = true, 
  showJobId = false,
  showStatus = true,
  showNotes = false,
  showRevenue = true,
  canEdit, 
  canDelete, 
  limit 
}: BookingsListViewProps) {

  const showActions = canEdit || canDelete;
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Sorting state
  const [sortBy, setSortBy] = useState<keyof Booking>("scheduledFor");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Filter state
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "">("");
  const [serviceFilter, setServiceFilter] = useState<string | null>("");
  const [technicianFilter, setTechnicianFilter] = useState<string | null>("");
  const [customerFilter, setCustomerFilter] = useState<string | null>("");
  const [dateFilter, setDateFilter] = useState<string>("");

  const uniqueServices = Array.from(new Set((bookings || []).map(b => b.service?.displayName || "").filter(Boolean)));
  const uniqueTechnicians = Array.from(new Set((bookings || []).map(b => b.technician?.technicianName || "").filter(Boolean)));
  const uniqueCustomers = Array.from(new Set((bookings || []).map(b => b.customer?.name || "").filter(Boolean)));

  // Service filter state
  const [serviceQuery, setServiceQuery] = useState("");
  const filteredServices = serviceQuery === ""
    ? uniqueServices
    : uniqueServices.filter((service) =>
        service.toLowerCase().includes(serviceQuery.toLowerCase())
      );
  
  // Technician filter state
  const [technicianQuery, setTechnicianQuery] = useState("");
  const filteredTechnicians = technicianQuery === ""
    ? uniqueTechnicians
    : uniqueTechnicians.filter((tech) =>
        tech.toLowerCase().includes(technicianQuery.toLowerCase())
      );

  // Customer combobox state
  const [customerQuery, setCustomerQuery] = useState("");
  const filteredCustomers = customerQuery === ""
    ? uniqueCustomers
    : uniqueCustomers.filter((cust) =>
        cust.toLowerCase().includes(customerQuery.toLowerCase())
      );

  // Job filter state
  const [jobFilter, setJobFilter] = useState<string | null>("");
  const [jobQuery, setJobQuery] = useState("");
  const [openJob, setOpenJob] = useState(false);
  const uniqueJobs = Array.from(new Set((bookings || []).map(b => b.jobId).filter(Boolean)));
  const filteredJobs = jobQuery === ""
    ? uniqueJobs
    : uniqueJobs.filter((job) =>
        job.toLowerCase().includes(jobQuery.toLowerCase())
      );

  const [openService, setOpenService] = useState(false);
  const [openTechnician, setOpenTechnician] = useState(false);

  async function refresh() {
    const bookings = await getAllBookings();
    setBookings(bookings as unknown as Booking[]);
  }

  useEffect(() => {
    refresh();
  }, []);

  function handleAdd() {
    setSelectedBooking(null);
    setModalOpen(true);
  }

  function handleEdit(booking: Booking) {
    setSelectedBooking(booking);
    setModalOpen(true);
  }

  function handleDeleteBooking(booking: Booking) {
    setBookingToDelete(booking);
    setConfirmOpen(true);
  }

  const confirmDelete = () => {
    if (bookingToDelete) {
      setDeleting(true);
      deleteBooking(String(bookingToDelete.id)).then(() => {
        setDeleting(false);
        refresh();
        setConfirmOpen(false);
        setBookingToDelete(null);
      });
    }
  };

  // Sorting logic
  function sortBookings(a: Booking, b: Booking) {
    let valA = a[sortBy];
    let valB = b[sortBy];
    if (sortBy === "scheduledFor") {
      valA = new Date(valA as string | Date).getTime();
      valB = new Date(valB as string | Date).getTime();
    }
    if (valA === valB) return 0;
    if (valA == null) return 1;
    if (valB == null) return -1;
    if (valA > valB) return sortDir === "asc" ? 1 : -1;
    return sortDir === "asc" ? -1 : 1;
  }

  function handleSort(key: keyof Booking) {
    if (sortBy === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortDir("asc");
    }
  }

  const filteredBookings = (bookings || []).filter(b =>
    (!statusFilter || b.status === statusFilter) &&
    (!serviceFilter || (b.service?.displayName || "") === serviceFilter) &&
    (!technicianFilter || (b.technician?.technicianName || "") === technicianFilter) && 
    (!customerFilter || (b.customer?.name || "") === customerFilter) &&
    (!dateFilter || new Date(b.scheduledFor).toISOString().slice(0, 10) === dateFilter) &&
    (!jobFilter || b.jobId === jobFilter)
  );

  const sortedBookings = filteredBookings.sort(sortBookings);

  const [revenueTotal, setRevenueTotal] = useState<number>(0);

  useEffect(() => {
    async function loadRevenue() {
      const total = await totalRevenue();
      setRevenueTotal(total);
    }
    if (bookings) {
      loadRevenue();
    }
  }, [bookings]);

  const bookingsToRender = limit ? sortedBookings.slice(0, limit) : sortedBookings;

  return (
    <>
      {showHeader && (
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold">Bookings</h2>
          <button
            className="p-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition"
            title="Add new booking"
            onClick={handleAdd}
          >
            <PlusIcon className="h-6 w-6" />
          </button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto rounded-lg bg-white">
          <thead>
            <tr>
              {/* Image */}
              <th className="px-4 py-2 text-left"></th>
              {/* Customer */}
              <th className="px-4 py-2 text-left">
                <span className="flex items-center gap-2">
                  Customer
                  <Combobox value={customerFilter} onChange={setCustomerFilter} as="div">
                    <div className="relative">
                      <Combobox.Input
                        className="border rounded text-xs ml-2"
                        placeholder="Customer"
                        onChange={e => setCustomerQuery(e.target.value)}
                        displayValue={(val: string) => (!val ? "All" : val)}
                        style={{ minWidth: 0, width: "110px" }}
                        onFocus={() => setCustomerQuery("")}
                      />
                      {customerQuery !== undefined && (
                        <Combobox.Options className="absolute left-0 mt-1 z-50 bg-white border rounded shadow max-h-40 overflow-auto text-xs w-full">
                          <Combobox.Option value="">
                            All
                          </Combobox.Option>
                          {filteredCustomers.map((cust) => (
                            <Combobox.Option key={cust} value={cust} as={Fragment}>
                              {({ active, selected }) => (
                                <li
                                  className={`px-2 py-1 cursor-pointer ${active ? "bg-blue-100" : ""} ${selected ? "font-bold" : ""}`}
                                >
                                  {cust}
                                </li>
                              )}
                            </Combobox.Option>
                          ))}
                        </Combobox.Options>
                      )}
                    </div>
                  </Combobox>
                </span>
              </th>
              {/* Job ID */}
              {showJobId && ( <th className="px-4 py-2 text-left">
                <span className="flex items-center gap-2">
                  JobID
                  <Combobox value={jobFilter} onChange={setJobFilter} as="div">
                    <div className="relative">
                      <Combobox.Input
                        className="border rounded text-xs ml-2"
                        placeholder="Job"
                        onChange={e => setJobQuery(e.target.value)}
                        displayValue={(val: string) => (!val ? "All" : val)}
                        style={{ minWidth: 0, width: "110px" }}
                        onFocus={() => setOpenJob(true)}
                        onBlur={() => setTimeout(() => setOpenJob(false), 100)}
                      />
                      {openJob && (
                        <Combobox.Options className="absolute left-0 mt-1 z-50 bg-white border rounded shadow max-h-40 overflow-auto text-xs w-full">
                          <Combobox.Option value="">
                            All
                          </Combobox.Option>
                          {filteredJobs.map((job) => (
                            <Combobox.Option key={job} value={job} as={Fragment}>
                              {({ active, selected }) => (
                                <li
                                  className={`px-2 py-1 cursor-pointer ${active ? "bg-blue-100" : ""} ${selected ? "font-bold" : ""}`}
                                >
                                  {job}
                                </li>
                              )}
                            </Combobox.Option>
                          ))}
                        </Combobox.Options>
                      )}
                    </div>
                  </Combobox>
                </span>
              </th> )}
              {/* Service */}
              <th className="px-4 py-2 text-left">
                <span className="flex items-center gap-2">
                  Service
                  <Combobox value={serviceFilter} onChange={setServiceFilter} as="div">
                    <div className="relative">
                      <Combobox.Input
                        className="border rounded text-xs ml-2"
                        placeholder="Job"
                        onChange={e => setServiceQuery(e.target.value)}
                        displayValue={(val: string) => (!val ? "All" : val)}
                        style={{ minWidth: 0, width: "110px" }}
                        onFocus={() => setOpenService(true)}
                        onBlur={() => setTimeout(() => setOpenService(false), 100)}
                      />
                      {openService && (
                        <Combobox.Options className="absolute left-0 mt-1 z-50 bg-white border rounded shadow max-h-40 overflow-auto text-xs w-full">
                          <Combobox.Option value="">
                            All
                          </Combobox.Option>
                          {filteredServices.map((service) => (
                            <Combobox.Option key={service} value={service} as={Fragment}>
                              {({ active, selected }) => (
                                <li
                                  className={`px-2 py-1 cursor-pointer ${active ? "bg-blue-100" : ""} ${selected ? "font-bold" : ""}`}
                                >
                                  {service}
                                </li>
                              )}
                            </Combobox.Option>
                          ))}
                        </Combobox.Options>
                      )}
                    </div>
                  </Combobox>
                </span>
              </th>
              {/* Technician */}
              <th className="px-4 py-2 text-left">
                <span className="flex items-center gap-2">
                  Technician
                  <Combobox value={technicianFilter} onChange={setTechnicianFilter} as="div">
                    <div className="relative">
                      <Combobox.Input
                        className="border rounded text-xs ml-2"
                        placeholder="Technician"
                        onChange={e => setTechnicianQuery(e.target.value)}
                        displayValue={(val: string) => (!val ? "All" : val)}
                        style={{ minWidth: 0, width: "110px" }}
                        onFocus={() => setOpenTechnician(true)}
                        onBlur={() => setTimeout(() => setOpenTechnician(false), 100)}
                      />
                      {openTechnician && (
                        <Combobox.Options className="absolute left-0 mt-1 z-50 bg-white border rounded shadow max-h-40 overflow-auto text-xs w-full">
                          <Combobox.Option value="">
                            All
                          </Combobox.Option>
                          {filteredTechnicians.map((tech) => (
                            <Combobox.Option key={tech} value={tech} as={Fragment}>
                              {({ active, selected }) => (
                                <li
                                  className={`px-2 py-1 cursor-pointer ${active ? "bg-blue-100" : ""} ${selected ? "font-bold" : ""}`}
                                >
                                  {tech}
                                </li>
                              )}
                            </Combobox.Option>
                          ))}
                        </Combobox.Options>
                      )}
                    </div>
                  </Combobox>
                </span>
              </th>
              {/* Date & Time */}
              <th className="px-4 py-2 text-left">
                <span className="flex items-center gap-2">
                  <span
                    className="flex items-center gap-1 cursor-pointer select-none"
                    onClick={() => handleSort("scheduledFor")}
                    tabIndex={0}
                    role="button"
                    title="Sort by date"
                  >
                    Date & Time
                    <span className="inline-block align-middle">
                      <span className={"text-lg " + (sortBy === "scheduledFor" && sortDir === "asc" ? "text-blue-600" : "text-gray-300")}>▲</span>
                      <span className={"text-lg ml-0.5 " + (sortBy === "scheduledFor" && sortDir === "desc" ? "text-blue-600" : "text-gray-300")}>▼</span>
                    </span>
                  </span>
                  <input
                    type="date"
                    className="border rounded text-xs"
                    value={dateFilter}
                    onChange={e => setDateFilter(e.target.value)}
                    style={{ minWidth: 0, width: "110px" }}
                  />
                </span>
              </th>
              {/* Status */}
              {showStatus && ( <th className="px-4 py-2 text-left">
                <span className="flex items-center gap-2">
                  Status
                  <select
                    className="border rounded text-xs ml-2"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as BookingStatus | "")}
                    style={{ minWidth: 0, width: "110px" }}
                  >
                    <option value="">All</option>
                    <option value="PENDING">PENDING</option>
                    <option value="SCHEDULED">SCHEDULED</option>
                    <option value="CANCELED">CANCELED</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </span>
              </th> )}
              {/* Notes */}
              {showNotes && ( <th className="px-4 py-2 text-left">Notes</th> )}
              {/* Revenue */}
              {showRevenue && ( <th className="px-4 py-2 text-left">Revenue</th> )}
              {showActions && (
                <th className="px-4 py-2 text-left">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {bookingsToRender.map((booking) => (
              <tr key={booking.id} className="hover:bg-blue-50">
                <td className="pl-2 pr-1 py-2 w-12">
                  {booking.customer?.image?.url ? (
                    <Image
                      src={booking.customer.image.url}
                      alt={booking.customer.name || "Customer"}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full flex items-center justify-center">
                      <UserCircleIcon className="text-gray-700 h-7 w-7" />
                    </div>
                  )}
                </td>
                <td className="px-4 py-2 text-right">{booking.customer?.name || "-"}</td>
                {showJobId && ( <td className="px-4 py-2 text-right">{booking.jobId || "-"}</td> )}
                <td className="px-4 py-2 text-right">{booking.service?.displayName || "-"}</td>
                <td className="px-4 py-2 text-right">{booking.technician?.technicianName || "-"}</td>
                <td className="px-4 py-2 text-right">
                  {(() => {
                    const start = new Date(booking.scheduledFor as unknown as string);
                    const end = new Date(start.getTime() + 30 * 60 * 1000);
                    const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(start);
                    let monthShort = new Intl.DateTimeFormat("en-US", { month: "short" }).format(start);
                    monthShort = monthShort.charAt(0).toUpperCase() + monthShort.slice(1);
                    const monthAbbr = monthShort.endsWith(".") ? monthShort : monthShort + ".";
                    const dateLine = `${weekday}, ${monthAbbr} ${start.getDate()}, ${start.getFullYear()}`;
                    const timeFmt = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
                    const timeLine = `${timeFmt.format(start)} - ${timeFmt.format(end)}`;
                    return (
                      <div className="text-right">
                        <div>{dateLine}</div>
                        <div className="text-sm text-gray-500">{timeLine}</div>
                      </div>
                    );
                  })()}
                </td>
                {showStatus && ( <td className="px-4 py-2 text-right">
                  <span className={"text-xs font-bold px-2 py-1 rounded uppercase " + statusColor(booking.status)}>
                    {booking.status}
                  </span>
                </td> )}
                {showNotes && ( <td className="px-4 py-2">{booking.notes || "-"}</td> )}
                {showRevenue && ( <td className="px-4 py-2 text-right">$ {Number(booking.revenue).toFixed(2)}</td> )}
                {showActions && (canEdit || canDelete) && (
                  <td className="px-4 py-2 h-full">
                    <div className="flex gap-2 items-center h-full">
                      {canEdit && (
                        <button
                          className="text-blue-500 font-medium px-1"
                          onClick={() => handleEdit(booking)}
                        >
                          <span className="text-xs font-semibold text-blue-600">EDIT</span>
                        </button>
                      )}
                      {canDelete && (
                        <button
                          className="text-red-500 font-medium px-1"
                          onClick={() => handleDeleteBooking(booking)}
                        >
                          <span className="text-xs font-semibold text-red-600 hover:text-red-800">REMOVE</span>
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100">
              {/* empty cells for alignment */}
              {columns.map((_, idx) => (
                <td key={idx}></td>
              ))}
              {/* Revenue total */}
              <td className="px-4 py-2 font-bold text-right" colSpan={2}>
                ${revenueTotal.toFixed(2)}
              </td>
              {(canEdit || canDelete) && <td></td>}
            </tr>
          </tfoot>
        </table>
      </div>
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-[700px] overflow-auto relative" style={{ minWidth: 400, maxHeight: "90vh" }}>
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold"
            >
              ×
            </button>
            <BookingsForm
              existing={selectedBooking || undefined}
              onSaved={async () => {
                setModalOpen(false);
                await refresh();
              }}
            />
          </div>
        </div>
      )}
      {confirmOpen && bookingToDelete && (
        <DeleteConfirmModal
          open={confirmOpen}
          title="Confirm Deletion"
          message={`Are you sure you want to delete the booking with job ID "${bookingToDelete.jobId}"? This action cannot be undone.`}
          onCancel={() => {
            if (!deleting) setConfirmOpen(false);
          }}
          onConfirm={confirmDelete}
          loading={deleting}
        />
      )}
    </>
  );
}
