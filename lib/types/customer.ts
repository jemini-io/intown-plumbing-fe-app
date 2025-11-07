import { PhoneNumber } from "./phoneNumber";
import { EmailAddress } from "./emailAddress";
import { Booking } from "./booking";
import { UserImage } from "@/app/dashboard/users/types";

export type CustomerType = "RESIDENTIAL" | "COMMERCIAL";

export type Customer = {
  id: string;
  customerId: number;
  name: string;
  type: CustomerType;
  emailAddress: EmailAddress | null;
  phoneNumber: PhoneNumber | null;
  bookings: Booking[] | [];
  image?: UserImage | null;
};