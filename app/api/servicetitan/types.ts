export interface ServiceTitanResponse<T> {
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