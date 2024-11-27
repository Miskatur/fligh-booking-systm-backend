import mongoose from "mongoose";
import config from ".";
import { TicketService } from "../modules/tickets/tickets.service";

const databaseConnection = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongodb_url as string, {
      dbName: "mayan_world",
    });
    console.log("MongoDB Connected Successfully!");
  } catch (error) {
    console.error(`Failed to connect to MongoDB ${error}`);
  }
};

export default databaseConnection;
