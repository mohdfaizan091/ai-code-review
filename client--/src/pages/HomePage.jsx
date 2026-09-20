import { useState, useEffect, useRef } from 'react';
import CodeEditor from '../components/CodeEditor';
import ReviewPanel from '../components/ReviewPanel';
import Navbar from '../components/Navbar';
import { streamReview } from '../services/reviewService';
import { jsonrepair } from 'jsonrepair';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
  const [reviewError, setReviewError] = useState('');
  const editorRef = useRef(null);
  const [expandedPane, setExpandedPane] = useState(null);
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

  useEffect(() => {
    if (!expandedPane) return undefined;
    const closeOnEscape = (event) => event.key === 'Escape' && setExpandedPane(null);
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [expandedPane]);

  const handleReview = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (isStreaming || !code.trim()) {
      if (!code.trim()) setReviewError('Paste some code before starting a review.');
      return;
    }

    setStreamingText('');
    setParsedReview(null);
    setReviewError('');
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
            setReviewError('The response could not be understood. Try the review again.');
          }
          setIsStreaming(false);
        },
        (message) => {
          setIsStreaming(false);
          setStreamingText((prev) => prev || 'The stream stopped before completing.');
          setReviewError(message || 'The stream stopped before completing.');
        }
      );
    } catch (error) {
      // Catch network or other unexpected errors from streamReview
      console.error('Review failed:', error);
      setIsStreaming(false);
      setReviewError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#08111F] text-[#E5EDF9] flex flex-col">
      <Navbar />
      <div className="h-px bg-gradient-to-r from-transparent via-[#38BDF8]/35 to-transparent" />

      <div
        ref={containerRef}
        className="review-workspace flex-1 grid p-4 md:p-5 overflow-hidden"
        style={{ userSelect: isDragging ? 'none' : 'auto' }}
      >
        {/* Editor card */}
        <div
          className={`editor-card min-w-0 flex flex-col card overflow-hidden ${expandedPane === 'editor' ? 'pane-expanded' : ''}`}
          style={{ '--editor-width': `${editorWidth}%` }}
        >
          {/* Tab strip */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#20242F]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E2685E]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#5FBD8A]"></span>
              <span className="ml-2 text-xs font-mono text-[#8B92A5]">review.{EXT[language]}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#5B6274]">
              <span className={`w-1.5 h-1.5 rounded-full ${isStreaming ? 'bg-[#38BDF8] animate-pulse' : 'bg-[#5FBD8A]'}`}></span>
              <span className="hidden sm:inline">{isStreaming ? 'Analyzing' : 'Ready'}</span>
              <button className="pane-toggle" onClick={() => setExpandedPane(expandedPane === 'editor' ? null : 'editor')} aria-label={expandedPane === 'editor' ? 'Exit expanded code editor' : 'Expand code editor'} title={expandedPane === 'editor' ? 'Exit fullscreen (Esc)' : 'Expand editor'}>
                {expandedPane === 'editor' ? '×' : '⛶'}
              </button>
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 overflow-hidden">
            <CodeEditor ref={editorRef} code={code} onChange={setCode} language={language} onSubmit={handleReview} />
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
              className="button button-primary"
            >
              <span aria-hidden="true">{isStreaming ? '◌' : '✦'}</span>
              {isStreaming ? 'Reviewing…' : 'Review Code'} <span className="hidden sm:inline text-xs opacity-70">⌘↵</span>
            </button>
          </div>
        </div>

        {/* Drag handle is desktop-only; mobile stacks the workflow. */}
        <div
          onMouseDown={() => setIsDragging(true)}
          className="review-divider hidden md:flex w-5 flex-shrink-0 items-center justify-center cursor-col-resize group"
        >
          <div className={`w-1 h-14 rounded-full transition ${isDragging ? 'bg-[#38BDF8]' : 'bg-[#263A57] group-hover:bg-[#5B7898]'}`}></div>
        </div>

        <div className={`results-column min-w-0 ${expandedPane === 'results' ? 'pane-expanded' : ''}`} style={{ '--results-width': `${100 - editorWidth}%` }}>
          <ReviewPanel
            streamingText={streamingText}
            parsedReview={parsedReview}
            isStreaming={isStreaming}
            error={reviewError}
            onRetry={handleReview}
            onRevealLine={(line) => editorRef.current?.revealLine(line)}
            isExpanded={expandedPane === 'results'}
            onToggleExpand={() => setExpandedPane(expandedPane === 'results' ? null : 'results')}
          />
        </div>
      </div>
      {expandedPane && <button className="pane-backdrop" aria-label="Close expanded view" onClick={() => setExpandedPane(null)} />}
    </div>
  );
};

export default HomePage;
