import { generateReview } from "../services/reviewService.js";

export const createReview = async (req, res) => {
    try {
        const { code, language } = req.body;
        const userId = req.user.userId;

        // coming soon — SSE streaming
        res.status(200).json({ message: "Review API working", code, language });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};