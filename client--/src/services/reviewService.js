const API_URL = import.meta.env.VITE_API_URL || '';

export const streamReview = async (code, language, onToken, onComplete) => {
    const response = await fetch(`${API_URL}/v1/api/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
        credentials: 'include',
    });
  
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = ''; 
  
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
  
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '));
  
        for (const line of lines) {
            const data = line.replace('data: ', '');
            if (data === '[DONE]') {
                onComplete(fullText);  
                return;
            }
            try {
                const parsed = JSON.parse(data);
                if (parsed.token) {
                    fullText += parsed.token; 
                    onToken(parsed.token);
                }
            } catch (e) {
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