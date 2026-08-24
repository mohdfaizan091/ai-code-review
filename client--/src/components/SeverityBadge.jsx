const SeverityBadge = ({ severity }) => {
    const colors = {
      high: 'bg-[#E2685E] text-[#2A0F0C]',
      medium: 'bg-[#E3B341] text-[#1B1500]',
      low: 'bg-[#79B8E8] text-[#0C2E4A]',
    };
    return (
      <span className={`${colors[severity] || 'bg-[#2A2F3D] text-[#8B92A5]'} text-xs px-2 py-1 rounded-full capitalize font-medium`}>
        {severity}
      </span>
    );
  };

  export default SeverityBadge;