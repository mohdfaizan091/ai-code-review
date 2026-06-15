import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/authService';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    const data = await register(name, email, password);
    if (data.userId) {
      navigate('/login');
    } else {
      setError(data.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg p-8 w-full max-w-md">
        <h1 className="text-white text-2xl font-bold mb-6">AI Code Review</h1>
        <h2 className="text-gray-400 text-sm mb-6">Create your account</h2>

        {error && (
          <div className="bg-red-500/20 text-red-400 text-sm px-3 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
              placeholder="Faizan"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
              placeholder="••••••"
            />
          </div>
          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 rounded-lg font-medium"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </div>

        <p className="text-gray-500 text-sm text-center mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;