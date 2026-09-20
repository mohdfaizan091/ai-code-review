import { useState } from 'react';
import ScoreBadge from './ScoreBadge';
import SeverityBadge from './SeverityBadge';
import Card from './Card';
import Button from './Button';

const FindingCard = ({ issue, onReveal }) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const severity = { high: 'severity-high', medium: 'severity-medium', low: 'severity-low' }[issue.severity] || 'severity-low';
  const copyFix = async () => {
    if (!issue.fix) return;
    await navigator.clipboard?.writeText(issue.fix);
    setCopied(true); window.setTimeout(() => setCopied(false), 1600);
  };
  return <article className={`finding-card ${severity}`}>
    <button className="finding-trigger" onClick={() => setOpen(!open)} aria-expanded={open}>
      <SeverityBadge severity={issue.severity} />
      <span className="finding-message">{issue.message}</span>
      <span aria-hidden="true" className="finding-chevron">{open ? '−' : '+'}</span>
    </button>
    <div className="finding-meta">
      {issue.line && <button className="line-link" onClick={() => onReveal(issue.line)}>Line {issue.line} <span aria-hidden="true">↗</span></button>}
      <span>{open ? 'Details shown' : 'Open for details'}</span>
    </div>
    {open && <div className="finding-detail">
      {issue.explanation && <p>{issue.explanation}</p>}
      {issue.fix && <div className="fix-block"><div><span>Suggested fix</span><Button variant="ghost" className="copy-button" onClick={copyFix}>{copied ? 'Copied' : 'Copy fix'}</Button></div><pre><code>{issue.fix}</code></pre></div>}
    </div>}
  </article>;
};

const ResultsSkeleton = () => <div className="space-y-4" aria-label="Preparing review results" role="status">
  <div className="skeleton-card h-24" /> <div className="skeleton-card h-24" /> <div className="skeleton-card h-24" />
  <span className="sr-only">Preparing review results</span>
</div>;

const ReviewPanel = ({ streamingText, parsedReview, isStreaming, error, onRetry, onRevealLine, isExpanded, onToggleExpand }) => {
  const [filter, setFilter] = useState('all');
  const issues = parsedReview?.issues || [];
  const counts = { all: issues.length, high: issues.filter(x => x.severity === 'high').length, medium: issues.filter(x => x.severity === 'medium').length, low: issues.filter(x => x.severity === 'low').length };
  const visibleIssues = filter === 'all' ? issues : issues.filter(x => x.severity === filter);

  return <Card className="results-panel h-full overflow-auto">
    <div className="results-toolbar"><span>AI Review Results</span><button className="pane-toggle" onClick={onToggleExpand} aria-label={isExpanded ? 'Exit expanded review results' : 'Expand review results'} title={isExpanded ? 'Exit fullscreen (Esc)' : 'Expand review results'}>{isExpanded ? '×' : '⛶'}</button></div>
    <div className="sr-only" aria-live="polite">{isStreaming ? 'Review in progress.' : parsedReview ? 'Review complete.' : error ? 'Review failed.' : ''}</div>
    {error && <div className="error-banner"><span>Review interrupted. Your partial response is still available.</span><Button variant="secondary" onClick={onRetry}>Retry review</Button></div>}
    {!parsedReview && !isStreaming && !error && <div className="empty-state review-empty-state"><span aria-hidden="true">⌘</span><div><p className="font-semibold text-[#D9E6F5]">Your review will appear here.</p><ol><li><b>1.</b> Paste code in the editor</li><li><b>2.</b> Start a review</li><li><b>3.</b> Inspect streamed findings and fixes</li></ol></div></div>}
    {isStreaming && <div className="streaming-state"><div className="streaming-label"><span className="stream-dot" />Analyzing your code<span className="stream-caret">▋</span></div>{streamingText ? <pre>{streamingText}</pre> : <ResultsSkeleton />}</div>}
    {parsedReview && !isStreaming && <div className="space-y-5">
      <div className="summary-card"><ScoreBadge score={parsedReview.overall_score} /><div><p className="eyebrow">Review summary</p><p>{parsedReview.summary}</p></div></div>
      <section><div className="section-title"><h2>Findings</h2><span>{issues.length}</span></div>
        {issues.length > 0 && <div className="filter-row" aria-label="Filter findings">{['all', 'high', 'medium', 'low'].map(level => <button key={level} onClick={() => setFilter(level)} aria-pressed={filter === level} className={filter === level ? 'active' : ''}>{level === 'all' ? 'All' : `${level[0].toUpperCase()}${level.slice(1)}`} {counts[level]}</button>)}</div>}
        <div className="space-y-3">{visibleIssues.map((issue, i) => <FindingCard key={`${issue.line}-${i}`} issue={issue} onReveal={onRevealLine} />)}</div>
        {issues.length === 0 && <div className="empty-state success"><span aria-hidden="true">✓</span><p>No findings. This review looks clean.</p></div>}
        {issues.length > 0 && visibleIssues.length === 0 && <p className="empty-filter">No {filter} findings in this review.</p>}
      </section>
    </div>}
  </Card>;
};

export default ReviewPanel;
