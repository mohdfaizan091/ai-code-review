import { streamCompletion } from "../providers/groqProvider.js";
import { extractAndParseJSON } from "../utils/aiResponseParser.js";
import { z } from "zod";

const prReviewSchema = z.object({
  files: z.array(z.object({
    filename: z.string(),
    issues: z.array(z.object({
      line: z.number(),
      severity: z.enum(["high", "medium", "low"]),
      message: z.string(),
    })),
  })),
  summary: z.string(),
});

function buildDiffPrompt(files) {
  const fileBlocks = files
    .filter(f => f.patch) // kuch files (binary, renamed) mein patch nahi hota
    .map(f => `### File: ${f.filename}\n\`\`\`diff\n${f.patch}\n\`\`\``)
    .join("\n\n");

  return `You are an expert code reviewer reviewing a GitHub Pull Request diff. For each file below, review only the changed lines (marked with + or -) and respond **only** with a valid JSON object matching this exact structure:

{
  "files": [
    {
      "filename": "<exact filename as given>",
      "issues": [
        { "line": <line number in the new file, as shown after the @@ hunk header>, "severity": "high" | "medium" | "low", "message": "<description>" }
      ]
    }
  ],
  "summary": "<2-3 sentence overview of the whole PR>"
}

Only flag genuine issues (bugs, security risks, bad practices). If a file has no issues, include it with an empty issues array. Do not include any text outside the JSON.

${fileBlocks}`;
}

export async function reviewPRDiff(files) {
  const prompt = buildDiffPrompt(files);
  let fullResponse = "";

  for await (const token of streamCompletion(prompt)) {
    fullResponse += token; // yaha res.write nahi kar rahe — koi client sun nahi raha, ye background job hai
  }

  const parsed = extractAndParseJSON(fullResponse);
  const validated = prReviewSchema.parse(parsed);
  return validated;
}