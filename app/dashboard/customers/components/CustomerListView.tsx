import React, { useEffect, useState, Fragment } from "react";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { UserPlusIcon } from "@heroicons/react/24/solid";
import { Customer } from "@/lib/types/customer";
import { getAllCustomers, deleteCustomer, deleteCustomerAndTheirBookings } from "../actions";
import { CustomerForm } from "./CustomerForm";
import { DeleteConfirmModal } from "@/app/components/DeleteConfirmModal";
import { ErrorModal } from "@/app/components/ErrorModal";
import { Combobox } from "@headlessui/react";
import Image from "next/image";

export interface CustomerListViewProps {
  limit?: number;
  showImage?: boolean;
  showType?: boolean;
  showEmail?: boolean;
  showPhone?: boolean;
  showActions?: boolean;
}

export function CustomerListView({
  limit,
  showImage = true,
  showType = true,
  showEmail = true,
  showPhone = true,
  showActions = true,
}: CustomerListViewProps) {

  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deletingWithBookings, setDeletingWithBookings] = useState(false);
  const [hoveredCustomerId, setHoveredCustomerId] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);

  // Filter state
  const [nameFilter, setNameFilter] = useState<string>("");
  const [emailFilter, setEmailFilter] = useState<string>("");
  const [phoneFilter, setPhoneFilter] = useState<string>("");

  // Unique values for filters
  const uniqueNames = Array.from(new Set((allCustomers || []).map(c => c.name).filter(Boolean)));
  const uniqueEmails = Array.from(new Set((allCustomers || []).map(c => c.emailAddress?.address || "").filter(Boolean)));
  const uniquePhones = Array.from(new Set((allCustomers || []).map(c => 
    c.phoneNumber ? `+${c.phoneNumber.countryCode} ${c.phoneNumber.number}` : ""
  ).filter(Boolean)));

  // Name filter state
  const [nameQuery, setNameQuery] = useState("");
  const [openName, setOpenName] = useState(false);
  const filteredNames = nameQuery === ""
    ? uniqueNames
    : uniqueNames.filter((name) =>
        name.toLowerCase().includes(nameQuery.toLowerCase())
      );

  // Email filter state
  const [emailQuery, setEmailQuery] = useState("");
  const [openEmail, setOpenEmail] = useState(false);
  const filteredEmails = emailQuery === ""
    ? uniqueEmails
    : uniqueEmails.filter((email) =>
        email.toLowerCase().includes(emailQuery.toLowerCase())
      );

  // Phone filter state
  const [phoneQuery, setPhoneQuery] = useState("");
  const [openPhone, setOpenPhone] = useState(false);
  const filteredPhones = phoneQuery === ""
    ? uniquePhones
    : uniquePhones.filter((phone) =>
        phone.toLowerCase().includes(phoneQuery.toLowerCase())
      );

  async function refresh() {
    const customers: Customer[] = await getAllCustomers();
    setAllCustomers(customers);
  }

  useEffect(() => {
    refresh();
  }, []);

  function handleAdd() {
    setSelectedCustomer(undefined);
    setModalOpen(true);
  }

  function handleEdit(customer: Customer) {
    setSelectedCustomer(customer);
    setModalOpen(true);
  }

  function handleDeleteCustomer(customer: Customer) {
    setCustomerToDelete(customer);
    setConfirmOpen(true);
  }

  const confirmDelete = () => {
    if (customerToDelete) {
      setDeleting(true);
      deleteCustomer(String(customerToDelete.id))
        .then(() => {
          setDeleting(false);
          refresh();
          setConfirmOpen(false);
          setCustomerToDelete(null);
        })
        .catch((error) => {
          setDeleting(false);
          setConfirmOpen(false);
          setErrorMessage(error.message || "Failed to delete customer. Please try again.");
          setErrorOpen(true);
        });
    }
  };

  // Filter customers - support both exact filter and query-based filtering
  const filteredCustomers = allCustomers.filter(c => {
    const customerName = c.name || "";
    const customerEmail = c.emailAddress?.address || "";
    const customerPhone = c.phoneNumber ? `+${c.phoneNumber.countryCode} ${c.phoneNumber.number}` : "";
    
    // Name filter: if nameFilter is set (from dropdown selection), use exact match
    // Otherwise, if nameQuery is set (from typing), use partial match
    let nameMatch = true;
    if (nameFilter && nameFilter !== "") {
      // Exact match when filter is selected from dropdown
      nameMatch = customerName === nameFilter;
    } else if (nameQuery && nameQuery !== "") {
      // Partial match when typing
      nameMatch = customerName.toLowerCase().includes(nameQuery.toLowerCase());
    }
    
    // Email filter: if emailFilter is set (from dropdown selection), use exact match
    // Otherwise, if emailQuery is set (from typing), use partial match
    let emailMatch = true;
    if (emailFilter && emailFilter !== "") {
      // Exact match when filter is selected from dropdown
      emailMatch = customerEmail === emailFilter;
    } else if (emailQuery && emailQuery !== "") {
      // Partial match when typing
      emailMatch = customerEmail.toLowerCase().includes(emailQuery.toLowerCase());
    }
    
    // Phone filter: if phoneFilter is set (from dropdown selection), use exact match
    // Otherwise, if phoneQuery is set (from typing), use partial match
    let phoneMatch = true;
    if (phoneFilter && phoneFilter !== "") {
      // Exact match when filter is selected from dropdown
      phoneMatch = customerPhone === phoneFilter;
    } else if (phoneQuery && phoneQuery !== "") {
      // Partial match when typing
      phoneMatch = customerPhone.toLowerCase().includes(phoneQuery.toLowerCase());
    }
    
    return nameMatch && emailMatch && phoneMatch;
  });

  const customersToRender = limit ? filteredCustomers.slice(0, limit) : filteredCustomers;

  const columnsConfig = [
    showImage ? "48px" : null,
    "1fr",
    showType ? "minmax(100px, max-content)" : null,
    showEmail ? "1fr" : null,
    showPhone ? "1fr" : null,
    "minmax(120px, max-content)", // Number of Bookings
    showActions ? "100px" : null,
  ].filter(Boolean);

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: columnsConfig.join(" "),
    gap: "2.5rem",
    alignItems: "center",
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold dark:text-white">Customers</h2>
        <button
          className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 transition"
          title="Add new customer"
          onClick={handleAdd}
        >
          <UserPlusIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Header row */}
      <div style={gridStyle} className="px-2 py-2 text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
        {showImage && <div className="text-left uppercase">Image</div>}
        <div className="text-left">
          <span className="flex items-center gap-2">
            <span>Name</span>
            <Combobox value={nameFilter} onChange={(value) => {
              setNameFilter(value || "");
              setNameQuery(""); // Clear query when selecting from dropdown
            }} as="div" className="flex-1">
              <div className="relative">
                <Combobox.Input
                  className="border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs ml-2 w-full"
                  placeholder="Name"
                  onChange={e => {
                    const value = e.target.value;
                    setNameQuery(value);
                    // Clear filter when typing to allow query-based filtering
                    if (value !== nameFilter) {
                      setNameFilter("");
                    }
                  }}
                  displayValue={(val: string) => {
                    if (val && val !== "") return val;
                    if (nameQuery && nameQuery !== "") return nameQuery;
                    return "All";
                  }}
                  onFocus={() => setOpenName(true)}
                  onBlur={() => setTimeout(() => setOpenName(false), 100)}
                />
                {openName && (
                  <Combobox.Options className="absolute left-0 mt-1 z-50 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded shadow max-h-40 overflow-auto text-xs w-full">
                    <Combobox.Option value="">
                      All
                    </Combobox.Option>
                    {filteredNames.map((name) => (
                      <Combobox.Option key={name} value={name} as={Fragment}>
                        {({ active, selected }) => (
                          <li
                            className={`px-2 py-1 cursor-pointer dark:text-white ${active ? "bg-blue-100 dark:bg-gray-700" : ""} ${selected ? "font-bold" : ""}`}
                          >
                            {name}
                          </li>
                        )}
                      </Combobox.Option>
                    ))}
                  </Combobox.Options>
                )}
              </div>
            </Combobox>
          </span>
        </div>
        {showType && <div className="text-center uppercase">Type</div>}
        {showEmail && (
          <div className="text-left">
            <span className="flex items-center gap-2">
              <span>Email Address</span>
              <Combobox value={emailFilter} onChange={(value) => {
                setEmailFilter(value || "");
                setEmailQuery(""); // Clear query when selecting from dropdown
              }} as="div" className="flex-1">
                <div className="relative">
                  <Combobox.Input
                    className="border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs ml-2 w-full"
                    placeholder="Email"
                    onChange={e => {
                      const value = e.target.value;
                      setEmailQuery(value);
                      // Clear filter when typing to allow query-based filtering
                      if (value !== emailFilter) {
                        setEmailFilter("");
                      }
                    }}
                    displayValue={(val: string) => {
                      if (val && val !== "") return val;
                      if (emailQuery && emailQuery !== "") return emailQuery;
                      return "All";
                    }}
                    onFocus={() => setOpenEmail(true)}
                    onBlur={() => setTimeout(() => setOpenEmail(false), 100)}
                  />
                  {openEmail && (
                    <Combobox.Options className="absolute left-0 mt-1 z-50 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded shadow max-h-40 overflow-auto text-xs w-full">
                      <Combobox.Option value="">
                        All
                      </Combobox.Option>
                      {filteredEmails.map((email) => (
                        <Combobox.Option key={email} value={email} as={Fragment}>
                          {({ active, selected }) => (
                            <li
                              className={`px-2 py-1 cursor-pointer dark:text-white ${active ? "bg-blue-100 dark:bg-gray-700" : ""} ${selected ? "font-bold" : ""}`}
                            >
                              {email}
                            </li>
                          )}
                        </Combobox.Option>
                      ))}
                    </Combobox.Options>
                  )}
                </div>
              </Combobox>
            </span>
          </div>
        )}
        {showPhone && (
          <div className="text-left">
            <span className="flex items-center gap-2">
              <span>Phone</span>
              <Combobox value={phoneFilter} onChange={(value) => {
                setPhoneFilter(value || "");
                setPhoneQuery(""); // Clear query when selecting from dropdown
              }} as="div">
                <div className="relative">
                  <Combobox.Input
                    className="border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs ml-2"
                    placeholder="Phone"
                    onChange={e => {
                      const value = e.target.value;
                      setPhoneQuery(value);
                      // Clear filter when typing to allow query-based filtering
                      if (value !== phoneFilter) {
                        setPhoneFilter("");
                      }
                    }}
                    displayValue={(val: string) => {
                      if (val && val !== "") return val;
                      if (phoneQuery && phoneQuery !== "") return phoneQuery;
                      return "All";
                    }}
                    style={{ minWidth: 0, width: "180px" }}
                    onFocus={() => setOpenPhone(true)}
                    onBlur={() => setTimeout(() => setOpenPhone(false), 100)}
                  />
                  {openPhone && (
                    <Combobox.Options className="absolute left-0 mt-1 z-50 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded shadow max-h-40 overflow-auto text-xs w-full">
                      <Combobox.Option value="">
                        All
                      </Combobox.Option>
                      {filteredPhones.map((phone) => (
                        <Combobox.Option key={phone} value={phone} as={Fragment}>
                          {({ active, selected }) => (
                            <li
                              className={`px-2 py-1 cursor-pointer dark:text-white ${active ? "bg-blue-100 dark:bg-gray-700" : ""} ${selected ? "font-bold" : ""}`}
                            >
                              {phone}
                            </li>
                          )}
                        </Combobox.Option>
                      ))}
                    </Combobox.Options>
                  )}
                </div>
              </Combobox>
            </span>
          </div>
        )}
        <div className="text-center uppercase">Number of Bookings</div>
        {showActions && <div className="text-center uppercase">Actions</div>}
      </div>

      <ul>
        {customersToRender.map(customer => (
          <li
            key={customer.customerId}
            style={gridStyle}
            className="px-2 py-3 border-b dark:border-gray-700 last:border-b-0 hover:bg-blue-50 dark:hover:bg-gray-700 relative"
            onMouseEnter={() => setHoveredCustomerId(customer.id)}
            onMouseLeave={() => {
              setHoveredCustomerId(null);
              setMousePosition(null);
            }}
            onMouseMove={(e) => {
              if (customer.bookings && customer.bookings.length > 0) {
                setMousePosition({ x: e.clientX, y: e.clientY });
              }
            }}
          >
            {showImage && (
              <div className="flex items-center justify-start">
                {customer.image?.url ? (
                  <Image
                    src={customer.image.url}
                    alt={customer.name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full flex items-center justify-center">
                    <UserCircleIcon className="text-gray-700 dark:text-gray-400 h-7 w-7" />
                  </div>
                )}
              </div>
            )}
            <div
              className="flex text-left"
              style={{
                wordBreak: "break-word",
                whiteSpace: "normal",
                overflowWrap: "anywhere",
              }}
            >
              <span className="font-medium dark:text-white">{customer.name}</span>
            </div>
            {showType && (
              <div className="flex justify-center">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {customer.type}
                </span>
              </div>
            )}
            {showEmail && (
              <div className="flex">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {customer.emailAddress?.address || "—"}
                </span>
              </div>
            )}
            {showPhone && (
              <div className="flex">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {customer.phoneNumber 
                    ? `+${customer.phoneNumber.countryCode} ${customer.phoneNumber.number}`
                    : "—"}
                </span>
              </div>
            )}
            <div className="flex justify-center">
              <span className="text-sm text-gray-700 dark:text-white">
                {customer.bookings?.length || 0}
              </span>
            </div>
            {hoveredCustomerId === customer.id && customer.bookings && customer.bookings.length > 0 && mousePosition && (
              <div 
                className="fixed z-50 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg p-2 min-w-[250px] max-w-[400px]"
                style={{ 
                  left: `${mousePosition.x + 10}px`,
                  top: `${mousePosition.y + 10}px`,
                  pointerEvents: 'none'
                }}
              >
                <div className="text-xs font-semibold text-gray-700 dark:text-white mb-2">Bookings for {customer.name}:</div>
                <div className="space-y-2 max-h-60 overflow-auto">
                  {customer.bookings.map((booking) => (
                    <div key={booking.id} className="text-xs text-gray-700 dark:text-gray-300 border-b dark:border-gray-700 last:border-b-0 pb-2 last:pb-0">
                      <div className="font-medium dark:text-white">{booking.service?.displayName || "N/A"}</div>
                      <div className="text-gray-500 dark:text-gray-400">
                        {booking.scheduledFor ? new Date(booking.scheduledFor).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : "N/A"}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-1.5 py-0.5 rounded text-xs ${
                          booking.status === 'COMPLETED' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                          booking.status === 'SCHEDULED' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                          booking.status === 'PENDING' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                          'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        }`}>
                          {booking.status}
                        </span>
                        {booking.revenue > 0 && (
                          <span className="text-gray-600 dark:text-gray-400">${booking.revenue.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {showActions && (
              <div className="flex items-center justify-end gap-1 text-right pl-2">
                <button
                  className="px-1 py-0 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition h-6 flex items-center"
                  title="Edit"
                  onClick={() => handleEdit(customer)}
                >
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">EDIT</span>
                </button>
                <button
                  className="px-1 py-0 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition h-6 flex items-center"
                  title="Remove"
                  onClick={() => handleDeleteCustomer(customer)}
                >
                  <span className="text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">REMOVE</span>
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 w-[700px] overflow-auto relative" style={{ minWidth: 400, maxHeight: "90vh" }}>
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-2 right-2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl font-bold"
            >
              ×
            </button>
            <CustomerForm
              existing={selectedCustomer}
              onSaved={async () => {
                setModalOpen(false);
                await refresh();
              }}
            />
          </div>
        </div>
      )}

      {confirmOpen && customerToDelete && (
        <DeleteConfirmModal
          open={confirmOpen}
          title="Confirm Deletion"
          message={`Are you sure you want to delete the customer "${customerToDelete.name}"? This action cannot be undone.`}
          onCancel={() => {
            if (!deleting) {
              setConfirmOpen(false);
            }
          }}
          onConfirm={confirmDelete}
          loading={deleting}
        />
      )}

      {errorOpen && errorMessage && (
        <ErrorModal
          open={errorOpen}
          title={`Cannot Delete Customer "${customerToDelete?.name}"`}
          message={errorMessage}
          onClose={() => {
            if (!deletingWithBookings) {
              setErrorOpen(false);
              setErrorMessage(null);
            }
          }}
          secondaryAction={
            errorMessage.includes("booking") && customerToDelete
              ? (() => {
                  const bookingsCount = customerToDelete.bookings?.length || 0;
                  const isSingular = bookingsCount === 1;
                  const countText = isSingular ? '' : ` ${bookingsCount}`;
                  const bookingText = isSingular ? 'booking' : 'bookings';
                  return {
                    label: `Delete customer and their${countText} associated ${bookingText}`,
                    onClick: async () => {
                    if (customerToDelete) {
                      setDeletingWithBookings(true);
                      try {
                        await deleteCustomerAndTheirBookings(String(customerToDelete.id));
                        setDeletingWithBookings(false);
                        setErrorOpen(false);
                        setErrorMessage(null);
                        setCustomerToDelete(null);
                        await refresh();
                      } catch (error) {
                        setDeletingWithBookings(false);
                        setErrorMessage(
                          error instanceof Error
                            ? error.message
                            : "Failed to delete customer and bookings. Please try again."
                        );
                      }
                    }
                    },
                    processing: deletingWithBookings,
                    processingLabel: "Deleting...",
                  };
                })()
              : undefined
          }
        />
      )}
    </>
  );
}
