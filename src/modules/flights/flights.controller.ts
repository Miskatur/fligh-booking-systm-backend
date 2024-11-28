import { Request, Response } from "express";
import BaseController from "../../shared/baseController";
import { FlightsService } from "./flights.service";
import ApiError from "../../middleware/error";

class Controller extends BaseController {
  createAFlight = this.catchAsync(async (req: Request, res: Response) => {
    const role = req.role;
    if (role !== "ADMIN") {
      throw new ApiError(401, "You are not allowed to create flights");
    }
    const result = await FlightsService.createAFlight(req.body);

    this.sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "A Flight added successfully",
      data: result,
    });
  });
  getAFlightInfo = this.catchAsync(async (req: Request, res: Response) => {
    const result = await FlightsService.getAFlightInfo(req.params.id);

    this.sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Flight data retrieved successfully",
      data: result,
    });
  });
}

export const FlightsController = new Controller();
