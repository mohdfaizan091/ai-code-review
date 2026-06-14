import { z } from "zod";
import { streamReview } from "../services/reviewService.js";

const reviewSchema = z.object({
    code: z.string().min(1, "Code cannot be empty"),
    language: z.enum(["javascript", "typescript", "python", "java", "cpp"]),
});

export const createReview = async (req, res) => {
    try {
        const { code, language } = reviewSchema.parse(req.body);
        const userId = req.user.userId;

        // SSE headers
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        // stream shuru karo
        await streamReview(code, language, res);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};