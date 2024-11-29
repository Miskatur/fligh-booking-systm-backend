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
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const globalErrorHandler_1 = __importDefault(require("./middleware/globalErrorHandler"));
const user_route_1 = require("./modules/user/user.route");
const flights_route_1 = require("./modules/flights/flights.route");
const bookings_route_1 = require("./modules/bookings/bookings.route");
dotenv_1.default.config();
const app = (0, express_1.default)();
const allowedOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"];
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "PATCH", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Custom-Header"],
}));
app.use(body_parser_1.default.json());
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "50mb" }));
app.use((0, cookie_parser_1.default)());
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json({
        statusCode: 200,
        success: true,
        message: "Flight Booking System is working fine in port 5000 ",
        data: null,
    });
}));
//routes -------------------------------------
app.use("/api", user_route_1.UserRoutes);
app.use("/api/flights", flights_route_1.FlightsRoutes);
app.use("/api/bookings", bookings_route_1.BookingsRoutes);
//--------------------------------------------
app.use(globalErrorHandler_1.default.globalErrorHandler);
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: "Not Found",
        errorMessages: [
            {
                path: req.originalUrl,
                message: "API Not Found",
            },
        ],
    });
    next();
});
exports.default = app;
