"use client";

import { useTransition, useState, useRef, useEffect } from "react";
import { Customer } from "@/lib/types/customer";
import Image from "next/image";
import { UserCircleIcon, TrashIcon } from "@heroicons/react/24/outline";
import { CountryCodeSelector } from "@/app/dashboard/components/CountryCodeSelector";
import { findEmailAddressByAddress } from "@/app/dashboard/emailAddresses/actions";
import { findPhoneNumberByCountryCodeAndNumber } from "@/app/dashboard/phoneNumbers/actions";

type CustomerFormProps = {
  existing?: Customer;
  onSaved: () => void;
  title?: string;
};

export function CustomerForm({ existing, onSaved, title }: CustomerFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    existing?.image?.url ?? null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [countryCode, setCountryCode] = useState<string>(
    existing?.phoneNumber?.countryCode ?? "1"
  );
  const [emailAddress, setEmailAddress] = useState<string>(
    existing?.emailAddress?.address ?? ""
  );
  const [phoneNumber, setPhoneNumber] = useState<string>(
    existing?.phoneNumber?.number ?? ""
  );
  const [emailCustomersCount, setEmailCustomersCount] = useState<number | null>(null);
  const [phoneCustomersCount, setPhoneCustomersCount] = useState<number | null>(null);
  const [isEmailUsedByCurrentCustomer, setIsEmailUsedByCurrentCustomer] = useState(false);
  const [isPhoneUsedByCurrentCustomer, setIsPhoneUsedByCurrentCustomer] = useState(false);
  const [emailCustomers, setEmailCustomers] = useState<Customer[]>([]);
  const [phoneCustomers, setPhoneCustomers] = useState<Customer[]>([]);
  const [showEmailCustomersList, setShowEmailCustomersList] = useState(false);
  const [showPhoneCustomersList, setShowPhoneCustomersList] = useState(false);
  const emailListRef = useRef<HTMLDivElement>(null);
  const phoneListRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImagePreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [imageFile]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emailListRef.current && !emailListRef.current.contains(event.target as Node)) {
        setShowEmailCustomersList(false);
      }
      if (phoneListRef.current && !phoneListRef.current.contains(event.target as Node)) {
        setShowPhoneCustomersList(false);
      }
    }

    if (showEmailCustomersList || showPhoneCustomersList) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmailCustomersList, showPhoneCustomersList]);

  // Check email address usage when it changes
  useEffect(() => {
    const checkEmailUsage = async () => {
      const trimmedEmail = emailAddress?.trim();
      if (!trimmedEmail) {
        setEmailCustomersCount(null);
        return;
      }

      // Basic email validation before making the API call
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        setEmailCustomersCount(null);
        return;
      }

      try {
        const emailData = await findEmailAddressByAddress(trimmedEmail);
        if (emailData) {
          const allCustomers = (emailData.customers || []) as unknown as Customer[];
          const count = allCustomers.length;
          // If editing existing customer and this customer uses this email, subtract 1
          const isCurrentCustomerUsingThisEmail = existing?.emailAddress?.id === emailData.id;
          setIsEmailUsedByCurrentCustomer(isCurrentCustomerUsingThisEmail);
          
          // Filter out current customer from the list if editing
          const otherCustomers = isCurrentCustomerUsingThisEmail && existing?.id
            ? allCustomers.filter(c => c.id !== existing.id)
            : allCustomers;
          setEmailCustomers(otherCustomers);
          
          const adjustedCount = isCurrentCustomerUsingThisEmail 
            ? Math.max(0, count - 1) 
            : count;
          setEmailCustomersCount(adjustedCount);
        } else {
          setEmailCustomersCount(0);
          setIsEmailUsedByCurrentCustomer(false);
          setEmailCustomers([]);
        }
      } catch {
        // If validation fails or email doesn't exist, set to 0
        setEmailCustomersCount(0);
        setIsEmailUsedByCurrentCustomer(false);
        setEmailCustomers([]);
      }
    };

    const timeoutId = setTimeout(checkEmailUsage, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [emailAddress, existing?.emailAddress?.id, existing?.id]);

  // Check phone number usage when it changes
  useEffect(() => {
    const checkPhoneUsage = async () => {
      if (phoneNumber && phoneNumber.trim() && countryCode) {
        try {
          const phoneData = await findPhoneNumberByCountryCodeAndNumber(
            countryCode,
            phoneNumber.trim()
          );
          if (phoneData) {
            const allCustomers = (phoneData.customers || []) as unknown as Customer[];
            const count = allCustomers.length;
            // If editing existing customer, subtract 1 if this customer uses this phone
            const isSamePhone = existing?.phoneNumber?.countryCode === phoneData.countryCode &&
                                existing?.phoneNumber?.number === phoneData.number;
            setIsPhoneUsedByCurrentCustomer(isSamePhone);
            
            // Filter out current customer from the list if editing
            const otherCustomers = isSamePhone && existing?.id
              ? allCustomers.filter(c => c.id !== existing.id)
              : allCustomers;
            setPhoneCustomers(otherCustomers);
            
            const adjustedCount = isSamePhone 
              ? Math.max(0, count - 1) 
              : count;
            setPhoneCustomersCount(adjustedCount);
          } else {
            setPhoneCustomersCount(0);
            setIsPhoneUsedByCurrentCustomer(false);
            setPhoneCustomers([]);
          }
        } catch {
          // If search fails, set to 0 (phone doesn't exist)
          setPhoneCustomersCount(0);
        }
      } else {
        setPhoneCustomersCount(null);
      }
    };

    const timeoutId = setTimeout(checkPhoneUsage, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [phoneNumber, countryCode, existing?.phoneNumber?.countryCode, existing?.phoneNumber?.number, existing?.id]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
      setRemoveImage(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      const formData = new FormData(formRef.current!);

      if (imageFile) {
        formData.set("image", imageFile);
      }
      if (removeImage) {
        formData.set("removeImage", "true");
      }

      try {
        let response;
        if (existing?.id) {
          formData.set("id", existing.id);
          response = await fetch("/api/customers/update", {
            method: "POST",
            body: formData,
          });
        } else {
          response = await fetch("/api/customers/create", {
            method: "POST",
            body: formData,
          });
        }

        const result = await response.json();
        if (response.ok) {
          setMessage({
            type: "success",
            text: existing ? "Customer updated successfully!" : "Customer created successfully!",
          });
          if (!existing) {
            formRef.current?.reset();
            setImagePreview(null);
            setImageFile(null);
          }

          setTimeout(() => {
            setMessage(null);
            onSaved();
          }, 1500);
        } else {
          setMessage({ type: "error", text: result.error || "Something went wrong. Please try again." });
        }
      } catch {
        setMessage({ type: "error", text: "Something went wrong. Please try again." });
      }
    });
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-center dark:text-white">
        {title ?? (existing ? `Edit customer ${existing.name}` : "Add new customer")}
      </h2>
      {message && (
        <div className={`mb-4 text-center text-base font-medium transition-all
          ${message.type === "success" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
          {message.text}
        </div>
      )}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="grid grid-cols-2 gap-4 items-start"
      >
        {/* Customer ID (ServiceTitan) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer ID (ServiceTitan)</label>
          <input
            type="number"
            name="customerId"
            defaultValue={existing?.customerId ?? ""}
            className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2 disabled:bg-gray-100 dark:disabled:bg-gray-800"
            required
            disabled={!!existing}
          />
          {existing && (
            <input
              type="hidden"
              name="customerId"
              value={existing.customerId}
            />
          )}
        </div>
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
          <input
            type="text"
            name="name"
            defaultValue={existing?.name ?? ""}
            className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2"
            required
          />
        </div>
        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
          <select
            name="type"
            defaultValue={existing?.type ?? "RESIDENTIAL"}
            className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2"
            required
          >
            <option value="RESIDENTIAL">RESIDENTIAL</option>
            <option value="COMMERCIAL">COMMERCIAL</option>
          </select>
        </div>
        {/* Email Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
          <input
            type="email"
            name="emailAddress"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2"
            placeholder="user@example.com"
          />
          {emailCustomersCount !== null && (
            <div className="relative" ref={emailListRef}>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {isEmailUsedByCurrentCustomer
                  ? emailCustomersCount === 0
                    ? "This email address is used by this customer only"
                    : (
                        <span>
                          This email address is used by{" "}
                          <button
                            type="button"
                            onClick={() => setShowEmailCustomersList(!showEmailCustomersList)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
                          >
                            {emailCustomersCount} more customer{emailCustomersCount !== 1 ? 's' : ''}
                          </button>
                        </span>
                      )
                  : emailCustomersCount > 0
                    ? (
                        <span>
                          This email address is used by{" "}
                          <button
                            type="button"
                            onClick={() => setShowEmailCustomersList(!showEmailCustomersList)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
                          >
                            {emailCustomersCount} more customer{emailCustomersCount !== 1 ? 's' : ''}
                          </button>
                        </span>
                      )
                    : "This email address is not in use by any other customer"}
              </p>
              {showEmailCustomersList && emailCustomers.length > 0 && (
                <div className="absolute z-50 mt-2 left-0 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg p-2 min-w-[200px] max-w-[300px]">
                  <div className="text-xs font-semibold text-gray-700 dark:text-white mb-2">Customers using this email:</div>
                  <div className="space-y-2 max-h-60 overflow-auto">
                    {emailCustomers.map((customer) => (
                      <div key={customer.id} className="flex items-center gap-2">
                        {customer.image?.url ? (
                          <Image
                            src={customer.image.url}
                            alt={customer.name}
                            width={24}
                            height={24}
                            className="rounded-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <UserCircleIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                        )}
                        <span className="text-xs text-gray-700 dark:text-gray-300">{customer.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        {/* Phone Country Code and Number */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
          <div className="flex gap-2">
            <div className="w-32">
              <CountryCodeSelector
                value={countryCode}
                onChange={setCountryCode}
                name="phoneCountryCode"
              />
            </div>
            <div className="flex-1">
              <input
                type="tel"
                name="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2"
                placeholder="4697300194"
                pattern="[0-9]+"
              />
              {phoneCustomersCount !== null && (
                <div className="relative" ref={phoneListRef}>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {isPhoneUsedByCurrentCustomer
                      ? phoneCustomersCount === 0
                        ? "This phone number is used by this customer only"
                        : (
                            <span>
                              This phone number is used by{" "}
                              <button
                                type="button"
                                onClick={() => setShowPhoneCustomersList(!showPhoneCustomersList)}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
                              >
                                {phoneCustomersCount} more customer{phoneCustomersCount !== 1 ? 's' : ''}
                              </button>
                            </span>
                          )
                      : phoneCustomersCount > 0
                        ? (
                            <span>
                              This phone number is used by{" "}
                              <button
                                type="button"
                                onClick={() => setShowPhoneCustomersList(!showPhoneCustomersList)}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
                              >
                                {phoneCustomersCount} more customer{phoneCustomersCount !== 1 ? 's' : ''}
                              </button>
                            </span>
                          )
                        : "This phone number is not in use by any other customer"}
                  </p>
                  {showPhoneCustomersList && phoneCustomers.length > 0 && (
                    <div className="absolute z-50 mt-2 left-0 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg p-2 min-w-[200px] max-w-[300px]">
                      <div className="text-xs font-semibold text-gray-700 dark:text-white mb-2">Customers using this phone:</div>
                      <div className="space-y-2 max-h-60 overflow-auto">
                        {phoneCustomers.map((customer) => (
                          <div key={customer.id} className="flex items-center gap-2">
                            {customer.image?.url ? (
                              <Image
                                src={customer.image.url}
                                alt={customer.name}
                                width={24}
                                height={24}
                                className="rounded-full object-cover"
                                unoptimized
                              />
                            ) : (
                              <UserCircleIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                            )}
                            <span className="text-xs text-gray-700 dark:text-gray-300">{customer.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image</label>
        </div>
        {/* Pic Preview | Upload input */}
        <div className="col-span-2 flex items-center gap-6">
          {/* Preview */}
          <div className="relative">
            {imagePreview ? (
              <>
                <Image
                  src={imagePreview}
                  alt="Customer image"
                  width={100}
                  height={100}
                  className="rounded-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setImageFile(null);
                    setRemoveImage(true);
                  }}
                  className="absolute -top-2 -right-2 bg-white dark:bg-gray-700 rounded-full p-1 shadow hover:bg-red-100 dark:hover:bg-red-900/30"
                  title="Remove image"
                >
                  <TrashIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                </button>
              </>
            ) : (
              <div className="h-16 w-16 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 border dark:border-gray-600">
                <UserCircleIcon className="h-8 w-8 text-gray-500 dark:text-gray-400" />
              </div>
            )}
          </div>
          {/* Upload input */}
          <input
            type="file"
            name="picture"
            accept="image/*"
            onChange={handleImageChange}
            className="block text-sm text-gray-500 dark:text-gray-400
              file:mr-2 file:py-1 file:px-2
              file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-400
              hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50"
          />
        </div>
        <div className="col-span-2 flex justify-center mt-2">
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 dark:bg-white hover:bg-blue-700 dark:hover:bg-gray-200 text-white dark:text-gray-900 py-2 rounded-md font-medium shadow-md transition disabled:bg-blue-300 dark:disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isPending ? "Saving..." : existing ? "Update" : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
}

