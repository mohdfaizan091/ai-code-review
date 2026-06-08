import express from "express";
import userRoutes from "./src/routes/userRoutes.js";

const app = express();
// app.use(express.json());
app.use("/v1/api/users", userRoutes);

const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});