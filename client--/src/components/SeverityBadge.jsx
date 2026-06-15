const SeverityBadge = ({ severity }) => {
    const colors = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-blue-500',
    };
    return (
      <span className={`${colors[severity] || 'bg-gray-500'} text-white text-xs px-2 py-1 rounded-full capitalize`}>
        {severity}
      </span>
    );
  };
  
  export default SeverityBadge;