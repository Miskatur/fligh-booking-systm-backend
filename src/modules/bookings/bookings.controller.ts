import { Request, Response } from "express";
import BaseController from "../../shared/baseController";
import ApiError from "../../middleware/error";
import { BookingsService } from "./bookings.service";

class Controller extends BaseController {
  bookAFlight = this.catchAsync(async (req: Request, res: Response) => {
    const role = req.role;
    const user_id = req.id;
    if (role !== "USER") {
      throw new ApiError(401, "You are not allowed to book a flight");
    }
    const result = await BookingsService.bookAFlight(req.body, user_id);

    this.sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "A booking confirmed successfully",
      data: result,
    });
  });
  getAllBookingByUser = this.catchAsync(async (req: Request, res: Response) => {
    const userId = req.id;
    const role = req.role;
    if (role !== "USER") {
      throw new ApiError(401, "You are not allowed to see bookings");
    }
    const result = await BookingsService.getAllBookingByUser(userId);

    this.sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "All bookings data retrieved for you successfully",
      data: result,
    });
  });
  getAllBookings = this.catchAsync(async (req: Request, res: Response) => {
    const role = req.role;
    if (role !== "ADMIN") {
      throw new ApiError(401, "You are not allowed to retrieve all bookings");
    }
    const result = await BookingsService.getAllBookings();

    this.sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "All bookings data retrieved successfully",
      data: result,
    });
  });
  cancelBooking = this.catchAsync(async (req: Request, res: Response) => {
    const role = req.role;
    if (role !== "ADMIN") {
      throw new ApiError(401, "You are not allowed to cancel the booking");
    }
    const result = await BookingsService.cancelBooking(req.params.id);

    this.sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Booking cancelled successfully",
      data: result,
    });
  });
  deleteABooking = this.catchAsync(async (req: Request, res: Response) => {
    const role = req.role;
    if (role !== "ADMIN") {
      throw new ApiError(401, "You are not allowed to delete the booking");
    }
    const result = await BookingsService.deleteABooking(req.params.id);

    this.sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Booking deleted successfully",
      data: result,
    });
  });
}

export const BookingsController = new Controller();
