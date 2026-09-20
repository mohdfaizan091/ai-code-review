import { useState } from 'react';
import { useNavigate, Link, Navigate  } from 'react-router-dom';
import { login } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { user, setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/editor" />;
  }

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    const data = await login(email, password);
    console.log('LOGIN RESPONSE:', data); // add karo
    if (data.ok) {
      setUser(data.user);
      navigate('/editor');
    } else {
      setError(data.message);
    }
    setLoading(false);
};
  return (
    <div className="min-h-screen bg-[#08111F] flex items-center justify-center px-4">
      <div className="bg-[#0F1B2D] border border-[#263A57] rounded-xl p-7 sm:p-8 w-full max-w-md shadow-2xl shadow-sky-950/20">
        <div className="mb-7">
          <div className="flex items-center gap-2.5 text-base font-semibold text-[#E5EDF9]"><span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#38BDF8] font-mono text-xs font-bold text-[#082032]" aria-hidden="true">&gt;_</span>Nexus Review</div>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-[#E5EDF9]">Welcome back</h1>
          <p className="mt-1 text-sm text-[#9DB0C9]">Sign in to continue reviewing with context.</p>
        </div>

        {error && (
          <div className="bg-[#E2685E]/20 text-[#E2685E] text-sm px-3 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-[#9DB0C9] text-sm mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#16243A] text-[#E5EDF9] px-3 py-2 rounded-lg border border-[#263A57] focus:outline-none focus:border-[#38BDF8]"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-[#9DB0C9] text-sm mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#16243A] text-[#E5EDF9] px-3 py-2 rounded-lg border border-[#263A57] focus:outline-none focus:border-[#38BDF8]"
              placeholder="••••••"
            />
          </div>
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-[#E3B341] hover:bg-[#EEC565] disabled:opacity-50 text-[#1B1500] py-2 rounded-lg font-medium transition"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>

        <p className="text-[#9DB0C9] text-sm text-center mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#7DD3FC] hover:text-[#BAE6FD] hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
