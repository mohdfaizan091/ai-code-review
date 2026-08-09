import { streamCompletion } from "../providers/groqProvider.js";
import Review from "../models/Review.js";


import { z } from "zod";

const reviewResponseSchema = z.object({
    issues: z.array(z.object({
        line: z.number(),
        severity: z.enum(["high", "medium", "low"]),
        message: z.string(),
    })),
    suggestions: z.array(z.object({
        description: z.string(),
        fix: z.string(),
    })),
    overall_score: z.number().min(0).max(10),
    summary: z.string(),
});

const buildPrompt = (code, language) => {
    return `You are an expert code reviewer. Review the following ${language} code and respond ONLY with a JSON object — no markdown, no explanation, just raw JSON.

The JSON must follow this exact structure:
{
  "issues": [
    { "line": <number>, "severity": "high" | "medium" | "low", "message": "<description>" }
  ],
  "suggestions": [
    { "description": "<what to improve>", "fix": "<how to fix it>" }
  ],
  "overall_score": <number between 0-10>,
  "summary": "<2-3 sentence plain text overview>"
}

Here is an example of a correctly formatted response for a small JavaScript snippet:

Example input code:
\`\`\`javascript
function add(a, b) {
    return a + b
}
\`\`\`

Example output:
{
  "issues": [
    { "line": 2, "severity": "low", "message": "Missing semicolon after return statement" }
  ],
  "suggestions": [
    { "description": "Add JSDoc comments for better documentation", "fix": "Add a /** ... */ comment block above the function describing parameters and return value" }
  ],
  "overall_score": 8,
  "summary": "The function is simple and correct but lacks documentation and consistent semicolon usage."
}

Respond with ONLY valid, parseable JSON. Ensure all strings use double quotes and there are no trailing commas.

Code to review:
\`\`\`${language}
${code}
\`\`\``;
};

export const streamReview = async (code, language, userId, res) => {
    const prompt = buildPrompt(code, language);
    let fullResponse = "";

    try {
        for await (const token of streamCompletion(prompt)) {
            fullResponse += token;
            res.write(`data: ${JSON.stringify({ token })}\n\n`);
        }

        // stream complete — save to DB
        try {
            const clean = fullResponse.replace(/```json|```/g, "").trim();
            const parsed = JSON.parse(clean);
            const validated = reviewResponseSchema.parse(parsed);

            await Review.create({ userId, code, language, feedback: parsed });

            res.write(`data: ${JSON.stringify({ status: "success" })}\n\n`);
        } catch (e) {
            console.error("Failed to save review:", e.message);
            res.write(`data: ${JSON.stringify({ status: "error", message: "AI response could not be validated. Please try again." })}\n\n`);
        }
    } catch (error) {
        console.error("Review streaming failed:", error.message);
        res.write(`data: ${JSON.stringify({ status: "error", message: error.message || "The review service could not complete the request." })}\n\n`);
    }

    res.write("data: [DONE]\n\n");
    res.end();
};
