import { Request, Response } from "express";
import BaseController from "../../shared/baseController";
import { UserService } from "./user.service";
import ApiError from "../../middleware/error";

class Controller extends BaseController {
  registerUser = this.catchAsync(async (req: Request, res: Response) => {
    const userRole = req.role;
    if (userRole !== "ADMIN") {
      throw new ApiError(401, "You are not allowed to create agents");
    }
    const result = await UserService.registerUser(req.body);

    this.sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "A Sub-Agent Registered successfully",
      data: result,
    });
  });

  loginUser = this.catchAsync(async (req: Request, res: Response) => {
    const result = await UserService.loginUser(req.body);

    this.sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User Logged In successfully",
      data: result,
    });
  });
  getAllUsers = this.catchAsync(async (req: Request, res: Response) => {
    const result = await UserService.getAllUsers();

    this.sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User Logged In successfully",
      data: result,
    });
  });
  deleteUser = this.catchAsync(async (req: Request, res: Response) => {
    const userRole = req.role;
    if (userRole !== "ADMIN") {
      throw new ApiError(401, "You are not allowed to create agents");
    }

    const result = await UserService.deleteUser(req.params.id);

    this.sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User deleted successfully",
      data: result,
    });
  });
}

export const UserController = new Controller();
