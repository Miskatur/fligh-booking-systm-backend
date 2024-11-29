import { Request, Response } from "express";
import BaseController from "../../shared/baseController";
import { FlightsService } from "./flights.service";
import ApiError from "../../middleware/error";
import pickQueries from "../../shared/pickQueries";
import {
  paginationFields,
  productSortFields,
} from "../../constants/paginationField";

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

  deleteAFlight = this.catchAsync(async (req: Request, res: Response) => {
    const role = req.role;
    if (role !== "ADMIN") {
      throw new ApiError(401, "You are not allowed to delete flights");
    }
    const result = await FlightsService.deleteAFlight(req.params.id);
    this.sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Flight data deleted successfully",
      data: result,
    });
  });

  updateAFlight = this.catchAsync(async (req: Request, res: Response) => {
    const role = req.role;
    if (role !== "ADMIN") {
      throw new ApiError(401, "You are not allowed to update flights");
    }
    const result = await FlightsService.updateAFlight(req.params.id, req.body);
    this.sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Flight data updated successfully",
      data: result,
    });
  });
  getAllAvailableFlight = this.catchAsync(
    async (req: Request, res: Response) => {
      const options = pickQueries(req.query, paginationFields);
      const filters = pickQueries(req.query, productSortFields);
      const result = await FlightsService.getAllAvailableFlight(
        options,
        filters
      );
      this.sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "All available flight data retrieved successfully",
        data: result,
      });
    }
  );
}

export const FlightsController = new Controller();
