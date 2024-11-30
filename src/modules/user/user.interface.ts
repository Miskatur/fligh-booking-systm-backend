import { Document } from "mongoose";

export type IUser = {
  name: string;
  phone: string;
  email: string;
  password: string;
  role: "ADMIN" | "USER";
} & Document;
