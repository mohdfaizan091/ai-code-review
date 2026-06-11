import express from "express";
import userRoutes from "./src/routes/userRoutes.js";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import cookieParser from "cookie-parser";


//DATABASE CONNECTION 
connectDB();

const app = express();

//Middleware
app.use(express.json());
app.use(cookieParser());


//Routes
app.use("/v1/api/users", userRoutes);
app.use("/v1/api/auth", authRoutes);


//PORT
const PORT = process.env.PORT || 3000;

//server Start
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});