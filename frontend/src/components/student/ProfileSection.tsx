import { useEffect, useState } from "react";
import axios from "axios";

const PORT = import.meta.env.VITE_BACKEND_PORT || 5000;

interface StudentProfile {
  name: string;
  email: string;
  id?: string;
}

const ProfileSection = () => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`http://localhost:${PORT}/api/student/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `http://localhost:${PORT}/api/student/change-password`,
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage(res.data.message || "Password updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setMessage(err.response?.data?.error || "Failed to change password");
    }
  };

  const topBarGradient = 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)';
  const headerGradient = 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)';
  const infoItemBg = 'rgba(102, 126, 234, 0.05)';
  const infoItemBorder = 'rgba(102, 126, 234, 0.1)';
  const boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
  const border = '1px solid rgba(0, 0, 0, 0.08)';

  if (loading)
    return (
      <div
        className="max-w-[500px] mx-auto my-10 bg-white p-10 rounded-2xl relative font-sans"
        style={{ boxShadow, border }}
      >
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: topBarGradient }}></div>
        <p className="text-center text-gray-700 py-16 text-lg">Loading profile...</p>
      </div>
    );

  if (!profile)
    return (
      <div
        className="max-w-[500px] mx-auto my-10 bg-white p-10 rounded-2xl relative font-sans"
        style={{ boxShadow, border }}
      >
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: topBarGradient }}></div>
        <p className="text-center text-red-600 py-16 text-lg">Failed to load profile</p>
      </div>
    );

  return (
    <div
      className="max-w-[500px] mx-auto my-10 bg-white p-10 rounded-2xl relative font-sans"
      style={{ boxShadow, border }}
    >
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: topBarGradient }}></div>
      <h2
        className="text-3xl font-extrabold text-center mb-8 bg-clip-text text-transparent"
        style={{ background: headerGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
      >
        My Profile
      </h2>

      <div className="flex flex-col gap-5">
        <ProfileItem label="Name" value={profile.name} />
        <ProfileItem label="Email" value={profile.email} />
        {profile.id && <ProfileItem label="User ID" value={profile.id} />}
      </div>

      <hr className="border-t my-6" />

      <form onSubmit={handlePasswordChange} className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-700">Change Password</h3>
        <input
          type="password"
          placeholder="Current Password"
          className="w-full px-4 py-2 border rounded-xl"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="New Password"
          className="w-full px-4 py-2 border rounded-xl"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          className="w-full px-4 py-2 border rounded-xl"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl w-full"
        >
          Update Password
        </button>
        {message && <p className="text-center text-sm text-gray-600">{message}</p>}
      </form>
    </div>
  );
};

const ProfileItem = ({ label, value }: { label: string; value: string }) => (
  <div
    className="flex items-center p-4 rounded-xl border"
    style={{
      background: 'rgba(102, 126, 234, 0.05)',
      borderColor: 'rgba(102, 126, 234, 0.1)',
    }}
  >
    <span className="font-bold text-gray-900 min-w-[80px] mr-3">{label}:</span>
    <span className="text-gray-700 flex-1">{value}</span>
  </div>
);

export default ProfileSection;
