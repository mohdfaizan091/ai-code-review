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

export const streamReview = async (code, language, res) => {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${envConfig.GROQ_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            stream: true,
            messages: [
                {
                    role: "user",
                    content: buildPrompt(code, language),
                }
            ],
        }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter(line => line.startsWith("data: "));

        for (const line of lines) {
            const data = line.replace("data: ", "");
            if (data === "[DONE]") {
                res.write("data: [DONE]\n\n");
                res.end();
                return;
            }

            try {
                const parsed = JSON.parse(data);
                const token = parsed.choices[0]?.delta?.content;
                if (token) {
                    res.write(`data: ${JSON.stringify({ token })}\n\n`);
                }
            } catch (e) {
                // skip malformed chunks
            }
        }
    }
};