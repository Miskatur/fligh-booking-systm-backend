import { Document } from "mongoose";

export type IUser = {
  name: string;
  location: string;
  phone: string;
  username: string;
  password: string;
  role: string;
} & Document;
