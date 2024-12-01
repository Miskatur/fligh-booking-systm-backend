import { Request, Response } from "express";
import BaseController from "../../shared/baseController";
import { UserService } from "./user.service";
import ApiError from "../../middleware/error";

class Controller extends BaseController {
  registerUser = this.catchAsync(async (req: Request, res: Response) => {
    const result = await UserService.registerUser(req.body);

    this.sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "A User Registered successfully",
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
  changePassword = this.catchAsync(async (req: Request, res: Response) => {
    const user_id = req.id;
    const result = await UserService.changePassword(user_id, req.body);

    this.sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Password changed successfully",
      data: result,
    });
  });
  updateUser = this.catchAsync(async (req: Request, res: Response) => {
    const user_id = req.id;
    const result = await UserService.updateUser(user_id, req.body);

    this.sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Profile updated successfully",
      data: result,
    });
  });
}

export const UserController = new Controller();
