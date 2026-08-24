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
    <div className="min-h-screen bg-[#10131A] flex items-center justify-center">
      <div className="bg-[#171B24] border border-[#2A2F3D] rounded-lg p-8 w-full max-w-md">
        <h1 className="text-[#E7E9EE] text-2xl font-bold mb-6">AI Code Review</h1>
        <h2 className="text-[#8B92A5] text-sm mb-6">Sign in to your account</h2>

        {error && (
          <div className="bg-[#E2685E]/20 text-[#E2685E] text-sm px-3 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-[#8B92A5] text-sm mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1E2330] text-[#E7E9EE] px-3 py-2 rounded-lg border border-[#2A2F3D] focus:outline-none focus:border-[#E3B341]"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-[#8B92A5] text-sm mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1E2330] text-[#E7E9EE] px-3 py-2 rounded-lg border border-[#2A2F3D] focus:outline-none focus:border-[#E3B341]"
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

        <p className="text-[#5B6274] text-sm text-center mt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#E3B341] hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;