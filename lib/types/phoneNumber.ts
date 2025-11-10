import { Customer } from "./customer";

export type PhoneNumber = {
    id: string;
    countryCode: string;
    number: string;
    customers?: Customer[] | null;
};