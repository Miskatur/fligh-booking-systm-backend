import express from "express";
import verifyToken from "../../middleware/verifyToken";
import { FlightsController } from "./flights.controller";

const router = express.Router();
router.get("/", FlightsController.getAllAvailableFlight);
router.get("/location", FlightsController.getAllDestinations);
router.post("/", verifyToken, FlightsController.createAFlight);
router.get("/:id", FlightsController.getAFlightInfo);
router.delete("/:id", verifyToken, FlightsController.deleteAFlight);
router.patch("/:id", verifyToken, FlightsController.updateAFlight);

export const FlightsRoutes = router;
