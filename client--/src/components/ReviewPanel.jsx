const ReviewPanel = ({ review, isStreaming }) => {
    return (
      <div className="h-full bg-gray-800 rounded-lg p-4 overflow-auto">
        {!review && !isStreaming && (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Paste your code and click "Review Code"</p>
          </div>
        )}
  
        {isStreaming && !review && (
          <div className="flex items-center gap-2 text-blue-400">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span>Analyzing your code...</span>
          </div>
        )}
  
        {review && (
          <pre className="text-green-400 text-sm whitespace-pre-wrap font-mono">
            {review}
          </pre>
        )}
      </div>
    );
  };
  
  export default ReviewPanel;