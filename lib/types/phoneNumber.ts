import { Customer } from "./customer";

export type PhoneNumber = {
    countryCode: string;
    number: string;
    customers?: Customer[] | null;
};