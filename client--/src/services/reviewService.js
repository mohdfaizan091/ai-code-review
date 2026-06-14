export const streamReview = async (code, language, onToken, onComplete) => {
  const response = await fetch('/v1/api/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language }),
      credentials: 'include',
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

      for (const line of lines) {
          const data = line.replace('data: ', '');
          if (data === '[DONE]') {
              onComplete();
              return;
          }
          try {
              const parsed = JSON.parse(data);
              if (parsed.token) {
                  onToken(parsed.token);
              }
          } catch (e) {
              // skip
          }
      }
  }
};