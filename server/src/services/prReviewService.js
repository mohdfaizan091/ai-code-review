import { streamCompletion } from "../providers/groqProvider.js";
import { extractAndParseJSON } from "../utils/aiResponseParser.js";
import { findRelevantContext } from "./ragService.js";
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

function buildDiffPrompt(files, contextChunks) {
  const fileBlocks = files
    .filter(f => f.patch)
    .map(f => `### File: ${f.filename}\n\`\`\`diff\n${f.patch}\n\`\`\``)
    .join("\n\n");

  const contextBlock = contextChunks.length > 0
    ? `\n\nHere is related code already in the repository (for context — check for duplication or inconsistency, do not review this code itself):\n\n` +
      contextChunks.map(c => `### Existing file: ${c.path}\n\`\`\`\n${c.content}\n\`\`\``).join("\n\n")
    : "";

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

If related existing code (given below) already does something similar to the new code, flag it as a "medium" or "high" issue mentioning possible duplication.

${fileBlocks}${contextBlock}`;
}

export async function reviewPRDiff(files, relatedFiles = []) {
  const combinedDiffText = files.filter(f => f.patch).map(f => f.patch).join("\n");
  const contextChunks = await findRelevantContext(combinedDiffText, relatedFiles);

  const prompt = buildDiffPrompt(files, contextChunks);
  let fullResponse = "";

  for await (const token of streamCompletion(prompt)) {
    fullResponse += token;
  }
  
  const parsed = extractAndParseJSON(fullResponse);
  const validated = prReviewSchema.parse(parsed);
  return validated;
}