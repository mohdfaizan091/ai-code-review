import envConfig from "../config/envConfig.js";

export async function* streamCompletion(prompt) {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${envConfig.GROQ_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            stream: true,
            temperature: 0.2,
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
    }

    if (!response.body) {
        throw new Error("Response body is empty");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = "";

    while (true) {
        const { done, value } = await reader.read();

        if (done) {
            buffer += decoder.decode();
            break;
        }

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
            if (!line.startsWith("data: ")) continue;

            const data = line.slice(6).trim();

            if (data === "[DONE]") {
                return;
            }

            try {
                const parsed = JSON.parse(data);
                const token = parsed.choices?.[0]?.delta?.content;

                if (token) {
                    yield token;
                }
            } catch (err) {
                console.error("Chunk parse error:", err.message);
            }
        }
    }

    // Process any remaining buffered line
    if (buffer.trim().startsWith("data: ")) {
        const data = buffer.trim().slice(6).trim();

        if (data !== "[DONE]") {
            try {
                const parsed = JSON.parse(data);
                const token = parsed.choices?.[0]?.delta?.content;

                if (token) {
                    yield token;
                }
            } catch (err) {
                console.error("Final chunk parse error:", err.message);
            }
        }
    }
}