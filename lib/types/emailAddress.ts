import { Customer } from "./customer";

export type EmailAddress = {
  id: string;
  address: string;
  customers?: Customer[] | [];
};