import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();
const envSchema = z.object({
  MONGO_URI: z.string().min(1, "MONGO_URI is required"),
  PORT: z.string().default("3000"),
});

const envConfig = envSchema.parse(process.env);

export default envConfig;