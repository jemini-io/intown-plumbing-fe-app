import React, { useEffect, useState, Fragment } from "react";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { UserPlusIcon } from "@heroicons/react/24/solid";
import { Customer } from "@/lib/types/customer";
import { getAllCustomers, deleteCustomer } from "../actions";
import { CustomerForm } from "./CustomerForm";
import { DeleteConfirmModal } from "@/app/components/DeleteConfirmModal";
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

  // Filter state
  const [emailFilter, setEmailFilter] = useState<string>("");
  const [phoneFilter, setPhoneFilter] = useState<string>("");

  // Unique values for filters
  const uniqueEmails = Array.from(new Set((allCustomers || []).map(c => c.emailAddress?.address || "").filter(Boolean)));
  const uniquePhones = Array.from(new Set((allCustomers || []).map(c => 
    c.phoneNumber ? `+${c.phoneNumber.countryCode} ${c.phoneNumber.number}` : ""
  ).filter(Boolean)));

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
      deleteCustomer(String(customerToDelete.id)).then(() => {
        setDeleting(false);
        refresh();
        setConfirmOpen(false);
        setCustomerToDelete(null);
      });
    }
  };

  // Filter customers - support both exact filter and query-based filtering
  const filteredCustomers = allCustomers.filter(c => {
    const customerEmail = c.emailAddress?.address || "";
    const customerPhone = c.phoneNumber ? `+${c.phoneNumber.countryCode} ${c.phoneNumber.number}` : "";
    
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
    
    return emailMatch && phoneMatch;
  });

  const customersToRender = limit ? filteredCustomers.slice(0, limit) : filteredCustomers;

  // Configuración de columnas
  const columnsConfig = [
    showImage ? "48px" : null,                // IMAGE ancho fijo
    "1fr",                                   // NAME flexible
    showType ? "minmax(100px, max-content)" : null, // TYPE mínimo
    showEmail ? "1fr" : null,                 // EMAIL flexible
    showPhone ? "1fr" : null,                 // PHONE flexible
    showActions ? "100px" : null,             // ACTIONS ancho fijo
  ].filter(Boolean);

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: columnsConfig.join(" "),
    gap: "2.5rem", // más espacio entre columnas
    alignItems: "center",
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Customers</h2>
        <button
          className="p-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition"
          title="Add new customer"
          onClick={handleAdd}
        >
          <UserPlusIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Header row */}
      <div style={gridStyle} className="px-2 py-2 text-xs font-semibold tracking-wide text-gray-500 border-b">
        {showImage && <div className="text-left uppercase">Image</div>}
        <div className="text-left uppercase">Name</div>
        {showType && <div className="text-center uppercase">Type</div>}
        {showEmail && (
          <div className="text-left">
            <span className="flex items-center gap-2">
              <span>Email</span>
              <Combobox value={emailFilter} onChange={(value) => {
                setEmailFilter(value || "");
                setEmailQuery(""); // Clear query when selecting from dropdown
              }} as="div" className="flex-1">
                <div className="relative">
                  <Combobox.Input
                    className="border rounded text-xs ml-2 w-full"
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
                    <Combobox.Options className="absolute left-0 mt-1 z-50 bg-white border rounded shadow max-h-40 overflow-auto text-xs w-full">
                      <Combobox.Option value="">
                        All
                      </Combobox.Option>
                      {filteredEmails.map((email) => (
                        <Combobox.Option key={email} value={email} as={Fragment}>
                          {({ active, selected }) => (
                            <li
                              className={`px-2 py-1 cursor-pointer ${active ? "bg-blue-100" : ""} ${selected ? "font-bold" : ""}`}
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
                    className="border rounded text-xs ml-2"
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
                    <Combobox.Options className="absolute left-0 mt-1 z-50 bg-white border rounded shadow max-h-40 overflow-auto text-xs w-full">
                      <Combobox.Option value="">
                        All
                      </Combobox.Option>
                      {filteredPhones.map((phone) => (
                        <Combobox.Option key={phone} value={phone} as={Fragment}>
                          {({ active, selected }) => (
                            <li
                              className={`px-2 py-1 cursor-pointer ${active ? "bg-blue-100" : ""} ${selected ? "font-bold" : ""}`}
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
        {showActions && <div className="text-center uppercase">Actions</div>}
      </div>

      <ul>
        {customersToRender.map(customer => (
          <li
            key={customer.customerId}
            style={gridStyle}
            className="px-2 py-3 border-b last:border-b-0 hover:bg-blue-50"
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
                    <UserCircleIcon className="text-gray-700 h-7 w-7" />
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
              <span className="font-medium">{customer.name}</span>
            </div>
            {showType && (
              <div className="flex justify-center">
                <span className="text-sm text-gray-700">
                  {customer.type}
                </span>
              </div>
            )}
            {showEmail && (
              <div className="flex">
                <span className="text-sm text-gray-600">
                  {customer.emailAddress?.address || "—"}
                </span>
              </div>
            )}
            {showPhone && (
              <div className="flex">
                <span className="text-sm text-gray-600">
                  {customer.phoneNumber 
                    ? `+${customer.phoneNumber.countryCode} ${customer.phoneNumber.number}`
                    : "—"}
                </span>
              </div>
            )}
            {showActions && (
              <div className="flex items-center justify-end gap-1 text-right pl-2">
                <button
                  className="px-1 py-0 rounded hover:bg-gray-100 transition h-6 flex items-center"
                  title="Edit"
                  onClick={() => handleEdit(customer)}
                >
                  <span className="text-xs font-semibold text-blue-600">EDIT</span>
                </button>
                <button
                  className="px-1 py-0 rounded hover:bg-gray-100 transition h-6 flex items-center"
                  title="Remove"
                  onClick={() => handleDeleteCustomer(customer)}
                >
                  <span className="text-xs font-semibold text-red-600 hover:text-red-800">REMOVE</span>
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-[700px] overflow-auto relative" style={{ minWidth: 400, maxHeight: "90vh" }}>
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold"
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
            if (!deleting) setConfirmOpen(false);
          }}
          onConfirm={confirmDelete}
          loading={deleting}
        />
      )}
    </>
  );
}
