import { IFlights } from "../flights/flights.interface";
import { IUser } from "../user/user.interface";

export type IBooking = {
  user: IUser["_id"];
  flight_info: IFlights["_id"];
  number_of_seats: number;
  seats: string[];
  total_price: number;
  booking_status: "CONFIRMED" | "CANCELLED";
  address: string;
};
