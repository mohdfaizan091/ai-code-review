import envConfig from "../config/envConfig.js";

export async function* streamCompletion(prompt) {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${envConfig.GROQ_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "openai/gpt-oss-20b",
            stream: true,
            temperature: 0.2,
            max_tokens: 4096,
            messages: [ { role: "user", content: prompt } ],
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API error: ${response.status} - ${errorText}`);
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
            if (data === "[DONE]") return;

            try {
                const parsed = JSON.parse(data);
                if (parsed.error) {
                    throw new Error(`Groq API stream error: ${parsed.error.message || JSON.stringify(parsed.error)}`);
                }

                const token = parsed.choices?.[0]?.delta?.content;
                if (token) {
                    yield token;
                }
            } catch (err) {
                if (err.message.startsWith("Groq API stream error")) {
                    throw err;
                }
            }
        }
    }

    if (buffer.trim().startsWith("data: ")) {
        const data = buffer.trim().slice(6).trim();
        if (data !== "[DONE]") {
            try {
                const parsed = JSON.parse(data);
                if (parsed.error) {
                    throw new Error(`Groq API stream error: ${parsed.error.message || JSON.stringify(parsed.error)}`);
                }
                const token = parsed.choices?.[0]?.delta?.content;
                if (token) yield token;
            } catch (err) {
                if (err.message.startsWith("Groq API stream error")) throw err;
            }
        }
    }
}