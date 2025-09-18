import React, { useEffect, useState, Fragment } from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Booking } from "@/lib/types/booking";
import { getAllBookings, deleteBooking } from "../actions";
import { BookingsForm } from "./BookingsForm";
import { DeleteConfirmModal } from "@/app/components/DeleteConfirmModal";
import { Combobox } from "@headlessui/react";

function statusColor(status: string) {
  switch (status.toLowerCase()) {
    case "confirmed":
      return "bg-green-100 text-green-700";
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "scheduled":
      return "bg-blue-100 text-blue-700";
    case "canceled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

const columns = [
  { key: "scheduledFor", label: "Date" },
  { key: "technicianId", label: "Technician" },
  { key: "customerId", label: "Customer" },
  { key: "status", label: "Status" },
];

export function BookingsListView({ showHeader = true, canEdit, canDelete }: { showHeader?: boolean; canEdit: boolean; canDelete: boolean }) {
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
  const [statusFilter, setStatusFilter] = useState("");
  const [technicianFilter, setTechnicianFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Obtén los valores únicos de technicianId y customerId
  const uniqueTechnicians = Array.from(new Set((bookings || []).map(b => b.technicianId).filter(Boolean)));
  const uniqueCustomers = Array.from(new Set((bookings || []).map(b => b.customerId).filter(Boolean)));

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

  // Technician combobox open state
  const [openTechnician, setOpenTechnician] = useState(false);

  async function refresh() {
    const bookings = await getAllBookings();
    setBookings(bookings);
  }

  useEffect(() => {
    refresh();
  }, []);

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

  // Filtra bookings antes de ordenar
  const filteredBookings = (bookings || []).filter(b =>
    (!statusFilter || b.status === statusFilter) &&
    (!technicianFilter || b.technicianId === technicianFilter) &&
    (!customerFilter || b.customerId === customerFilter) &&
    (!dateFilter || new Date(b.scheduledFor).toISOString().slice(0, 10) === dateFilter)
  );

  const sortedBookings = filteredBookings.sort(sortBookings);

  return (
    <>
      {showHeader && (
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold">Bookings</h2>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto rounded-lg bg-white">
          <thead>
            <tr>
              {/* Date */}
              <th className="px-4 py-2 text-left">
                <span className="flex items-center gap-2">
                  <span
                    className="flex items-center gap-1 cursor-pointer select-none"
                    onClick={() => handleSort("scheduledFor")}
                    tabIndex={0}
                    role="button"
                    title="Sort by date"
                  >
                    Date
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
              {/* Status */}
              <th className="px-4 py-2 text-left">
                <span className="flex items-center gap-2">
                  Status
                  <select
                    className="border rounded text-xs ml-2"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    style={{ minWidth: 0, width: "110px" }}
                  >
                    <option value="">All</option>
                    <option value="pending">Pending</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="canceled">Canceled</option>
                  </select>
                </span>
              </th>
              {/* Notes */}
              <th className="px-4 py-2 text-left">Notes</th>
              {(canEdit || canDelete) && (
                <th className="px-4 py-2 text-left">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {sortedBookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-blue-50">
                <td className="px-4 py-2">{new Date(booking.scheduledFor).toLocaleString()}</td>
                <td className="px-4 py-2">{booking.technicianId || "-"}</td>
                <td className="px-4 py-2">{booking.customerId || "-"}</td>
                <td className="px-4 py-2">
                  <span className={"text-xs font-bold px-2 py-1 rounded uppercase " + statusColor(booking.status)}>
                    {booking.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-2">{booking.notes || "-"}</td>
                {(canEdit || canDelete) && (
                  <td className="px-4 py-2 flex gap-2">
                    {canEdit && (
                      <button
                        className="text-blue-500 hover:underline font-medium px-1"
                        onClick={() => handleEdit(booking)}
                      >
                        <PencilIcon title={`Edit booking`} className="h-4 w-4 inline-block" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        className="text-red-500 hover:underline font-medium px-1"
                        onClick={() => handleDeleteBooking(booking)}
                      >
                        <TrashIcon title={`Remove booking`} className="h-4 w-4 inline-block" />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
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
              existing={selectedBooking}
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
          message={`Are you sure you want to delete the booking "${bookingToDelete.status}"? This action cannot be undone.`}
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
