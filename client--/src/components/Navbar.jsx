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

  const pill = "rounded-md px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400";

  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#263A57] bg-[#08111F]/95 px-4 py-3 backdrop-blur md:px-6">
      <button
        onClick={() => navigate('/')}
        className="flex shrink-0 items-center gap-2 text-sm font-semibold tracking-tight text-[#E5EDF9]"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#38BDF8] font-mono text-xs font-bold text-[#082032]" aria-hidden="true">&gt;_</span>
        <span className="hidden sm:inline">Nexus Review</span>
      </button>

      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={() => navigate('/')}
          className={`${pill} text-[#9DB0C9] hover:bg-[#16243A] hover:text-[#E5EDF9]`}
        >
          Home
        </button>

        {user ? (
          <>
            <button
              onClick={() => navigate('/history')}
              className={`${pill} hidden text-[#9DB0C9] hover:bg-[#16243A] hover:text-[#E5EDF9] sm:inline-flex`}
            >
              History
            </button>
            <button
              onClick={handleLogout}
              className={`${pill} bg-[#16243A] text-[#E5EDF9] hover:bg-[#1C304C]`}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate('/login')}
              className={`${pill} text-[#C9D9EC] hover:bg-[#16243A] hover:text-[#E5EDF9]`}
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className={`${pill} bg-[#E3B341] font-medium text-[#1B1500] hover:bg-[#EEC565]`}
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
