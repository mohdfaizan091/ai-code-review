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
      // fallback
    }
    if (typeof onError === 'function') onError(message);
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
      const data = line.replace('data: ', '').trim();
      if (data === '[DONE]') {
        // Normal completion: call onComplete with accumulated text
        onComplete(fullText);
        return;
      }

      try {
        const parsed = JSON.parse(data);

        // 🛑 If we get an error event, stop immediately
        if (parsed.status === 'error') {
          if (typeof onError === 'function') {
            onError(parsed.message);
          }
          return; // ⬅️ exit the function, don't continue
        }

        if (parsed.status === 'success') {
          // Success event (optional, we already have tokens)
          continue;
        }

        if (parsed.token) {
          fullText += parsed.token;
          onToken(parsed.token);
        }
      } catch {
        // Skip malformed lines (should not happen)
      }
    }
  }

  // If the loop exits without [DONE] (should not happen), still call onComplete
  onComplete(fullText);
};

export const getReviews = async () => {
  const response = await fetch(`${API_URL}/v1/api/review`, {
    method: 'GET',
    credentials: 'include',
  });
  const data = await response.json();
  return data;
};