import { useState } from 'react';
import CodeEditor from '../components/CodeEditor';
import LanguageSelector from '../components/LanguageSelector';
import ReviewPanel from '../components/ReviewPanel';
import { streamReview } from '../services/reviewService';

const HomePage = () => {
  const [code, setCode] = useState('// write your code here');
  const [language, setLanguage] = useState('javascript');
  const [streamingText, setStreamingText] = useState('');
  const [parsedReview, setParsedReview] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const handleReview = async () => {
    setStreamingText('');
    setParsedReview(null);
    setIsStreaming(true);

    await streamReview(
      code,
      language,
      (token) => setStreamingText(prev => prev + token),
      (fullText) => {
        try {
          const clean = fullText.replace(/```json|```/g, "").trim();
          const parsed = JSON.parse(clean);
          setParsedReview(parsed);
        } catch (e) {
          console.error("Parse failed:", e);
        }
        setIsStreaming(false);
      }
    );
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-700">
        <h1 className="text-xl font-semibold">AI Code Review</h1>
        <div className="flex items-center gap-4">
          <LanguageSelector language={language} onChange={setLanguage} />
          <button
            onClick={handleReview}
            disabled={isStreaming}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded-lg"
          >
            {isStreaming ? "Reviewing..." : "Review Code"}
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        <div className="flex-1">
          <CodeEditor code={code} onChange={setCode} language={language} />
        </div>
        <div className="flex-1">
          <ReviewPanel
            streamingText={streamingText}
            parsedReview={parsedReview}
            isStreaming={isStreaming}
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;