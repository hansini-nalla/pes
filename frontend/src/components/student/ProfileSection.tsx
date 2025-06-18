import { useEffect, useState } from 'react';
import axios from 'axios';

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  // Add more fields if your backend returns them
}



const ProfileSection = () => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await axios.get(`http://localhost:5000/api/student/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfile(res.data);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <p className="text-center text-gray-500">Loading profile...</p>;
  if (!profile) return <p className="text-center text-red-500">Failed to load profile</p>;

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-md space-y-4">
      <h2 className="text-2xl font-bold text-center text-indigo-600">My Profile</h2>
      <div className="space-y-2">
        <div>
          <span className="font-semibold">Name:</span> {profile.name}
        </div>
        <div>
          <span className="font-semibold">Email:</span> {profile.email}
        </div>
        <div>
          <span className="font-semibold">User ID:</span> {profile.id}
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
