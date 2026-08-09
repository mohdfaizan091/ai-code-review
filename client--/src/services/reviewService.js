const API_URL = import.meta.env.VITE_API_URL || '';

export const streamReview = async (code, language, onToken, onComplete, onError) => {
    const response = await fetch(`${API_URL}/v1/api/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
        credentials: 'include',
    });

    if (!response.ok) {
        let message = 'Unable to request a review right now.';
        try {
            const payload = await response.json();
            message = payload.message || message;
        } catch {
            try {
                const fallback = await response.text();
                if (fallback) {
                    message = fallback;
                }
            } catch {
                // no-op: body is not JSON and cannot be parsed safely
            }
        }

        if (typeof onError === 'function') {
            onError(message);
        } else {
            throw new Error(message);
        }

        return;
    }

    if (!response.body) {
        throw new Error('The review response body is empty.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.replace('data: ', '');
            if (data === '[DONE]') {
                onComplete(fullText);
                return;
            }

            try {
                const parsed = JSON.parse(data);

                if (parsed.status === 'error') {
                    if (typeof onError === 'function') {
                        onError(parsed.message);
                    }
                    continue;
                }

                if (parsed.status === 'success') {
                    continue;
                }

                if (parsed.token) {
                    fullText += parsed.token;
                    onToken(parsed.token);
                }
            } catch {
                // skip
            }
        }
    }
};

export const getReviews = async () => {
    const response = await fetch(`${API_URL}/v1/api/review`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json();
    return data;
};