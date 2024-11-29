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
exports.BookingsService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const error_1 = __importDefault(require("../../middleware/error"));
const flights_model_1 = __importDefault(require("../flights/flights.model"));
const user_model_1 = __importDefault(require("../user/user.model"));
const seats_model_1 = __importDefault(require("../seats/seats.model"));
const bookings_model_1 = __importDefault(require("./bookings.model"));
class Service {
    bookAFlight(payload, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield mongoose_1.default.startSession();
            session.startTransaction();
            try {
                // Validate user
                const isUserExist = yield user_model_1.default.findById(user_id, null, { session });
                if (!isUserExist) {
                    throw new error_1.default(404, "User not found");
                }
                // Validate flight
                const isFlightExist = yield flights_model_1.default.findById(payload.flight_info, null, {
                    session,
                });
                if (!isFlightExist) {
                    throw new error_1.default(404, "Flight not found");
                }
                // Validate seats
                const seatDoc = yield seats_model_1.default.findOne({ flight_info: payload.flight_info }, null, { session });
                if (!seatDoc) {
                    throw new error_1.default(404, "Seats not found for this flight");
                }
                const selectedSeats = payload.seats || [];
                const availableSeats = seatDoc.seats.filter((seat) => selectedSeats.includes(seat.seatNumber) && seat.status === "AVAILABLE");
                if (availableSeats.length !== selectedSeats.length) {
                    throw new error_1.default(400, "Some of the selected seats are already booked or invalid");
                }
                // Calculate total price
                const totalPrice = selectedSeats.length * isFlightExist.price;
                // Update selected seats as BOOKED
                yield seats_model_1.default.updateOne({ flight_info: payload.flight_info }, {
                    $set: {
                        "seats.$[seat].status": "BOOKED",
                    },
                }, {
                    arrayFilters: [{ "seat.seatNumber": { $in: selectedSeats } }],
                    session,
                });
                // Reduce remaining seats in Flights
                yield flights_model_1.default.findByIdAndUpdate(payload.flight_info, { $inc: { remaining_seat: -selectedSeats.length } }, { session });
                // Create booking record
                const booking = yield new bookings_model_1.default({
                    user: user_id,
                    flight_info: payload.flight_info,
                    number_of_seats: selectedSeats.length,
                    seats: selectedSeats,
                    total_price: totalPrice,
                    address: payload.address,
                }).save({ session });
                yield session.commitTransaction();
                session.endSession();
                return booking;
            }
            catch (error) {
                yield session.abortTransaction();
                session.endSession();
                throw error;
            }
        });
    }
    getAllBookingByUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const isUserExist = yield user_model_1.default.findById(userId);
            if (!isUserExist) {
                throw new error_1.default(404, "User not found");
            }
            const result = yield bookings_model_1.default.find({
                user: userId,
            })
                .populate({
                path: "flight_info",
            })
                .populate("user");
            return result;
        });
    }
    getAllBookings() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield bookings_model_1.default.find({})
                .populate({
                path: "flight_info",
            })
                .populate("user");
            return result;
        });
    }
    cancelBooking(bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield mongoose_1.default.startSession();
            session.startTransaction();
            try {
                // Fetch the booking
                const booking = yield bookings_model_1.default.findOne({ _id: bookingId }).populate("flight_info");
                if (!booking) {
                    throw new error_1.default(404, "Booking not found");
                }
                const flight = booking.flight_info;
                const currentDate = new Date();
                // Ensure cancellation is before the flight date
                if (new Date(flight.date) <= currentDate) {
                    throw new error_1.default(400, "Cannot cancel a booking after the flight date");
                }
                // Restore seats in the Seats collection
                const seatUpdateResult = yield seats_model_1.default.updateOne({ flight_info: flight._id }, {
                    $set: {
                        "seats.$[seat].status": "AVAILABLE",
                    },
                }, {
                    arrayFilters: [{ "seat.seatNumber": { $in: booking.seats } }],
                    session,
                });
                if (seatUpdateResult.modifiedCount === 0) {
                    throw new error_1.default(500, "Failed to restore seats.");
                }
                // Update remaining seats in Flights collection
                const flightUpdateResult = yield flights_model_1.default.updateOne({ _id: flight._id }, {
                    $inc: { remaining_seat: booking.number_of_seats },
                }, { session });
                if (flightUpdateResult.modifiedCount === 0) {
                    throw new error_1.default(500, "Failed to update remaining seats.");
                }
                // Mark the booking as CANCELLED
                booking.booking_status = "CANCELLED";
                yield booking.save({ session });
                yield session.commitTransaction();
                session.endSession();
                return "Booking cancelled and seats restored successfully";
            }
            catch (error) {
                yield session.abortTransaction();
                session.endSession();
                throw error;
            }
        });
    }
    deleteABooking(bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield mongoose_1.default.startSession();
            session.startTransaction();
            try {
                const booking = yield bookings_model_1.default.findById(bookingId).session(session);
                if (!booking) {
                    throw new error_1.default(404, "Booking not found! ");
                }
                if (booking.booking_status === "CANCELLED") {
                    yield bookings_model_1.default.findByIdAndDelete(bookingId, { session });
                    yield session.commitTransaction();
                    session.endSession();
                    return "Booking was already canceled and has been deleted.";
                }
                // Fetch the associated flight
                const flight = yield flights_model_1.default.findById(booking.flight_info).session(session);
                if (!flight) {
                    throw new error_1.default(404, "Flight not found");
                }
                // Restore the seats in the Seats collection
                const seatUpdateResult = yield seats_model_1.default.updateOne({ flight_info: flight._id }, {
                    $set: { "seats.$[seat].status": "AVAILABLE" },
                }, {
                    arrayFilters: [{ "seat.seatNumber": { $in: booking.seats } }],
                    session,
                });
                if (seatUpdateResult.modifiedCount === 0) {
                    throw new error_1.default(500, "Failed to restore seats.");
                }
                // Update remaining seats in Flights collection
                const flightUpdateResult = yield flights_model_1.default.updateOne({ _id: flight._id }, {
                    $inc: { remaining_seat: booking.number_of_seats },
                }, { session });
                if (flightUpdateResult.modifiedCount === 0) {
                    throw new error_1.default(500, "Failed to update remaining seats.");
                }
                // Delete the booking
                yield bookings_model_1.default.findByIdAndDelete(bookingId, { session });
                yield session.commitTransaction();
                session.endSession();
                return "Booking deleted and seats restored successfully";
            }
            catch (error) {
                yield session.abortTransaction();
                session.endSession();
                throw error;
            }
        });
    }
}
exports.BookingsService = new Service();
