import express from "express";
import userRoutes from "./src/routes/userRoutes.js";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import reviewRoutes from "./src/routes/reviewRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";


//DATABASE CONNECTION 
connectDB();

const app = express();

//Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));


//Routes
app.use("/v1/api/users", userRoutes);
app.use("/v1/api/auth", authRoutes);
app.use("/v1/api/review", reviewRoutes);


//PORT
const PORT = process.env.PORT || 3000;

//server Start
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});