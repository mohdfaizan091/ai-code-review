const ScoreBadge = ({ score }) => {
    const styles = score >= 8
      ? 'bg-[#5FBD8A] text-[#0C2318]'
      : score >= 5
      ? 'bg-[#E3B341] text-[#1B1500]'
      : 'bg-[#E2685E] text-[#2A0F0C]';

    return (
      <div className={`${styles} text-xl font-bold w-16 h-16 rounded-full flex items-center justify-center shrink-0`}>
        {score}/10
      </div>
    );
  };

  export default ScoreBadge;