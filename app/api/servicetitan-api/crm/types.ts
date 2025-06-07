export interface NewCustomer {
  name: string;
  type: "Residential" | "Commercial";
  doNotMail: boolean;
  doNotService: boolean;
  locations: Location[];
  address: Address;
}

export interface Location {
  name: string;
  address: Address;
  contacts: Contact[];
}

export interface Address {
  street: string;
  unit: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Contact {
  type: "Phone" | "Email";
  value: string;
  memo: string | null;
}

export interface CustomerResponse {
  id: number;
  active: boolean;
  name: string;
  type: "Residential" | "Commercial";
  address: Address;
  customFields: CustomField[];
  balance: number;
  tagTypeIds: number[];
  doNotMail: boolean;
  doNotService: boolean;
  createdOn: string;
  createdById: number;
  modifiedOn: string;
  mergedToId: number | null;
  externalData: ExternalData[];
  locations: Location[];
  contacts: Contact[];
}

export interface CustomField {
  name: string;
  value: string;
}

export interface ExternalData {
  name: string;
  value: string;
}
