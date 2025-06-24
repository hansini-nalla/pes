import { useEffect, useState } from "react";
import axios from "axios";

interface StudentProfile {
  name: string;
  email: string;
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
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/student/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to fetch profile");
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
        "http://localhost:5000/api/student/change-password",
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message || "Password updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setMessage(err.response?.data?.error || "Failed to change password");
    }
  };

  if (loading) return <div className="text-center py-10">Loading profile...</div>;
  if (!profile) return <div className="text-center py-10 text-red-500">Failed to load profile</div>;

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow space-y-6 mt-10">
      <h2 className="text-2xl font-bold text-center text-indigo-700">My Profile</h2>

      <div className="space-y-3">
        <ProfileItem label="Name" value={profile.name} />
        <ProfileItem label="Email" value={profile.email} />
      </div>

      <hr className="border-t" />

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
  <div className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-xl border">
    <span className="font-medium text-gray-700">{label}:</span>
    <span className="text-gray-600">{value}</span>
  </div>
);

export default ProfileSection;