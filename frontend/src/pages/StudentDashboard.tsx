import { useState,useEffect } from 'react';
import './StudentDashboard.css';

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
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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

  const renderContent = () => {
    switch (activeMenu) {
      case 'Dashboard':
        return (
          <div className="cards-grid">
            <div className="card">
              <h3>Upcoming Assignments</h3>
              <p>You have 3 assignments due this week.</p>
            </div>
            <div className="card">
              <h3>Recent Grades</h3>
              <p>AI & ML: 89 | Web Dev: 92 | DSA: 85</p>
            </div>
            <div className="card">
              <h3>Announcements</h3>
              <p>Peer review deadline extended to Friday.</p>
            </div>
          </div>
        );
      case 'Courses':
        return (
          <div className="cards-grid">
            <div className="card">
              <h3>AI & Machine Learning</h3>
              <p> Test 1 Due:10:10AM</p>
              <button className="btn">Submit Answers</button>
            </div>
            <div className="card">
              <h3>Web Development</h3>
              <p>Test 4 Due:15:00</p>
              <button className="btn">Submit Answers</button>
            </div>
            <div className="card">
              <h3>Data Structures</h3>
              <p>Test 2 Due:11:30AM</p>
              <button className="btn">Submit Answers</button>
            </div>
          </div>
        );
      case 'Peer Evaluation':
        return (
          <div className="card">
            <h2>Peer Evaluation</h2>
            <p>You have 2 peer reviews pending.</p>
            <button className="btn">Start Evaluation</button>
          </div>
        );
      case 'View Marks':
        return (
          <div className="card">
            <h2>Marks Overview</h2>
            <ul>
              <li>AI & ML - 89/100</li>
              <li>Web Dev - 92/100</li>
              <li>DSA - 85/100</li>
            </ul>
          </div>
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
          <div className="card">
            <h2>Your Profile</h2>
            <p>Name: Jahnavi</p>
            <p>Roll No: 21AIML1234</p>
            <p>Branch: AIML</p>
          </div>
        );
      case 'Logout':
        return (
          <div className="card">
            <h2>Are you sure you want to logout?</h2>
            <button className="btn">Confirm Logout</button>
          </div>
        );
      default:
        return <div>Select a menu option</div>;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h2 className="sidebar-title">Student</h2>
        <ul className="menu">
          {menuItems.map(({ label }) => (
            <li
              key={label}
              className={label === activeMenu ? 'active' : ''}
              onClick={() => setActiveMenu(label)}
            >
              {label}
            </li>
          ))}
        </ul>
      </div>
      <div className="main-content">{renderContent()}</div>

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
}