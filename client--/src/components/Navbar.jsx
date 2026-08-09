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

  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-gray-700">
      <h1 
        onClick={() => navigate('/')}
        className="text-xl font-semibold cursor-pointer"
      >
        AI Code Review
      </h1>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <button
              onClick={() => navigate('/history')}
              className="text-gray-400 hover:text-white text-sm"
            >
              History
            </button>
            <button
              onClick={handleLogout}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate('/login')}
              className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg text-sm"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm"
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