import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        required: true,
    },
    feedback: {
        issues: Array,
        suggestions: Array,
        overall_score: Number,
        summary: String,
    },
}, { timestamps: true });

const Review = mongoose.model("Review", reviewSchema);

export default Review;