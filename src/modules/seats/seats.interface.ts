import { Document } from "mongoose";
import { IFlights } from "../flights/flights.interface";

export type ISeats = {
  date: Date;
  flight_info: IFlights["_id"];
  seats: {
    seatNumber: string;
    status: "AVAILABLE" | "BOOKED";
  }[];
} & Document;
