import ApiError from "../../middleware/error";
import Seats from "../seats/seats.model";
import { IFlights } from "./flights.interface";
import Flights from "./flights.model";

class Service {
  async createAFlight(data: IFlights) {
    const flight = await new Flights({
      ...data,
      remaining_seat: data.capacity,
    }).save();

    const seats = Array.from({ length: data.capacity }, (_, i) => ({
      seatNumber: `${Math.floor(i / 6) + 1}${String.fromCharCode(
        65 + (i % 6)
      )}`,
      status: "AVAILABLE",
    }));

    const seatDoc = await new Seats({
      date: data.date,
      flight_info: flight._id,
      seats,
    }).save();

    flight.available_seats = seatDoc._id;
    await flight.save();

    return flight;
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
}

export const FlightsService = new Service();
