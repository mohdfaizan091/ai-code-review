const severityConfig = {
  high: { label: 'High', icon: '!', className: 'severity-high' },
  medium: { label: 'Medium', icon: '▲', className: 'severity-medium' },
  low: { label: 'Low', icon: 'i', className: 'severity-low' },
};

const SeverityBadge = ({ severity }) => {
  const { label, icon, className } = severityConfig[String(severity).toLowerCase()] || severityConfig.low;
  return <span className={`severity-badge ${className}`}><span aria-hidden="true">{icon}</span>{label}</span>;
};

export default SeverityBadge;
