import { Link,useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      const { token, role } = res.data;

      // Save token and role in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);

      // Navigate according to role
      if (role === 'admin') navigate('/admin');
      else if (role === 'teacher') navigate('/teacher');
      else if (role === 'ta') navigate('/ta');
      else navigate('/student');
    } catch (err) {
      showMessage('Login failed. Please check your credentials.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Show message function for errors
  const showMessage = (message: string) => {
    alert(message); // You can use a toast or modal for better UX
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-200">
      {/* Home icon to route back to homepage */}
      <Link
        to="/"
        style={{
          position: 'absolute',
          top: 24,
          left: 24,
          zIndex: 2,
          background: '#fff',
          borderRadius: '50%',
          boxShadow: '0 2px 8px rgba(60, 60, 120, 0.10)',
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textDecoration: 'none',
        }}
        aria-label="Go to homepage"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 10.5L12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-5h-6v5H4a1 1 0 0 1-1-1V10.5z"
            stroke="#667eea"
            strokeWidth="2"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </Link>

      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md transition hover:scale-105 duration-300 ease-in-out">
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-500 text-white text-4xl rounded-full h-16 w-16 flex items-center justify-center shadow-lg transform hover:rotate-6 transition">
            👤
          </div>
        </div>
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6">Login</h2>

        <form className="space-y-6" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
          />
          {/* Password Field */}
          <div className="relative w-full">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 transition pr-12"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <div
            style={{
              textAlign: 'right',
              marginTop: '-0.75rem',
              marginBottom: '1rem',
            }}
          >
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              style={{
                background: 'none',
                border: 'none',
                color: '#667eea',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '0.9rem',
                padding: 0,
                margin: 0,
              }}
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            className={`w-full !bg-indigo-500 text-white py-3 rounded-lg hover:bg-indigo-600 transition shadow-md transform hover:scale-105 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?{' '}
          <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
