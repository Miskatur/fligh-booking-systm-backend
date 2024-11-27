import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  mongodb_url: process.env.DATABASE_URL,
  port: process.env.PORT,
};
