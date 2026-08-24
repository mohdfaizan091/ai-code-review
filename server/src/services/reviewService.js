import { streamCompletion } from "../providers/groqProvider.js";
import Review from "../models/Review.js";
import { z } from "zod";
import { jsonrepair } from "jsonrepair";

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

function extractAndParseJSON(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}') + 1;
  if (start === -1 || end === 0) throw new Error('No JSON object found');
  let candidate = text.substring(start, end);
  candidate = candidate.replace(/```json|```/g, '').trim();
  try {
    const repaired = jsonrepair(candidate);
    return JSON.parse(repaired);
  } catch {
    return JSON.parse(candidate);
  }
}

function normalizeReviewData(data) {
  if (Array.isArray(data.issues) && data.issues.length > 0 && typeof data.issues[0] === 'string') {
    data.issues = data.issues.map((message, index) => ({
      line: 0,
      severity: "medium",
      message: message,
    }));
  }
  if (Array.isArray(data.suggestions) && data.suggestions.length > 0 && typeof data.suggestions[0] === 'string') {
    data.suggestions = data.suggestions.map((description) => ({
      description: description,
      fix: "",
    }));
  }
  return data;
}

const buildPrompt = (code, language) => {
  return `You are an expert code reviewer. Review the following ${language} code and respond **only** with a valid JSON object that matches this exact structure:

{
  "issues": [
    { "line": <number>, "severity": "high" | "medium" | "low", "message": "<description>" }
  ],
  "suggestions": [
    { "description": "<what to improve>", "fix": "<how to fix it>" }
  ],
  "overall_score": <number between 0 and 10>,
  "summary": "<2-3 sentence plain text overview>"
}

**Do not include any additional text, markdown, or code fences.** The response must be pure JSON.

Example of correct output for a JavaScript function:
{
  "issues": [
    { "line": 2, "severity": "low", "message": "Missing semicolon." }
  ],
  "suggestions": [
    { "description": "Add JSDoc comments.", "fix": "Add a /** ... */ block above the function." }
  ],
  "overall_score": 8,
  "summary": "Good function but lacks documentation."
}

Now review this code and output **only the JSON** (no other text):

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

        if (!fullResponse.trim().endsWith('}')) {
          res.write(`data: ${JSON.stringify({ status: "error", message: "AI response was truncated. Please try again with shorter code." })}\n\n`);
          res.write("data: [DONE]\n\n");
          res.end();
          return;
        }
        try {
            const parsed = extractAndParseJSON(fullResponse);
            const normalized = normalizeReviewData(parsed);
            const validated = reviewResponseSchema.parse(normalized);
            await Review.create({ userId, code, language, feedback: validated });
            res.write(`data: ${JSON.stringify({ status: "success" })}\n\n`);
        } catch (e) {
            res.write(`data: ${JSON.stringify({ status: "error", message: "AI response could not be validated. Please try again." })}\n\n`);
        }
    } catch (error) {
        res.write(`data: ${JSON.stringify({ status: "error", message: error.message || "The review service could not complete the request." })}\n\n`);
    }

    res.write("data: [DONE]\n\n");
    res.end();
};