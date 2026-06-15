import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { createReview, getReviews } from "../controllers/reviewController.js";

const router = express.Router();


//get api
router.get("/", authMiddleware, getReviews);

// POST /api/reviews
router.post("/", authMiddleware, createReview);

export default router;