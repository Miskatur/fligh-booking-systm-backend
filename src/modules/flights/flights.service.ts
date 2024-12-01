import mongoose, { SortOrder } from "mongoose";
import ApiError from "../../middleware/error";
import Seats from "../seats/seats.model";
import { IFlights } from "./flights.interface";
import Flights from "./flights.model";
import {
  IFilterRequest,
  IPaginationOptions,
} from "../../constants/pagination.interface";
import { paginationHelpers } from "../../shared/pagination";

class Service {
  async createAFlight(data: IFlights) {
    if (data.capacity <= 0) {
      throw new Error("Capacity must be greater than zero.");
    }
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // creating a flight data
      const flight = await new Flights({
        ...data,
        remaining_seat: data.capacity,
      }).save({ session });

      // creating seats data for the flight
      const seats = Array.from({ length: data.capacity }, (_, i) => ({
        seatNumber: `${Math.floor(i / 6) + 1}${String.fromCharCode(
          65 + (i % 6)
        )}`,
        status: "AVAILABLE",
      }));

      // adding seats to our Seats collection for a cleaner db collection
      const seatDoc = await new Seats({
        date: data.date,
        flight_info: flight._id,
        seats,
      }).save({ session });

      // getting the seats data so that we can track
      flight.available_seats = seatDoc._id;
      await flight.save({ session });
      await session.commitTransaction();
      session.endSession();
      return flight;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async getAFlightInfo(id: string) {
    const info = await Flights.findById(id).populate({
      path: "available_seats",
    });
    if (!info) {
      throw new ApiError(400, "Couldn't find the flight");
    }
    return info;
  }

  async deleteAFlight(id: string) {
    const isFlightExists = await Flights.findById(id);
    if (isFlightExists?.capacity !== isFlightExists?.remaining_seat) {
      throw new ApiError(400, "Flight can't be deleted as it has booked seats");
    }

    const result = await Flights.findByIdAndDelete(id).select({ id: 1 });
    if (!result) {
      throw new ApiError(404, "Flight not found");
    }
    if (result) {
      await Seats.findOneAndDelete({
        flight_info: id,
      });
    }
    return result;
  }

  async updateAFlight(id: string, payload: Partial<IFlights>) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const isFlightExist = await Flights.findById(id, null, { session });
      if (!isFlightExist) {
        throw new ApiError(404, "Flight not found");
      }

      const seatDoc = await Seats.findOne({ flight_info: id }, null, {
        session,
      });
      if (!seatDoc) {
        throw new ApiError(404, "Seats information not found for this flight");
      }
      // if any of the seat isAnySeatBooked, then we need to prevent it from updating
      const isAnySeatBooked = seatDoc.seats.some(
        (seat) => seat.status === "BOOKED"
      );
      if (isAnySeatBooked) {
        throw new ApiError(
          400,
          "Cannot update seat capacity as some seats are already booked"
        );
      }

      // Handling seat capacity changes when there is no seat booked yet
      if (payload.capacity && payload.capacity !== isFlightExist.capacity) {
        const seatCountDifference = payload.capacity - isFlightExist.capacity;

        if (seatCountDifference > 0) {
          // Adding new seats
          const newSeats = Array.from(
            { length: seatCountDifference },
            (_, i) => ({
              seatNumber: `${
                Math.floor((isFlightExist.capacity + i) / 6) + 1
              }${String.fromCharCode(65 + ((isFlightExist.capacity + i) % 6))}`,
              status: "AVAILABLE",
            })
          );
          await Seats.updateOne(
            { flight_info: id },
            { $push: { seats: { $each: newSeats } } },
            { session }
          );
        } else if (seatCountDifference < 0) {
          // Removing excess seats
          const seatsToRemoveCount = Math.abs(seatCountDifference);

          // Identifying the seat numbers to remove (last N=deference seats that was calculated by us according to the provided capacity)
          const seatsToRemove = seatDoc.seats
            .slice(-seatsToRemoveCount)
            .map((seat) => seat.seatNumber);

          // Removing the identified seats from the collection
          await Seats.updateOne(
            { flight_info: id },
            { $pull: { seats: { seatNumber: { $in: seatsToRemove } } } },
            { session }
          );
        }
      }

      const updatedFlight = await Flights.findByIdAndUpdate(
        id,
        {
          ...payload,
          remaining_seat: payload.capacity,
        },
        {
          new: true,
          session,
        }
      ).populate("available_seats");

      await session.commitTransaction();
      session.endSession();

      return updatedFlight;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async getAllAvailableFlight(
    options: IPaginationOptions,
    filters: IFilterRequest
  ) {
    const { limit, page, skip, sortBy, sortOrder } =
      paginationHelpers.calculatePagination(options);
    const { origin, destination, date, admin } = filters;

    const andConditions = [];

    if (origin) {
      andConditions.push({ origin: origin });
    }
    if (destination) {
      andConditions.push({ destination: destination });
    }
    if (date) {
      andConditions.push({ date: date });
    }
    const now = new Date();

    const orConditions =
      admin === "1"
        ? []
        : [
            {
              date: now.toISOString().split("T")[0],
              time: { $gt: now.toTimeString().slice(0, 5) },
            },
            { date: { $gt: now.toISOString().split("T")[0] } },
          ];
    const whereConditions: any =
      andConditions.length > 0
        ? {
            $and: andConditions,
            remaining_seat: { $gt: 0 },
            ...(orConditions.length > 0 && { $or: orConditions }),
          }
        : {
            remaining_seat: { $gt: 0 },
            ...(orConditions.length > 0 && { $or: orConditions }),
          };

    const sortConditions: { [key: string]: SortOrder } = {};
    if (sortBy && sortOrder) {
      sortConditions[sortBy] = sortOrder;
    }

    const result = await Flights.find(whereConditions)
      .sort(sortConditions)
      .skip(skip)
      .limit(limit);

    const total = await Flights.countDocuments(whereConditions);
    return {
      meta: {
        page,
        limit,
        total,
      },
      data: result,
    };
  }

  async getAllDestinations() {
    const origins = await Flights.distinct("origin");
    const destinations = await Flights.distinct("destination");

    const allLocations = Array.from(new Set([...origins, ...destinations]));
    return allLocations;
  }
}

export const FlightsService = new Service();
