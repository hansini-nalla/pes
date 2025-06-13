import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const [matchStatus, setMatchStatus] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // Get password strength
  const getPasswordStrengthValue = (pwd: string) => {
    if (pwd.length === 0) return { level: '', width: '0%', color: 'bg-gray-300' };
    if (pwd.length < 6) return { level: 'Weak', width: '33%', color: 'bg-red-500' };
    if (pwd.match(/[A-Z]/) && pwd.match(/[a-z]/) && pwd.match(/[0-9]/) && pwd.length >= 8) {
      return { level: 'Strong', width: '100%', color: 'bg-green-500' };
    }
    return { level: 'Medium', width: '66%', color: 'bg-yellow-400' };
  };

  const strength = getPasswordStrengthValue(password);

  // Real-time match check
  const checkMatch = (reEntered: string) => {
    setConfirmPassword(reEntered);
    if (password && reEntered) {
      setMatchStatus(password === reEntered ? 'Matched' : 'Not matched');
    } else {
      setMatchStatus('');
    }
  };

  // Handle registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showMessage('Passwords do not match');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        password,
        role,
      });

      const { token, role: userRole } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('role', userRole);

      if (userRole === 'admin') navigate('/admin');
      else if (userRole === 'teacher') navigate('/teacher');
      else if (userRole === 'ta') navigate('/ta');
      else navigate('/dashboard');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        showMessage(err.response?.data?.message || 'Registration failed');
      } else {
        showMessage('Registration failed');
      }
      console.error(err);
    }
  };

  // Show message function for errors
  const showMessage = (message: string) => {
    alert(message); // You can use a toast or modal for better UX
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-200">
      {/* Home icon */}
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
          <div className="bg-purple-500 text-white text-4xl rounded-full h-16 w-16 flex items-center justify-center shadow-lg transform hover:rotate-6 transition">
            👤
          </div>
        </div>
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-4">Create Account</h2>

        <form className="space-y-6" onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 transition"
          />
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 transition"
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

          {/* Password Strength Meter */}
          {password && (
            <div>
              <p className="text-sm text-gray-700 mb-1">
                Password Strength: <span className="font-semibold">{strength.level}</span>
              </p>
              <div className="w-full h-2 bg-gray-200 rounded">
                <div
                  className={`h-2 rounded transition-all duration-300 ${strength.color}`}
                  style={{ width: strength.width }}
                />
              </div>
            </div>
          )}

          {/* Re-enter Password */}
          <div className="relative w-full">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => checkMatch(e.target.value)}
              className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 transition pr-12"
            />
            <span
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {matchStatus && (
            <p className={`text-sm font-medium ${matchStatus === 'Matched' ? 'text-green-600' : 'text-red-600'}`}>
              {matchStatus}
            </p>
          )}

          {/* Role Dropdown */}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 transition"
          >
            <option value="student">Student</option>
            <option value="teacher">Professor</option>
            <option value="ta">TA</option>
            <option value="admin">Admin</option>
          </select>

          {/* Submit */}
          <button
            type="submit"
            className="w-full !bg-purple-500 text-black py-3 rounded-lg hover:bg-purple-600 transition shadow-md transform hover:scale-105"
          >
            Register
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-600 font-semibold hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
