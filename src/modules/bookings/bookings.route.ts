import express from "express";
import verifyToken from "../../middleware/verifyToken";
import { BookingsController } from "./bookings.controller";

const router = express.Router();
router.post("/", verifyToken, BookingsController.bookAFlight);

export const BookingsRoutes = router;
