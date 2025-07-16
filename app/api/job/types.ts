export interface Job {
    name: string;
    startTime: string;
    endTime: string;
    technicianId: string;
    jobTypeId: number;
    summary: string;
}

export interface Location {
    street: string;
    unit: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}

export interface Customer {
    name: string;
    email: string;
    phone: string;
    // Bill To Address fields
    billToStreet?: string;
    billToUnit?: string;
    billToCity?: string;
    billToState?: string;
    billToZip?: string;
    billToSameAsService?: boolean;
}