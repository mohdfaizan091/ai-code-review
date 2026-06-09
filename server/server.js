import express from "express";
import userRoutes from "./src/routes/userRoutes.js";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";

connectDB();

const app = express();
app.use(express.json());
app.use("/v1/api/users", userRoutes);
app.use("/v1/api/auth", authRoutes);

const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});