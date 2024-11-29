"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlightsRoutes = void 0;
const express_1 = __importDefault(require("express"));
const verifyToken_1 = __importDefault(require("../../middleware/verifyToken"));
const flights_controller_1 = require("./flights.controller");
const router = express_1.default.Router();
router.get("/", flights_controller_1.FlightsController.getAllAvailableFlight);
router.post("/", verifyToken_1.default, flights_controller_1.FlightsController.createAFlight);
router.get("/:id", flights_controller_1.FlightsController.getAFlightInfo);
router.delete("/:id", verifyToken_1.default, flights_controller_1.FlightsController.deleteAFlight);
router.patch("/:id", verifyToken_1.default, flights_controller_1.FlightsController.updateAFlight);
exports.FlightsRoutes = router;
