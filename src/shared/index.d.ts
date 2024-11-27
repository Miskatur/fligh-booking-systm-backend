/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      username: string;
      name: string;
      role: string;
      id: string;
    }
  }
}
