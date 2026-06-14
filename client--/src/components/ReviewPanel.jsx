const ScoreBadge = ({ score }) => {
  const color = score >= 8 ? 'bg-green-500' : score >= 5 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className={`${color} text-white text-2xl font-bold w-16 h-16 rounded-full flex items-center justify-center`}>
      {score}/10
    </div>
  );
};

const SeverityBadge = ({ severity }) => {
  const colors = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-blue-500',
  };
  return (
    <span className={`${colors[severity]} text-white text-xs px-2 py-1 rounded-full`}>
      {severity}
    </span>
  );
};

const ReviewPanel = ({ streamingText, parsedReview, isStreaming }) => {
  return (
    <div className="h-full bg-gray-800 rounded-lg p-4 overflow-auto">

      {/* Empty state */}
      {!parsedReview && !isStreaming && (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>Paste your code and click "Review Code"</p>
        </div>
      )}

      {/* Streaming state */}
      {isStreaming && (
        <div>
          <div className="flex items-center gap-2 text-blue-400 mb-4">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span>Analyzing your code...</span>
          </div>
          <pre className="text-gray-400 text-xs whitespace-pre-wrap font-mono opacity-50">
            {streamingText}
          </pre>
        </div>
      )}

      {/* Parsed review */}
      {parsedReview && !isStreaming && (
        <div className="space-y-6">

          {/* Score + Summary */}
          <div className="flex items-start gap-4">
            <ScoreBadge score={parsedReview.overall_score} />
            <p className="text-gray-300 text-sm flex-1">{parsedReview.summary}</p>
          </div>

          {/* Issues */}
          {parsedReview.issues?.length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-2">Issues</h3>
              <div className="space-y-2">
                {parsedReview.issues.map((issue, i) => (
                  <div key={i} className="bg-gray-700 rounded-lg p-3 flex items-start gap-3">
                    <SeverityBadge severity={issue.severity} />
                    <div>
                      <p className="text-gray-300 text-sm">{issue.message}</p>
                      <p className="text-gray-500 text-xs mt-1">Line {issue.line}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {parsedReview.suggestions?.length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-2">Suggestions</h3>
              <div className="space-y-2">
                {parsedReview.suggestions.map((suggestion, i) => (
                  <div key={i} className="bg-gray-700 rounded-lg p-3">
                    <p className="text-gray-300 text-sm">{suggestion.description}</p>
                    <pre className="text-green-400 text-xs mt-2 bg-gray-800 p-2 rounded overflow-auto">
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