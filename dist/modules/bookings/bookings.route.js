"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsRoutes = void 0;
const express_1 = __importDefault(require("express"));
const verifyToken_1 = __importDefault(require("../../middleware/verifyToken"));
const bookings_controller_1 = require("./bookings.controller");
const router = express_1.default.Router();
router.post("/", verifyToken_1.default, bookings_controller_1.BookingsController.bookAFlight);
router.get("/", verifyToken_1.default, bookings_controller_1.BookingsController.getAllBookings);
router.get("/user", verifyToken_1.default, bookings_controller_1.BookingsController.getAllBookingByUser);
router.patch("/:id", verifyToken_1.default, bookings_controller_1.BookingsController.cancelBooking);
router.delete("/:id", verifyToken_1.default, bookings_controller_1.BookingsController.deleteABooking);
exports.BookingsRoutes = router;
