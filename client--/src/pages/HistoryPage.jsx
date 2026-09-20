import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReviews } from '../services/reviewService';
import ScoreBadge from '../components/ScoreBadge';

const HistoryPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await getReviews();
        setReviews(data.reviews);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  return (
    <div className="min-h-screen bg-[#08111F] text-[#E5EDF9]">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#2A2F3D]">
        <h1 className="text-xl font-semibold">Review History</h1>
        <button
          onClick={() => navigate('/editor')}
          className="bg-[#E3B341] hover:bg-[#EEC565] text-[#1B1500] px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          New Review
        </button>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto p-6 space-y-4">

        {loading && (
          <div className="text-center text-[#5B6274] py-10">Loading...</div>
        )}

        {!loading && reviews.length === 0 && (
          <div className="text-center text-[#5B6274] py-10">
            No reviews yet — go review some code!
          </div>
        )}

        {reviews.map((review) => (
          <div key={review._id} className="bg-[#0F1B2D] border border-[#263A57] rounded-lg p-4 flex items-start gap-4">
            <ScoreBadge score={review.feedback.overall_score} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs bg-[#16243A] border border-[#263A57] px-2 py-0.5 rounded-full text-[#9DB0C9] capitalize">
                  {review.language}
                </span>
                <span className="text-xs text-[#5B6274]">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-[#B9C4D6] text-sm">{review.feedback.summary}</p>
              <div className="flex gap-3 mt-2 text-xs text-[#5B6274]">
                <span>🔴 {review.feedback.issues?.length} issues</span>
                <span>💡 {review.feedback.suggestions?.length} suggestions</span>
              </div>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
};

export default HistoryPage;
