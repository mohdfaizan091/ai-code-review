import ScoreBadge from './ScoreBadge';
import SeverityBadge from './SeverityBadge';

const ReviewPanel = ({ streamingText, parsedReview, isStreaming }) => {
  return (
    <div className="h-full bg-[#171B24] border border-[#2A2F3D] rounded-2xl shadow-2xl shadow-black/30 p-4 overflow-auto">

      {/* Empty state */}
      {!parsedReview && !isStreaming && (
        <div className="flex flex-col items-center justify-center h-full text-[#5B6274] gap-3">
          <div className="text-4xl">👨‍💻</div>
          <p className="text-sm">Paste your code and click "Review Code"</p>
        </div>
      )}

      {/* Streaming state */}
      {isStreaming && (
        <div>
          <div className="flex items-center gap-2 text-[#E3B341] mb-4">
            <div className="w-2 h-2 bg-[#E3B341] rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Analyzing your code...</span>
          </div>
          <pre className="text-[#5B6274] text-xs whitespace-pre-wrap font-mono">
            {streamingText}
          </pre>
        </div>
      )}

      {/* Parsed review */}
      {parsedReview && !isStreaming && (
        <div className="space-y-6">

          {/* Score + Summary */}
          <div className="flex items-start gap-4 bg-[#1E2330] border border-[#2A2F3D] rounded-lg p-4">
            <ScoreBadge score={parsedReview.overall_score} />
            <div>
              <p className="text-[#E7E9EE] text-xs font-semibold uppercase tracking-wide mb-1">Summary</p>
              <p className="text-[#B9C4D6] text-sm">{parsedReview.summary}</p>
            </div>
          </div>

          {/* Issues */}
          {parsedReview.issues?.length > 0 && (
            <div>
              <h3 className="text-[#E7E9EE] font-semibold mb-3 flex items-center gap-2">
                🔴 Issues
                <span className="text-xs bg-[#1E2330] border border-[#2A2F3D] px-2 py-0.5 rounded-full text-[#8B92A5]">
                  {parsedReview.issues.length}
                </span>
              </h3>
              <div className="space-y-2">
                {parsedReview.issues.map((issue, i) => (
                  <div key={i} className="bg-[#1E2330] border border-[#2A2F3D] rounded-lg p-3 flex items-start gap-3">
                    <SeverityBadge severity={issue.severity} />
                    <div>
                      <p className="text-[#B9C4D6] text-sm">{issue.message}</p>
                      <p className="text-[#5B6274] text-xs mt-1">Line {issue.line}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {parsedReview.suggestions?.length > 0 && (
            <div>
              <h3 className="text-[#E7E9EE] font-semibold mb-3 flex items-center gap-2">
                💡 Suggestions
                <span className="text-xs bg-[#1E2330] border border-[#2A2F3D] px-2 py-0.5 rounded-full text-[#8B92A5]">
                  {parsedReview.suggestions.length}
                </span>
              </h3>
              <div className="space-y-2">
                {parsedReview.suggestions.map((suggestion, i) => (
                  <div key={i} className="bg-[#1E2330] border border-[#2A2F3D] rounded-lg p-3">
                    <p className="text-[#B9C4D6] text-sm">{suggestion.description}</p>
                    <pre className="text-[#5FBD8A] text-xs mt-2 bg-[#10131A] p-2 rounded overflow-auto">
                      {suggestion.fix}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default ReviewPanel;