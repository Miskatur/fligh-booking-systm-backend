import express from "express";
import verifyToken from "../../middleware/verifyToken";
import { BookingsController } from "./bookings.controller";

const router = express.Router();
router.post("/", verifyToken, BookingsController.bookAFlight);
router.get("/", verifyToken, BookingsController.getAllBookings);
router.get("/user", verifyToken, BookingsController.getAllBookingByUser);
router.patch("/:id", verifyToken, BookingsController.cancelBooking);
router.delete("/:id", verifyToken, BookingsController.deleteABooking);

export const BookingsRoutes = router;
