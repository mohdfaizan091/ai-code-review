import { useState } from 'react';
import CodeEditor from '../components/CodeEditor';
import LanguageSelector from '../components/LanguageSelector';
import ReviewPanel from '../components/ReviewPanel';
import { streamReview } from '../services/reviewService';

const HomePage = () => {
  const [code, setCode] = useState('// write your code here');
  const [language, setLanguage] = useState('javascript');
  const [review, setReview] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const handleReview = async () => {
    setReview('');
    setIsStreaming(true);

    await streamReview(
      code,
      language,
      (token) => setReview(prev => prev + token),
      () => setIsStreaming(false)
    );
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      
      {/* Header */}
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

      {/* Main — Editor + Review Panel */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        <div className="flex-1">
          <CodeEditor
            code={code}
            onChange={setCode}
            language={language}
          />
        </div>
        <div className="flex-1">
          <ReviewPanel review={review} isStreaming={isStreaming} />
        </div>
      </div>

    </div>
  );
};

export default HomePage;