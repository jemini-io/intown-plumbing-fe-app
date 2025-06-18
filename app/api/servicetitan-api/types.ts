export interface ServiceTitanQueryResponse<T> {
    page: number;
    pageSize: number;
    hasMore: boolean;
    totalCount: number | null;
    data: T[];
}

export interface Appointment {
    id: number;
    jobId: number;
    appointmentNumber: string;
    start: string;
    end: string;
    arrivalWindowStart: string;
    arrivalWindowEnd: string;
    status: string;
    specialInstructions: string;
    createdOn: string;
    modifiedOn: string;
    customerId: number;
    unused: boolean;
    createdById: number;
    isConfirmed: boolean;
}

export interface JobType {
    id: number;
    name: string;
    businessUnitIds: number[];
    skills: string[];
    tagTypeIds: number[];
    priority: string;
    duration: number;
    soldThreshold: number;
    class: string;
    summary: string;
    noCharge: boolean;
    enforceRecurringServiceEventSelection: boolean;
    invoiceSignaturesRequired: boolean;
    modifiedOn: string;
    createdOn: string;
    externalData: {
        key: string;
        value: string;
    }[];
    active: boolean;
}

// ServiceTitan Job Update Types
export interface ServiceTitanCustomFieldModel {
  typeId: number;
  value?: string | null;
}

export interface ServiceTitanUpdateJobRequest {
  customerId?: number;
  locationId?: number;
  businessUnitId?: number;
  jobTypeId?: number;
  priority?: string;
  campaignId?: number;
  summary?: string;
  shouldUpdateInvoiceItems?: boolean;
  customFields?: ServiceTitanCustomFieldModel[];
  tagTypeIds?: number[];
  customerPo?: string;
  soldById?: number | null;
}
