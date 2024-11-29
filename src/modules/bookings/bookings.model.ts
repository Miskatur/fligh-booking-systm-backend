import mongoose, { Schema } from "mongoose";
import { IBooking } from "./bookings.interface";

const BookingSchema = new Schema<IBooking>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    flight_info: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flights",
    },
    booking_status: {
      type: String,
      enum: ["CONFIRMED", "CANCELLED"],
      default: "CONFIRMED",
    },
    number_of_seats: {
      type: Number,
      required: true,
    },
    seats: [
      {
        type: String,
        required: true,
      },
    ],
    total_price: {
      type: Number,
      required: true,
    },
    address: {
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

const Bookings = mongoose.model<IBooking>("Bookings", BookingSchema);
export default Bookings;
