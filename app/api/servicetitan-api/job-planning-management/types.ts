
export interface JobTypesQueryParams {
  name?: string;
  minDuration?: number;
  maxDuration?: number;
  priority?: number;
  ids?: number[];
  page?: number;
  pageSize?: number;
  includeTotal?: boolean;
  active?: boolean;
  orderBy?: string;
  orderByDirection?: 'asc' | 'desc';
  createdBefore?: string; // ISO date string
  createdOnOrAfter?: string; // ISO date string
  modifiedBefore?: string; // ISO date string
  modifiedOnOrAfter?: string; // ISO date string
  externalDataApplicationGuid?: string;
}
