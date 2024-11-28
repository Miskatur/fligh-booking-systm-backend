import express from "express";
import verifyToken from "../../middleware/verifyToken";
import { FlightsController } from "./flights.controller";

const router = express.Router();

router.post("/", verifyToken, FlightsController.createAFlight);
router.get("/:id", FlightsController.getAFlightInfo);

export const FlightsRoutes = router;
