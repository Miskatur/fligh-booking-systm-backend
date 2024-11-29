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
exports.BookingsController = void 0;
const baseController_1 = __importDefault(require("../../shared/baseController"));
const error_1 = __importDefault(require("../../middleware/error"));
const bookings_service_1 = require("./bookings.service");
class Controller extends baseController_1.default {
    constructor() {
        super(...arguments);
        this.bookAFlight = this.catchAsync((req, res) => __awaiter(this, void 0, void 0, function* () {
            const role = req.role;
            const user_id = req.id;
            if (role !== "USER") {
                throw new error_1.default(401, "You are not allowed to book a flight");
            }
            const result = yield bookings_service_1.BookingsService.bookAFlight(req.body, user_id);
            this.sendResponse(res, {
                statusCode: 200,
                success: true,
                message: "A booking confirmed successfully",
                data: result,
            });
        }));
        this.getAllBookingByUser = this.catchAsync((req, res) => __awaiter(this, void 0, void 0, function* () {
            const userId = req.id;
            const role = req.role;
            if (role !== "USER") {
                throw new error_1.default(401, "You are not allowed to see bookings");
            }
            const result = yield bookings_service_1.BookingsService.getAllBookingByUser(userId);
            this.sendResponse(res, {
                statusCode: 200,
                success: true,
                message: "All bookings data retrieved for you successfully",
                data: result,
            });
        }));
        this.getAllBookings = this.catchAsync((req, res) => __awaiter(this, void 0, void 0, function* () {
            const role = req.role;
            if (role !== "ADMIN") {
                throw new error_1.default(401, "You are not allowed to retrieve all bookings");
            }
            const result = yield bookings_service_1.BookingsService.getAllBookings();
            this.sendResponse(res, {
                statusCode: 200,
                success: true,
                message: "All bookings data retrieved successfully",
                data: result,
            });
        }));
        this.cancelBooking = this.catchAsync((req, res) => __awaiter(this, void 0, void 0, function* () {
            const role = req.role;
            if (role !== "ADMIN") {
                throw new error_1.default(401, "You are not allowed to cancel the booking");
            }
            const result = yield bookings_service_1.BookingsService.cancelBooking(req.params.id);
            this.sendResponse(res, {
                statusCode: 200,
                success: true,
                message: "Booking cancelled successfully",
                data: result,
            });
        }));
        this.deleteABooking = this.catchAsync((req, res) => __awaiter(this, void 0, void 0, function* () {
            const role = req.role;
            if (role !== "ADMIN") {
                throw new error_1.default(401, "You are not allowed to delete the booking");
            }
            const result = yield bookings_service_1.BookingsService.deleteABooking(req.params.id);
            this.sendResponse(res, {
                statusCode: 200,
                success: true,
                message: "Booking deleted successfully",
                data: result,
            });
        }));
    }
}
exports.BookingsController = new Controller();
