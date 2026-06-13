import { z } from "zod";
import { generateReview } from "../services/reviewService.js";

const reviewSchema = z.object({
    code: z.string().min(1, "Code cannot be empty"),
    language: z.enum(["javascript", "typescript", "python", "java", "cpp"]),
});

export const createReview = async (req, res) => {
    try {
        const { code, language } = reviewSchema.parse(req.body);
        const userId = req.user.userId;

        const review = await generateReview(code, language);

        res.status(200).json({ success: true, review });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};