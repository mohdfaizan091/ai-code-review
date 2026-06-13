import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { createReview } from "../controllers/reviewController.js";

const router = express.Router();

// POST /api/reviews
router.post("/", authMiddleware, createReview);

export default router;