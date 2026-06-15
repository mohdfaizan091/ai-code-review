const ScoreBadge = ({ score }) => {
    const color = score >= 8 
      ? 'bg-green-500' 
      : score >= 5 
      ? 'bg-yellow-500' 
      : 'bg-red-500';
      
    return (
      <div className={`${color} text-white text-xl font-bold w-16 h-16 rounded-full flex items-center justify-center shrink-0`}>
        {score}/10
      </div>
    );
  };
  
  export default ScoreBadge;