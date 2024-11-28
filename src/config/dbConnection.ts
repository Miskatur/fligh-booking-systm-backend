import mongoose from "mongoose";
import config from ".";

const databaseConnection = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongodb_url as string, {
      dbName: "flight-booking-system",
    });
    console.log("MongoDB Connected Successfully!");
  } catch (error) {
    console.error(`Failed to connect to MongoDB ${error}`);
  }
};

export default databaseConnection;
