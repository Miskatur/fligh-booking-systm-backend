import { NextFunction, Request, Response } from "express";
import { JwtPayload, Secret } from "jsonwebtoken";
import ApiError from "./error";
import JwtHelpers from "../shared/jsonWebTokenHelpers";

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;
  if (token) {
    const isVerified: JwtPayload | null | any = JwtHelpers.verifyToken(
      token,
      process.env.JWT_ACCESS_TOKEN_SECRET as Secret
    );
    if (!isVerified) {
      throw new ApiError(409, "Invalid token");
    } else {
      req.username = isVerified.username;
      req.role = isVerified.role;
      req.name = isVerified.name;
      req.id = isVerified.id;
      next();
    }
  } else {
    throw new ApiError(409, "Token not found");
  }
};

export default verifyToken;
