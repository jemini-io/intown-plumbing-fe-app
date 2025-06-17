export enum ShiftType {
    Normal = "Normal",
    OnCall = "OnCall",
    TimeOff = "TimeOff"
}

export enum ShiftRepeatType {
    Never = "Never",
    Daily = "Daily",
    Weekly = "Weekly"
}

export interface TechnicianShift {
    id: number;
    shiftType: ShiftType;
    title: string;
    note?: string;
    active: boolean;
    technicianId: number;
    start: string;
    end: string;
    timesheetCodeId?: number;
    createdOn: string;
    modifiedOn: string;
}

export interface CreateTechnicianShiftRequest {
    technicianIds: number[];
    shiftType: ShiftType;
    title: string;
    start: string;
    end: string;
    note?: string;
    timesheetCodeId?: number;
    repeatType: ShiftRepeatType;
    repeatEndDate?: string;
    repeatInterval?: number;
    shiftDays?: string;
}

export interface TechnicianShiftCreateResponse {
    created: boolean;
    technicianShifts: TechnicianShift[];
}

export interface TechnicianShiftQueryParams {
    startsOnOrAfter?: string;
    endsOnOrBefore?: string;
    shiftType?: ShiftType;
    technicianId?: number;
    titleContains?: string;
    noteContains?: string;
    page?: number;
    pageSize?: number;
    includeTotal?: boolean;
    active?: boolean;
    createdBefore?: string;
    createdOnOrAfter?: string;
    modifiedBefore?: string;
    modifiedOnOrAfter?: string;
    sort?: string;
}