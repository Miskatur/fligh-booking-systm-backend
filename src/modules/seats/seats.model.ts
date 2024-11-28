import mongoose, { Schema } from "mongoose";
import { ISeats } from "./seats.interface";

const SeatSchema = new Schema<ISeats>({
  date: {
    type: Date,
    required: true,
  },
  flight_info: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Flights",
    required: true,
  },
  seats: [
    {
      seatNumber: {
        type: String,
        required: true,
      },
      status: {
        type: String,
        enum: ["AVAILABLE", "BOOKED"],
        default: "AVAILABLE",
      },
    },
  ],
});

const Seats = mongoose.model<ISeats>("Seats", SeatSchema);

export default Seats;
