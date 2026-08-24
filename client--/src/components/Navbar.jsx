import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logout } from '../services/authService';

const Navbar = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setUser(null);
    sessionStorage.clear();
    window.location.href = '/';
  };

  const pill = "px-4 py-2 rounded-lg text-sm border border-[#2A2F3D] transition";

  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-[#2A2F3D] bg-[#10131A]">
      <h1
        onClick={() => navigate('/')}
        className={`${pill} font-semibold cursor-pointer text-[#E7E9EE] hover:border-[#5B6274]`}
      >
        AI Code Review
      </h1>

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className={`${pill} text-[#8B92A5] hover:text-[#E7E9EE] hover:border-[#5B6274]`}
        >
          Home
        </button>

        {user ? (
          <>
            <button
              onClick={() => navigate('/history')}
              className={`${pill} text-[#8B92A5] hover:text-[#E7E9EE] hover:border-[#5B6274]`}
            >
              History
            </button>
            <button
              onClick={handleLogout}
              className={`${pill} bg-[#1E2330] hover:bg-[#262C3B] text-[#E7E9EE]`}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate('/login')}
              className={`${pill} text-[#E7E9EE] hover:border-[#5B6274]`}
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className={`${pill} bg-[#E3B341] hover:bg-[#EEC565] border-none font-medium text-[#1B1500]`}
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;