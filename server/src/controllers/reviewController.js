import { z } from "zod";
import { streamReview } from "../services/reviewService.js";
import Review from "../models/Review.js";

const reviewSchema = z.object({
    code: z.string().min(1, "Code cannot be empty"),
    language: z.enum(["javascript", "typescript", "python", "java", "cpp"]),
});

export const createReview = async (req, res) => {
    try {
        const { code, language } = reviewSchema.parse(req.body);
        const userId = req.user.userId;

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        await streamReview(code, language, userId, res);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getReviews = async (req, res) => {
    try {
        const userId = req.user.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const reviews = await Review.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('-code');

        const total = await Review.countDocuments({ userId });

        res.status(200).json({
            success: true,
            reviews,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};