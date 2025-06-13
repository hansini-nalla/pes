// src/pages/ForgotPassword.tsx
import { Link,useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-200">
        {/* Home icon to route back to homepage */}
            <Link to="/" style={{
                position: 'absolute',
                top: 24,
                left: 24,
                zIndex: 2,
                background: '#fff',
                borderRadius: '50%',
                boxShadow: '0 2px 8px rgba(60,60,120,0.10)',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none'
            }} aria-label="Go to homepage">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M3 10.5L12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-5h-6v5H4a1 1 0 0 1-1-1V10.5z" stroke="#667eea" strokeWidth="2" strokeLinejoin="round" fill="none"/>
                </svg>
            </Link>
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md">
        <button
        onClick={() => navigate('/login')}
        className="mb-4 text-purple-600 hover:underline text-sm flex items-center"
        >
        ← Back to Login
        </button>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Reset Your Password</h2>
        <form className="space-y-6">
          <input
            type="email"
            placeholder="Enter your registered email"
            className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            className="w-full bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-600 transition"
          >
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
}
