import mongoose from "mongoose";
import ApiError from "../../middleware/error";
import Flights from "../flights/flights.model";
import User from "../user/user.model";
import { IBooking } from "./bookings.interface";
import Seats from "../seats/seats.model";
import Bookings from "./bookings.model";

class Service {
  async bookAFlight(payload: IBooking, user_id: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Validate user
      const isUserExist = await User.findById(user_id, null, { session });
      if (!isUserExist) {
        throw new ApiError(404, "User not found");
      }

      // Validate flight
      const isFlightExist = await Flights.findById(payload.flight_info, null, {
        session,
      });
      if (!isFlightExist) {
        throw new ApiError(404, "Flight not found");
      }

      // Validate seats
      const seatDoc = await Seats.findOne(
        { flight_info: payload.flight_info },
        null,
        { session }
      );
      if (!seatDoc) {
        throw new ApiError(404, "Seats not found for this flight");
      }

      const selectedSeats = payload.seats || [];
      const availableSeats = seatDoc.seats.filter(
        (seat) =>
          selectedSeats.includes(seat.seatNumber) && seat.status === "AVAILABLE"
      );

      if (availableSeats.length !== selectedSeats.length) {
        throw new ApiError(
          400,
          "Some of the selected seats are already booked or invalid"
        );
      }

      // Calculate total price
      const totalPrice = selectedSeats.length * isFlightExist.price;

      // Update selected seats as BOOKED
      await Seats.updateOne(
        { flight_info: payload.flight_info },
        {
          $set: {
            "seats.$[seat].status": "BOOKED",
          },
        },
        {
          arrayFilters: [{ "seat.seatNumber": { $in: selectedSeats } }],
          session,
        }
      );

      // Reduce remaining seats in Flights
      await Flights.findByIdAndUpdate(
        payload.flight_info,
        { $inc: { remaining_seat: -selectedSeats.length } },
        { session }
      );

      // Create booking record
      const booking = await new Bookings({
        user: user_id,
        flight_info: payload.flight_info,
        number_of_seats: selectedSeats.length,
        seats: selectedSeats,
        total_price: totalPrice,
        address: payload.address,
      }).save({ session });

      await session.commitTransaction();
      session.endSession();

      return booking;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}

export const BookingsService = new Service();
