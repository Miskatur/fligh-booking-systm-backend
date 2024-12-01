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
exports.FlightsController = void 0;
const baseController_1 = __importDefault(require("../../shared/baseController"));
const flights_service_1 = require("./flights.service");
const error_1 = __importDefault(require("../../middleware/error"));
const pickQueries_1 = __importDefault(require("../../shared/pickQueries"));
const paginationField_1 = require("../../constants/paginationField");
class Controller extends baseController_1.default {
    constructor() {
        super(...arguments);
        this.createAFlight = this.catchAsync((req, res) => __awaiter(this, void 0, void 0, function* () {
            const role = req.role;
            if (role !== "ADMIN") {
                throw new error_1.default(401, "You are not allowed to create flights");
            }
            const result = yield flights_service_1.FlightsService.createAFlight(req.body);
            this.sendResponse(res, {
                statusCode: 200,
                success: true,
                message: "A Flight added successfully",
                data: result,
            });
        }));
        this.getAFlightInfo = this.catchAsync((req, res) => __awaiter(this, void 0, void 0, function* () {
            const result = yield flights_service_1.FlightsService.getAFlightInfo(req.params.id);
            this.sendResponse(res, {
                statusCode: 200,
                success: true,
                message: "Flight data retrieved successfully",
                data: result,
            });
        }));
        this.deleteAFlight = this.catchAsync((req, res) => __awaiter(this, void 0, void 0, function* () {
            const role = req.role;
            if (role !== "ADMIN") {
                throw new error_1.default(401, "You are not allowed to delete flights");
            }
            const result = yield flights_service_1.FlightsService.deleteAFlight(req.params.id);
            this.sendResponse(res, {
                statusCode: 200,
                success: true,
                message: "Flight data deleted successfully",
                data: result,
            });
        }));
        this.updateAFlight = this.catchAsync((req, res) => __awaiter(this, void 0, void 0, function* () {
            const role = req.role;
            if (role !== "ADMIN") {
                throw new error_1.default(401, "You are not allowed to update flights");
            }
            const result = yield flights_service_1.FlightsService.updateAFlight(req.params.id, req.body);
            this.sendResponse(res, {
                statusCode: 200,
                success: true,
                message: "Flight data updated successfully",
                data: result,
            });
        }));
        this.getAllAvailableFlight = this.catchAsync((req, res) => __awaiter(this, void 0, void 0, function* () {
            const options = (0, pickQueries_1.default)(req.query, paginationField_1.paginationFields);
            const filters = (0, pickQueries_1.default)(req.query, paginationField_1.productSortFields);
            const result = yield flights_service_1.FlightsService.getAllAvailableFlight(options, filters);
            this.sendResponse(res, {
                statusCode: 200,
                success: true,
                message: "All available flight data retrieved successfully",
                data: result,
            });
        }));
        this.getAllDestinations = this.catchAsync((req, res) => __awaiter(this, void 0, void 0, function* () {
            const result = yield flights_service_1.FlightsService.getAllDestinations();
            this.sendResponse(res, {
                statusCode: 200,
                success: true,
                message: "All available location retrieved successfully",
                data: result,
            });
        }));
    }
}
exports.FlightsController = new Controller();
