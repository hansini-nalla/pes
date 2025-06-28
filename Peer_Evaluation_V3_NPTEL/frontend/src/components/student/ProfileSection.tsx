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
          headers: { Authorization: `Bearer ${token}` },
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
          headers: { Authorization: `Bearer ${token}` },
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

  if (loading)
    return (
      <div className="max-w-2xl mx-auto mt-10 bg-white p-8 rounded-2xl shadow-md">
        <p className="text-center text-gray-600 text-lg">Loading profile...</p>
      </div>
    );

  if (!profile)
    return (
      <div className="max-w-2xl mx-auto mt-10 bg-white p-8 rounded-2xl shadow-md">
        <p className="text-center text-red-600 text-lg">Failed to load profile</p>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-8 rounded-2xl shadow-md space-y-6">
      <h2 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-800 to-indigo-600">
        My Profile
      </h2>

      <div className="space-y-4">
        <ProfileItem label="Name" value={profile.name} />
        <ProfileItem label="Email" value={profile.email} />
        
      </div>

      <hr className="border-t border-gray-200 my-4" />

      <form onSubmit={handlePasswordChange} className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">Change Password</h3>
        <input
          type="password"
          placeholder="Current Password"
          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="New Password"
          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-800 to-indigo-700 text-white py-2 rounded-xl font-semibold hover:opacity-90 transition"
        >
          Update Password
        </button>
        {message && (
          <p className="text-center text-sm text-gray-700">{message}</p>
        )}
      </form>
    </div>
  );
};

const ProfileItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
    <span className="font-medium text-gray-800">{label}:</span>
    <span className="text-gray-700">{value}</span>
  </div>
);

export default ProfileSection;
