import mongoose from "mongoose";
import ApiError from "../../middleware/error";
import Flights from "../flights/flights.model";
import User from "../user/user.model";
import { IBooking } from "./bookings.interface";
import Seats from "../seats/seats.model";
import Bookings from "./bookings.model";
import { IFlights } from "../flights/flights.interface";
import { IPaginationOptions } from "../../constants/pagination.interface";
import { paginationHelpers } from "../../shared/pagination";
import { SortOrder } from "mongoose";

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

  async getAllBookingByUser(userId: string) {
    const isUserExist = await User.findById(userId);
    if (!isUserExist) {
      throw new ApiError(404, "User not found");
    }
    const result = await Bookings.find({
      user: userId,
    })
      .populate({
        path: "flight_info",
      })
      .populate("user");

    return result;
  }

  async getAllBookings(options: IPaginationOptions) {
    const { limit, page, skip, sortBy, sortOrder } =
      paginationHelpers.calculatePagination(options);
    const sortConditions: { [key: string]: SortOrder } = {};
    if (sortBy && sortOrder) {
      sortConditions[sortBy] = sortOrder;
    }
    const result = await Bookings.find({})
      .populate({
        path: "flight_info",
      })
      .populate("user")
      .sort(sortConditions)
      .skip(skip)
      .limit(limit);
    const total = await Bookings.countDocuments();
    return {
      meta: {
        page,
        limit,
        total,
      },
      data: result,
    };
  }

  async cancelBooking(bookingId: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Fetch the booking
      const booking = await Bookings.findOne({ _id: bookingId }).populate(
        "flight_info"
      );
      if (!booking) {
        throw new ApiError(404, "Booking not found");
      }

      const flight = booking.flight_info as IFlights;
      const currentDate = new Date();

      // Ensure cancellation is before the flight date
      if (new Date(flight.date) <= currentDate) {
        throw new ApiError(
          400,
          "Cannot cancel a booking after the flight date"
        );
      }

      // Restore seats in the Seats collection
      const seatUpdateResult = await Seats.updateOne(
        { flight_info: flight._id },
        {
          $set: {
            "seats.$[seat].status": "AVAILABLE",
          },
        },
        {
          arrayFilters: [{ "seat.seatNumber": { $in: booking.seats } }],
          session,
        }
      );
      if (seatUpdateResult.modifiedCount === 0) {
        throw new ApiError(500, "Failed to restore seats.");
      }
      // Update remaining seats in Flights collection
      const flightUpdateResult = await Flights.updateOne(
        { _id: flight._id },
        {
          $inc: { remaining_seat: booking.number_of_seats },
        },
        { session }
      );
      if (flightUpdateResult.modifiedCount === 0) {
        throw new ApiError(500, "Failed to update remaining seats.");
      }
      // Mark the booking as CANCELLED
      booking.booking_status = "CANCELLED";
      await booking.save({ session });

      await session.commitTransaction();
      session.endSession();

      return "Booking cancelled and seats restored successfully";
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async deleteABooking(bookingId: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const booking = await Bookings.findById(bookingId).session(session);
      if (!booking) {
        throw new ApiError(404, "Booking not found! ");
      }

      if (booking.booking_status === "CANCELLED") {
        await Bookings.findByIdAndDelete(bookingId, { session });

        await session.commitTransaction();
        session.endSession();
        return "Booking was already canceled and has been deleted.";
      }

      // Fetch the associated flight
      const flight = await Flights.findById(booking.flight_info).session(
        session
      );
      if (!flight) {
        throw new ApiError(404, "Flight not found");
      }

      // Restore the seats in the Seats collection
      const seatUpdateResult = await Seats.updateOne(
        { flight_info: flight._id },
        {
          $set: { "seats.$[seat].status": "AVAILABLE" },
        },
        {
          arrayFilters: [{ "seat.seatNumber": { $in: booking.seats } }],
          session,
        }
      );
      if (seatUpdateResult.modifiedCount === 0) {
        throw new ApiError(500, "Failed to restore seats.");
      }

      // Update remaining seats in Flights collection
      const flightUpdateResult = await Flights.updateOne(
        { _id: flight._id },
        {
          $inc: { remaining_seat: booking.number_of_seats },
        },
        { session }
      );

      if (flightUpdateResult.modifiedCount === 0) {
        throw new ApiError(500, "Failed to update remaining seats.");
      }

      // Delete the booking
      await Bookings.findByIdAndDelete(bookingId, { session });

      await session.commitTransaction();
      session.endSession();

      return "Booking deleted and seats restored successfully";
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}

export const BookingsService = new Service();
