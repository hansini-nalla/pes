import { useEffect, useState } from 'react';

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
        const res = await fetch(`http://localhost:5000/api/student/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const styles = {
    container: {
      maxWidth: '500px',
      margin: '40px auto',
      background: 'white',
      padding: '40px',
      borderRadius: '20px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(0, 0, 0, 0.08)',
      position: 'relative' as const,
      fontFamily: "'Inter', sans-serif",
    },
    topBar: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '20px 20px 0 0',
    },
    header: {
      fontSize: '1.8rem',
      fontWeight: '800',
      textAlign: 'center' as const,
      marginBottom: '30px',
      background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    profileInfo: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '20px',
    },
    infoItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '16px',
      background: 'rgba(102, 126, 234, 0.05)',
      borderRadius: '12px',
      border: '1px solid rgba(102, 126, 234, 0.1)',
    },
    label: {
      fontWeight: '700',
      color: '#1a202c',
      minWidth: '80px',
      marginRight: '12px',
    },
    value: {
      color: '#4a5568',
      flex: 1,
    },
    loadingText: {
      textAlign: 'center' as const,
      color: '#4a5568',
      padding: '60px 0',
      fontSize: '1.1rem',
    },
    errorText: {
      textAlign: 'center' as const,
      color: '#e53e3e',
      padding: '60px 0',
      fontSize: '1.1rem',
    },
  };

  if (loading) return (
    <div style={styles.container}>
      <div style={styles.topBar}></div>
      <p style={styles.loadingText}>Loading profile...</p>
    </div>
  );

  if (!profile) return (
    <div style={styles.container}>
      <div style={styles.topBar}></div>
      <p style={styles.errorText}>Failed to load profile</p>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.topBar}></div>
      <h2 style={styles.header}>My Profile</h2>
      <div style={styles.profileInfo}>
        <div style={styles.infoItem}>
          <span style={styles.label}>Name:</span>
          <span style={styles.value}>{profile.name}</span>
        </div>
        <div style={styles.infoItem}>
          <span style={styles.label}>Email:</span>
          <span style={styles.value}>{profile.email}</span>
        </div>
        <div style={styles.infoItem}>
          <span style={styles.label}>User ID:</span>
          <span style={styles.value}>{profile.id}</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;