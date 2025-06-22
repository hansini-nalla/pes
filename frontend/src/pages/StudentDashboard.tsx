
import { useState,useEffect } from 'react';
import {useNavigate } from 'react-router-dom';
import './StudentDashboard.css';
import ProfileSection from '../components/student/ProfileSection';
import CourseList from '../components/student/CourseList';
import CourseExams from '../components/student/CourseExams';
import ViewMarks from '../components/student/ViewMarks';
import DashboardOverview from '../components/student/DashboardOverview';
import PeerEvaluationsPending from '../components/student/PeerEvaluationsPending';

const menuItems = [
  { label: 'Dashboard' },
  { label: 'Courses' },
  { label: 'Peer Evaluation' },
  { label: 'View Marks' },
  { label: 'Raise Ticket' },
  { label: 'Profile' },
  { label: 'Logout' },
];

export default function StudentDashboard() {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Logout handling
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  }

  useEffect(() => {
        if (darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }, [darkMode]);
  
      const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        document.documentElement.classList.toggle('dark');
      };
  
  //Dashboard counts
    /*useEffect(() => {
        fetch(`http://localhost:${PORT}/api/dashboard/counts`)
          .then(res => res.json())
          .then(data => {
            setCounts({
              courses: data.courses,
              batches: data.batches,
              exams: data.exams,
            });
          })
          .catch(err => console.error('Failed to fetch dashboard counts:', err));
    }, []);*/

  // Fetch profile data
    useEffect(() => {
      fetch(`http://localhost:${PORT}/api/dashboard/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(res => {
          if (!res.ok) throw new Error('Unauthorized');
          return res.json();
        })
        .then((data: { name: string, email: string, role: string }) => {
          setProfileData(data);
          //setProfileSaved(!!data.name && !!data.email && !!data.role);
        })
        .catch(err => {
          console.error('Failed to fetch profile:', err);
        });
    }, []);

  // Profile icon SVG (solid avatar style)
    const ProfileSVG = () => (
      <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
        <circle cx="19" cy="19" r="19" fill="#57418d" />
        <circle cx="19" cy="14" r="7" fill="#fff" />
        <ellipse cx="19" cy="29.5" rx="11" ry="7.5" fill="#fff" />
      </svg>
    );
  
  const handleUpload = (course: string, test: string, file: File | null) => {
    if (!file) return alert("Please select a PDF file.");
    setSubmissions(prev => ({
      ...prev,
      [course]: {
        ...prev[course],
        [test]: { file }
      }
    }, [darkMode]);

    const toggleDarkMode = () => {
      setDarkMode(!darkMode);
      document.documentElement.classList.toggle('dark');
    };

  const renderContent = () => {
    switch (activeMenu) {
      case 'Dashboard':
        return (
          <DashboardOverview />
        );
      case 'Courses':
        return selectedCourseId ? (
          <CourseExams
            courseId={selectedCourseId}
            onBack={() => setSelectedCourseId(null)}
          />
        ) : (
          <CourseList onSelectCourse={(id) => setSelectedCourseId(id)} />
        );
      case 'Peer Evaluation':
        return (
          <PeerEvaluationsPending/>
        );
      case 'View Marks':
        return (
          <ViewMarks />
        );
      case 'Raise Ticket':
        return (
          <div className="card">
            <h2>Raise a Ticket</h2>
            <textarea placeholder="Describe your issue..." rows={4}></textarea>
            <br />
            <button className="btn">Submit Ticket</button>
          </div>
        );
      case 'Profile':
        return (
          <ProfileSection />
        );
      case 'Logout':
        return (
          <div className="card">
            <h2>Are you sure you want to logout?</h2>
            <button className="btn" onClick={handleLogout}>Confirm Logout</button>
          </div>
        );
      default:
        return <div>Select a menu option</div>;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "linear-gradient(180deg,#ffe3ec 80%,#f0f0f5 100%)" }}>
      <div className={`${showSidebar ? 'w-64' : 'w-20'} bg-gradient-to-b from-[#493a6b] to-[#2D2150] text-white flex flex-col justify-between py-6 px-4 rounded-r-3xl transition-all duration-300`}>
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="self-start mb-6 p-2 border-2 border-transparent hover:border-blue-300 rounded-full active:scale-95 transition"
        >
          <FiMenu className="text-2xl" />
        </button>
        <div className="flex-1 flex flex-col items-center">
          <h2 className={`font-bold mb-10 mt-4 transition-all ${showSidebar ? 'text-2xl' : 'text-lg'}`}>{showSidebar ? 'Student Panel' : 'Stu'}</h2>
          <ul className="space-y-3 w-full">
            {[
              { key: 'dashboard', icon: FiHome, label: 'Dashboard' },
              { key: 'courses', icon: FiBook, label: 'Courses' },
              { key: 'peerEvaluation', icon: FiUsers, label: 'Peer Evaluation' },
              { key: 'viewMarks', icon: FiCheckCircle, label: 'View Marks' },
              { key: 'raiseTicket', icon: FiUploadCloud, label: 'Raise Ticket' },
              { key: 'profile', icon: FiUser, label: 'Profile' }
            ].map(({ key, icon: Icon, label }) => (
              <li
                key={key}
                onClick={() => setActivePage(key)}
                className={`cursor-pointer ${activePage === key ? 'bg-[#57418d]' : ''} flex items-center px-4 py-2 rounded transition`}
              >
                <Icon className={`transition-all ${showSidebar ? 'mr-2 text-xl' : 'text-3xl'}`} />
                {showSidebar && label}
              </li>
            ))}
          </ul>
        </div>
        <button
          onClick={() => setLogoutDialog(true)}
          className="flex items-center justify-center gap-2 hover:text-red-400 transition"
        >
          <FiLogOut className={`${showSidebar ? 'mr-2 text-xl' : 'text-3xl'}`} />
          {showSidebar && 'Logout'}
        </button>
      </div>
      <div className="flex-1 relative overflow-y-auto flex justify-center items-start">
        <div className="bg-white rounded-3xl shadow-lg w-full h-auto mt-24 mb-8 mx-4 p-0 flex items-start justify-center overflow-auto max-w-6xl"
          style={{ minHeight: "calc(100vh - 120px)", boxShadow: '0 2px 24px 0 rgba(87,65,141,0.10)' }}>
          {pages[activePage]}
        </div>
      </div>
      {logoutDialog && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80 text-center shadow-xl">
            <p className="text-lg font-semibold text-[#38365e] mb-4">Are you sure you want to logout?</p>
            <div className="flex justify-around mt-4">
              <button onClick={() => setLogoutDialog(false)} className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300">Cancel</button>
              <button
                onClick={() => { setLogoutDialog(false); onLogout?.(); }}
                className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600"
              >Logout</button>
            </div>
          </div>
        </div>
      )}
      {/* Profile button */}
        <div className="absolute top-4 right-6 z-20">
          <button onClick={() => setShowProfilePopup(!showProfilePopup)}
            className="p-2 flex items-center justify-center rounded-full border-2 border-transparent hover:border-blue-300 transition active:scale-95 bg-white shadow"
            style={{ boxShadow: '0 2px 14px 0 rgba(87,65,141,0.16)' }}
          >
            <ProfileSVG />
          </button>
          {showProfilePopup && (
              <div
                className="absolute right-0 mt-3 w-80 bg-white p-4 rounded-b-3xl shadow-lg z-10"
                style={{
                  borderTopLeftRadius: 0,
                  borderTopRightRadius: 0,
                  borderBottomLeftRadius: 24,
                  borderBottomRightRadius: 24,
                  boxShadow: '0 2px 14px 0 rgba(87,65,141,0.16)'
                }}
              >
                <h2 className="text-xl font-bold mb-4">Profile Info</h2>
                <div className="space-y-2 mb-4">
                  <p><strong>Name:</strong> {profileData.name}</p>
                  <p><strong>Email:</strong> {profileData.email}</p>
                  <p><strong>Role:</strong> {profileData.role}</p>
                </div>
                <button
                  onClick={() => {
                    setActivePage("profile");
                    setShowProfilePopup(false);
                  }}
                  className="bg-purple-700 text-white px-4 py-2 rounded-3xl w-full"
                >
                  Go to Profile
                </button>
              </div>
            )}
        </div>
      {/* Settings Button */}
      <div className="absolute bottom-6 right-6 z-20">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="h-12 w-12 bg-gray-800 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.397-.164-.853-.142-1.203.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.142-.854-.108-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.806.272 1.203.107.397-.165.71-.505.781-.929l.149-.894zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {showSettings && (
          <div className="mt-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-xl p-4 text-sm space-y-4 w-60">
            <div className="flex items-center justify-between gap-6">
              <span className="text-gray-800 dark:text-white">Dark Mode</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 dark:peer-focus:ring-indigo-600 rounded-full peer dark:bg-gray-600 peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
