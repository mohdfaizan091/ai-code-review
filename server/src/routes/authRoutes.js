//auth routes
import express from "express";
import { register, login, getMe } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

//Middleware
router.get("/me", authMiddleware, getMe);

router.post("/register", register);
router.post("/login", login);

export default router;