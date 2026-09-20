const ScoreBadge = ({ score }) => {
    const styles = score >= 8
      ? 'from-sky-400 to-cyan-300 text-[#082032]'
      : score >= 5
      ? 'from-sky-500 to-blue-400 text-[#E5EDF9]'
      : 'from-red-500 to-rose-400 text-white';

    return (
      <div className={`bg-gradient-to-br ${styles} text-xl font-bold w-16 h-16 rounded-full flex items-center justify-center shrink-0 ring-4 ring-sky-400/15`}>
        {score}/10
      </div>
    );
  };

  export default ScoreBadge;
