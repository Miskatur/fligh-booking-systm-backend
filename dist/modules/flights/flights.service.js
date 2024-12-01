"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlightsService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const error_1 = __importDefault(require("../../middleware/error"));
const seats_model_1 = __importDefault(require("../seats/seats.model"));
const flights_model_1 = __importDefault(require("./flights.model"));
const pagination_1 = require("../../shared/pagination");
class Service {
    createAFlight(data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (data.capacity <= 0) {
                throw new Error("Capacity must be greater than zero.");
            }
            const session = yield mongoose_1.default.startSession();
            session.startTransaction();
            try {
                // creating a flight data
                const flight = yield new flights_model_1.default(Object.assign(Object.assign({}, data), { remaining_seat: data.capacity })).save({ session });
                // creating seats data for the flight
                const seats = Array.from({ length: data.capacity }, (_, i) => ({
                    seatNumber: `${Math.floor(i / 6) + 1}${String.fromCharCode(65 + (i % 6))}`,
                    status: "AVAILABLE",
                }));
                // adding seats to our Seats collection for a cleaner db collection
                const seatDoc = yield new seats_model_1.default({
                    date: data.date,
                    flight_info: flight._id,
                    seats,
                }).save({ session });
                // getting the seats data so that we can track
                flight.available_seats = seatDoc._id;
                yield flight.save({ session });
                yield session.commitTransaction();
                session.endSession();
                return flight;
            }
            catch (error) {
                yield session.abortTransaction();
                session.endSession();
                throw error;
            }
        });
    }
    getAFlightInfo(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const info = yield flights_model_1.default.findById(id).populate({
                path: "available_seats",
            });
            if (!info) {
                throw new error_1.default(400, "Couldn't find the flight");
            }
            return info;
        });
    }
    deleteAFlight(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const isFlightExists = yield flights_model_1.default.findById(id);
            if ((isFlightExists === null || isFlightExists === void 0 ? void 0 : isFlightExists.capacity) !== (isFlightExists === null || isFlightExists === void 0 ? void 0 : isFlightExists.remaining_seat)) {
                throw new error_1.default(400, "Flight can't be deleted as it has booked seats");
            }
            const result = yield flights_model_1.default.findByIdAndDelete(id).select({ id: 1 });
            if (!result) {
                throw new error_1.default(404, "Flight not found");
            }
            if (result) {
                yield seats_model_1.default.findOneAndDelete({
                    flight_info: id,
                });
            }
            return result;
        });
    }
    updateAFlight(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield mongoose_1.default.startSession();
            session.startTransaction();
            try {
                const isFlightExist = yield flights_model_1.default.findById(id, null, { session });
                if (!isFlightExist) {
                    throw new error_1.default(404, "Flight not found");
                }
                const seatDoc = yield seats_model_1.default.findOne({ flight_info: id }, null, {
                    session,
                });
                if (!seatDoc) {
                    throw new error_1.default(404, "Seats information not found for this flight");
                }
                // if any of the seat isAnySeatBooked, then we need to prevent it from updating
                const isAnySeatBooked = seatDoc.seats.some((seat) => seat.status === "BOOKED");
                if (isAnySeatBooked) {
                    throw new error_1.default(400, "Cannot update seat capacity as some seats are already booked");
                }
                // Handling seat capacity changes when there is no seat booked yet
                if (payload.capacity && payload.capacity !== isFlightExist.capacity) {
                    const seatCountDifference = payload.capacity - isFlightExist.capacity;
                    if (seatCountDifference > 0) {
                        // Adding new seats
                        const newSeats = Array.from({ length: seatCountDifference }, (_, i) => ({
                            seatNumber: `${Math.floor((isFlightExist.capacity + i) / 6) + 1}${String.fromCharCode(65 + ((isFlightExist.capacity + i) % 6))}`,
                            status: "AVAILABLE",
                        }));
                        yield seats_model_1.default.updateOne({ flight_info: id }, { $push: { seats: { $each: newSeats } } }, { session });
                    }
                    else if (seatCountDifference < 0) {
                        // Removing excess seats
                        const seatsToRemoveCount = Math.abs(seatCountDifference);
                        // Identifying the seat numbers to remove (last N=deference seats that was calculated by us according to the provided capacity)
                        const seatsToRemove = seatDoc.seats
                            .slice(-seatsToRemoveCount)
                            .map((seat) => seat.seatNumber);
                        // Removing the identified seats from the collection
                        yield seats_model_1.default.updateOne({ flight_info: id }, { $pull: { seats: { seatNumber: { $in: seatsToRemove } } } }, { session });
                    }
                }
                const updatedFlight = yield flights_model_1.default.findByIdAndUpdate(id, Object.assign(Object.assign({}, payload), { remaining_seat: payload.capacity }), {
                    new: true,
                    session,
                }).populate("available_seats");
                yield session.commitTransaction();
                session.endSession();
                return updatedFlight;
            }
            catch (error) {
                yield session.abortTransaction();
                session.endSession();
                throw error;
            }
        });
    }
    getAllAvailableFlight(options, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, page, skip, sortBy, sortOrder } = pagination_1.paginationHelpers.calculatePagination(options);
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
            const orConditions = admin === "1"
                ? []
                : [
                    {
                        date: now.toISOString().split("T")[0],
                        time: { $gt: now.toTimeString().slice(0, 5) },
                    },
                    { date: { $gt: now.toISOString().split("T")[0] } },
                ];
            const whereConditions = andConditions.length > 0
                ? Object.assign({ $and: andConditions, remaining_seat: { $gt: 0 } }, (orConditions.length > 0 && { $or: orConditions })) : Object.assign({ remaining_seat: { $gt: 0 } }, (orConditions.length > 0 && { $or: orConditions }));
            const sortConditions = {};
            if (sortBy && sortOrder) {
                sortConditions[sortBy] = sortOrder;
            }
            const result = yield flights_model_1.default.find(whereConditions)
                .sort(sortConditions)
                .skip(skip)
                .limit(limit);
            const total = yield flights_model_1.default.countDocuments(whereConditions);
            return {
                meta: {
                    page,
                    limit,
                    total,
                },
                data: result,
            };
        });
    }
    getAllDestinations() {
        return __awaiter(this, void 0, void 0, function* () {
            const origins = yield flights_model_1.default.distinct("origin");
            const destinations = yield flights_model_1.default.distinct("destination");
            const allLocations = Array.from(new Set([...origins, ...destinations]));
            return allLocations;
        });
    }
}
exports.FlightsService = new Service();
