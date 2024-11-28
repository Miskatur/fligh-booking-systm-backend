import mongoose, { Schema } from "mongoose";
import { IFlights } from "./flights.interface";

const FlightSchema = new Schema<IFlights>(
  {
    airline: {
      type: String,
      required: true,
    },
    flight_number: {
      type: String,
      required: true,
      unique: true,
    },
    origin: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    remaining_seat: {
      type: Number,
      required: false,
    },
    available_seats: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seats",
      required: false,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

const Flights = mongoose.model<IFlights>("Flights", FlightSchema);
export default Flights;
