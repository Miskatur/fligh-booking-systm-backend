import { Request, Response } from "express";
import BaseController from "../../shared/baseController";
import ApiError from "../../middleware/error";
import { BookingsService } from "./bookings.service";

class Controller extends BaseController {
  bookAFlight = this.catchAsync(async (req: Request, res: Response) => {
    const role = req.role;
    const user_id = req.id;
    if (role !== "USER") {
      throw new ApiError(401, "You are not allowed to create flights");
    }
    const result = await BookingsService.bookAFlight(req.body, user_id);

    this.sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "A booking confirmed successfully",
      data: result,
    });
  });
}

export const BookingsController = new Controller();
