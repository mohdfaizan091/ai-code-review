import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CodeEditor from '../components/CodeEditor';
import ReviewPanel from '../components/ReviewPanel';
import Navbar from '../components/Navbar';
import { streamReview } from '../services/reviewService';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const [code, setCode] = useState(() => sessionStorage.getItem('code') || '');
  const [language, setLanguage] = useState(() => sessionStorage.getItem('language') || 'javascript');
  const [streamingText, setStreamingText] = useState('');
  const [parsedReview, setParsedReview] = useState(() => {
    const saved = sessionStorage.getItem('parsedReview');
    return saved ? JSON.parse(saved) : null;
  });
  const [isStreaming, setIsStreaming] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // sessionStorage 
  useEffect(() => {
    sessionStorage.setItem('code', code);
  }, [code]);

  useEffect(() => {
    sessionStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    if (parsedReview) {
      sessionStorage.setItem('parsedReview', JSON.stringify(parsedReview));
    }
  }, [parsedReview]);

  const handleReview = async () => {
    if (!user) {
      setShowPopup(true);
      return;
    }

    if (!code.trim()) {
      alert('Please paste your code first!');
      return;
    }

    setStreamingText('');
    setParsedReview(null);
    sessionStorage.removeItem('parsedReview');
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
      },
      (message) => {
        setIsStreaming(false);
        setStreamingText((prev) => prev || message);
        alert(message);
      }
    );
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      
      <Navbar />

      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex items-center justify-between bg-gray-800 
              rounded-lg px-3 py-2 border border-gray-700">

            {/* // Language selector */}

            <div className="flex items-center gap-2 bg-gray-900 rounded-lg px-3 py-1.5">
              <span className="text-gray-400 text-sm">{'</>'}</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-white text-sm focus:outline-none cursor-pointer">
                <option value="javascript" className="bg-gray-800 text-white">JavaScript</option>
                <option value="typescript" className="bg-gray-800 text-white">TypeScript</option>
                <option value="python" className="bg-gray-800 text-white">Python</option>
                <option value="java" className="bg-gray-800 text-white">Java</option>
                <option value="cpp" className="bg-gray-800 text-white">C++</option>
              </select>
            </div>

            {/* // review code button */}
            
            <button
              onClick={handleReview}
              disabled={isStreaming}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 
                        disabled:opacity-50 text-white px-4 py-2 
                        rounded-lg text-sm font-medium transition">
              <span>✨</span>
              {isStreaming ? "Reviewing..." : "Review Code"}
            </button>

          </div>

          <div className="flex-1">
            <CodeEditor code={code} onChange={setCode} language={language} />
          </div>
        </div>
        <div className="flex-1">
          <ReviewPanel
            streamingText={streamingText}
            parsedReview={parsedReview}
            isStreaming={isStreaming} />
        </div>
      </div>

        {showPopup && (
          <div className="fixed inset-0 bg-black/60 flex items-center 
              justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-8 w-full max-w-sm text-center">
              <div className="text-4xl mb-4">🔐</div>
              <h2 className="text-white text-xl font-bold mb-2">Sign up to review code</h2>
              <p className="text-gray-400 text-sm mb-6">
                Create a free account to get AI-powered code reviews instantly.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPopup(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-2 
                            rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 
                            rounded-lg text-sm"
                >
                  Sign Up
                </button>
              </div>
              <p className="text-gray-500 text-xs mt-4">
                Already have an account?{' '}
                <span
                  onClick={() => navigate('/login')}
                  className="text-blue-400 cursor-pointer hover:underline"
                >
                  Sign In
                </span>
              </p>
            </div>
          </div>
        )}

    </div>
  );
};

export default HomePage;