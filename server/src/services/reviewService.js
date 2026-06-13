import envConfig from "../config/envConfig.js";

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

Code to review:
\`\`\`${language}
${code}
\`\`\``;
};

export const generateReview = async (code, language) => {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${envConfig.GROQ_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "user",
                    content: buildPrompt(code, language),
                }
            ],
        }),
    });

    const data = await response.json();
    const rawText = data.choices[0].message.content;

    const clean = rawText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return parsed;
};