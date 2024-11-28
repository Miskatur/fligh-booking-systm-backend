import { Document } from "mongoose";
import { ISeats } from "../seats/seats.interface";

export type IFlights = {
  airline: string;
  flight_number: string;
  origin: string;
  destination: string;
  capacity: number;
  remaining_seat?: number;
  available_seats?: ISeats["_id"];
  date: Date;
  time: string;
} & Document;
