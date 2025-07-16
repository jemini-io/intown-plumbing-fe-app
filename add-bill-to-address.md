# Feature: Add Bill To Address and Personal Address to Video Consultation Form

This document describes how to update the video consultation form to capture and store three addresses: **Service Address**, **Billing Address**, and **Personal Address**. It also details how to map these addresses to ServiceTitan using the generated SDK.

---

## 1. Form Changes (`ContactStep.tsx`)

### **Add New Address Sections**
- **Billing Address**: New section for the customer's billing address.
- **Personal Address**: New section for the customer's personal address.
- **Checkbox**: "Personal Address same as Billing Address" — when checked, the personal address fields are hidden and the billing address is used for both.

### **UI/UX Requirements**
- Show/hide the personal address section based on the checkbox.
- All three addresses must be captured in the form state.

---

## 2. State Management (`useFormStore.ts`)

### **Update Form State**
Add the following fields to the form store:
- `billingStreet`, `billingUnit`, `billingCity`, `billingState`, `billingZip`, `billingCountry`
- `personalStreet`, `personalUnit`, `personalCity`, `personalState`, `personalZip`, `personalCountry`
- `personalSameAsBilling` (boolean)

Update all relevant types and initial state.

---

## 3. Data Flow and Backend Integration

### **Action Update (`createJobAction.ts`)**
- Accept and forward the new address fields from the form.
- Pass the correct addresses to the backend:
  - **Service Address** → Job Service Location
  - **Billing Address** → Customer's main address
  - **Personal Address** → Additional Customer Location (if not same as billing)

### **API Update (`createJob.ts`)**
- When creating the customer, use the **Billing Address** for the main address.
- Add the **Personal Address** as an additional location for the customer (if not same as billing).
- Use the **Service Address** for the job's service location.

#### **Example: Customer Creation**
```ts
const customerData: Crm_V2_Customers_CreateCustomerRequest = {
  name,
  address: {
    street: billingStreet,
    unit: billingUnit,
    city: billingCity,
    state: billingState,
    zip: billingZip,
    country: billingCountry,
  },
  locations: [
    {
      name: `${name} Service Address`,
      address: {
        street: street, // Service Address
        unit,
        city,
        state,
        zip,
        country,
      },
      // ...contacts
    },
    !personalSameAsBilling && {
      name: `${name} Personal Address`,
      address: {
        street: personalStreet,
        unit: personalUnit,
        city: personalCity,
        state: personalState,
        zip: personalZip,
        country: personalCountry,
      },
      // ...contacts
    }
  ].filter(Boolean),
  // ...contacts
}
```

---

## 4. Types

To support the new address fields, you need to update or create type definitions in your project. This ensures type safety across the form, store, and backend API calls.

### **Files to Update**

| File Path                                             | What to Update/Add                                 |
|-------------------------------------------------------|----------------------------------------------------|
| `app/(routes)/video-consultation-form/types.ts`       | Main form data interface/type (add new address fields and checkbox) |
| `app/(routes)/video-consultation-form/useFormStore.ts`| Store state and setter logic (add new fields)      |
| `app/actions/createJobAction.ts`                      | `CreateJobData` interface and function signature (add new fields)   |
| `app/api/job/types.ts`                                | Job/customer/location types (if custom types are used)              |

Update all relevant types/interfaces for form data and API payloads to include the new address fields.

---

## 5. ServiceTitan API Coverage

- **Customer Creation**: The generated ServiceTitan API supports multiple locations and a main address.
- **Job Creation**: The job can be assigned to a specific location (service address).
- If you need to update a customer after creation to add a location, ensure the generated SDK supports it (e.g., `customersUpdate` or `locationsCreate`). If you cannot find it in the SDK, stub the method and document what's not implemented in this document.

---

## 6. Address Mapping Table

| Address Type      | Form Section      | ServiceTitan Usage                |
|-------------------|------------------|-----------------------------------|
| Service Address   | Service Address  | Job Service Location, Customer Location[0] |
| Billing Address   | Billing Address  | Customer Main Address             |
| Personal Address  | Personal Address | Customer Location[1] (if not same as billing) |

---

## 7. Steps to Implement

1. **Update the form UI** to include all three address sections and the checkbox.
2. **Update the form store** to capture all new fields.
3. **Update the backend action and API** to pass and use the new fields.
4. **Test ServiceTitan API calls** for customer creation with multiple locations.
5. **If any ServiceTitan API is missing**, note it and update the SDK as needed.

---

## 8. Best Practices

- Use the generated ServiceTitan SDK for all API calls.
- Keep all address logic and mapping explicit and well-documented.
- Validate all address fields on the frontend before submission.
- Ensure the UI/UX is clear for users entering multiple addresses.

---

**Questions?**  

If you run into any missing ServiceTitan API methods, document the gap and update the SDK generator as needed. 
