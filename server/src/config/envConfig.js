import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  MONGO_URI: z.string().min(1, "MONGO_URI is required"),
  PORT: z.string().default("3000"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  GROQ_API_KEY: z.string().min(1, "GROQ_API_KEY is required"),
});

const envConfig = envSchema.parse(process.env);

export default envConfig;