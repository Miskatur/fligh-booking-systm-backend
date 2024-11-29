import cors from "cors";
import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import body_parser from "body-parser";
import cookieParser from "cookie-parser";
import globalErrorHandler from "./middleware/globalErrorHandler";
import { UserRoutes } from "./modules/user/user.route";
import { FlightsRoutes } from "./modules/flights/flights.route";
import { BookingsRoutes } from "./modules/bookings/bookings.route";

dotenv.config();
const app = express();

const allowedOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "PATCH", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Custom-Header"],
  })
);

app.use(body_parser.json());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

app.get("/", async (req, res) => {
  res.status(200).json({
    statusCode: 200,
    success: true,
    message: "Flight Booking System is working fine in port 5000 ",
    data: null,
  });
});
//routes -------------------------------------
app.use("/api", UserRoutes);
app.use("/api/flights", FlightsRoutes);
app.use("/api/bookings", BookingsRoutes);

//--------------------------------------------

app.use(globalErrorHandler.globalErrorHandler);

app.use((req: Request, res: Response, next: NextFunction) => {
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
export default app;
