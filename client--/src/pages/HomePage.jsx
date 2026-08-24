import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CodeEditor from '../components/CodeEditor';
import ReviewPanel from '../components/ReviewPanel';
import Navbar from '../components/Navbar';
import { streamReview } from '../services/reviewService';
import { useAuth } from '../context/AuthContext';
import { jsonrepair } from 'jsonrepair';

const EXT = { javascript: 'js', typescript: 'ts', python: 'py', java: 'java', cpp: 'cpp' };

// Helper to extract and repair JSON from a string
function extractAndParseJSON(text) {
  if (!text || text.trim() === '') {
    throw new Error('Response is empty');
  }
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}') + 1;
  if (start === -1 || end === 0) {
    throw new Error('No JSON object found in the response');
  }
  let candidate = text.substring(start, end);
  candidate = candidate.replace(/```json|```/g, '').trim();
  try {
    const repaired = jsonrepair(candidate);
    return JSON.parse(repaired);
  } catch {
    return JSON.parse(candidate);
  }
}

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

  // Resizable split
  const containerRef = useRef(null);
  const [editorWidth, setEditorWidth] = useState(() => {
    const saved = sessionStorage.getItem('editorWidth');
    return saved ? Number(saved) : 50;
  });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    sessionStorage.setItem('editorWidth', editorWidth);
  }, [editorWidth]);

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      let pct = ((e.clientX - rect.left) / rect.width) * 100;
      pct = Math.min(75, Math.max(25, pct));
      setEditorWidth(pct);
    };
    const handleMouseUp = () => setIsDragging(false);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Save to sessionStorage
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

    try {
      await streamReview(
        code,
        language,
        (token) => setStreamingText(prev => prev + token),
        (fullText) => {
          try {
            const parsed = extractAndParseJSON(fullText);
            setParsedReview(parsed);
          } catch (e) {
            console.error('Parse failed:', e.message);
            console.error('Raw response:', fullText);
            alert('The AI response could not be understood. Please try again.');
          }
          setIsStreaming(false);
        },
        (message) => {
          setIsStreaming(false);
          setStreamingText((prev) => prev || message);
          alert(message);
        }
      );
    } catch (error) {
      // Catch network or other unexpected errors from streamReview
      console.error('Review failed:', error);
      setIsStreaming(false);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="h-screen bg-[#10131A] text-[#E7E9EE] flex flex-col">
      <Navbar />
      <div className="h-px bg-gradient-to-r from-transparent via-[#E3B341]/25 to-transparent" />

      <div
        ref={containerRef}
        className="flex-1 flex p-5 overflow-hidden"
        style={{ userSelect: isDragging ? 'none' : 'auto' }}
      >
        {/* Editor card */}
        <div
          className="min-w-0 flex flex-col bg-[#171B24] border border-[#2A2F3D] rounded-2xl shadow-2xl shadow-black/30 overflow-hidden"
          style={{ width: `calc(${editorWidth}% - 10px)` }}
        >
          {/* Tab strip */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#20242F]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E2685E]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#E3B341]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#5FBD8A]"></span>
              <span className="ml-2 text-xs font-mono text-[#8B92A5]">review.{EXT[language]}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#5B6274]">
              <span className={`w-1.5 h-1.5 rounded-full ${isStreaming ? 'bg-[#E3B341] animate-pulse' : 'bg-[#5FBD8A]'}`}></span>
              {isStreaming ? 'Analyzing' : 'Ready'}
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 overflow-hidden">
            <CodeEditor code={code} onChange={setCode} language={language} />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#20242F] bg-[#10131A]/40">
            <div className="flex items-center gap-2 rounded-lg px-2 py-1">
              <span className="text-[#8B92A5] text-sm">{'</>'}</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-[#E7E9EE] text-sm focus:outline-none cursor-pointer"
              >
                <option value="javascript" className="bg-[#171B24] text-[#E7E9EE]">JavaScript</option>
                <option value="typescript" className="bg-[#171B24] text-[#E7E9EE]">TypeScript</option>
                <option value="python" className="bg-[#171B24] text-[#E7E9EE]">Python</option>
                <option value="java" className="bg-[#171B24] text-[#E7E9EE]">Java</option>
                <option value="cpp" className="bg-[#171B24] text-[#E7E9EE]">C++</option>
              </select>
            </div>

            <button
              onClick={handleReview}
              disabled={isStreaming}
              className="flex items-center gap-2 bg-[#E3B341] hover:bg-[#EEC565]
                        disabled:opacity-50 disabled:hover:bg-[#E3B341] text-[#1B1500] px-5 py-2
                        rounded-lg text-sm font-medium shadow-lg shadow-[#E3B341]/10
                        hover:shadow-[#E3B341]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>✨</span>
              {isStreaming ? "Reviewing..." : "Review Code"}
            </button>
          </div>
        </div>

        {/* Drag handle */}
        <div
          onMouseDown={() => setIsDragging(true)}
          className="w-5 flex-shrink-0 flex items-center justify-center cursor-col-resize group"
        >
          <div className={`w-1 h-14 rounded-full transition ${isDragging ? 'bg-[#E3B341]' : 'bg-[#2A2F3D] group-hover:bg-[#5B6274]'}`}></div>
        </div>

        <div className="min-w-0" style={{ width: `calc(${100 - editorWidth}% - 10px)` }}>
          <ReviewPanel
            streamingText={streamingText}
            parsedReview={parsedReview}
            isStreaming={isStreaming}
          />
        </div>
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative bg-[#171B24] border border-[#2A2F3D] rounded-2xl p-8 w-full max-w-sm text-center shadow-2xl shadow-black/50">
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 text-[#5B6274] hover:text-[#E7E9EE] text-sm transition"
              aria-label="Close"
            >
              ✕
            </button>
            <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-[#E3B341]/10 border border-[#E3B341]/30 flex items-center justify-center text-2xl">
              🔐
            </div>
            <h2 className="text-[#E7E9EE] text-xl font-bold mb-2">Sign up to review code</h2>
            <p className="text-[#8B92A5] text-sm mb-7">
              Create a free account to get AI-powered code reviews instantly.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPopup(false)}
                className="flex-1 bg-[#1E2330] hover:bg-[#262C3B] border border-[#2A2F3D] text-[#E7E9EE] px-4 py-2.5 rounded-lg text-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={() => navigate('/register')}
                className="flex-1 bg-[#E3B341] hover:bg-[#EEC565] text-[#1B1500] px-4 py-2.5 rounded-lg text-sm font-medium transition"
              >
                Sign Up
              </button>
            </div>
            <p className="text-[#5B6274] text-xs mt-5">
              Already have an account?{' '}
              <span
                onClick={() => navigate('/login')}
                className="text-[#E3B341] cursor-pointer hover:underline"
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