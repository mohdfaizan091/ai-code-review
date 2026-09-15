import express from "express";
import userRoutes from "./src/routes/userRoutes.js";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import reviewRoutes from "./src/routes/reviewRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import webhookRoutes from "./src/routes/webhookRoutes.js";

connectDB();
const app = express();

// Webhook route FIRST — raw body capture se pehle koi aur JSON parser nahi chalna chahiye
app.use('/webhook/github', express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use('/webhook', webhookRoutes);

// Ab baaki sab global middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ["http://localhost:5173", "https://ai-code-review-olive.vercel.app"],
  credentials: true,
}));

app.use("/v1/api/users", userRoutes);
app.use("/v1/api/auth", authRoutes);
app.use("/v1/api/review", reviewRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});