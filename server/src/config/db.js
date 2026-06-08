// database connection
import mongoose from "mongoose";
import envConfig from "./envConfig.js";

const connectDB = async () => {
  try {
    await mongoose.connect(envConfig.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default connectDB;