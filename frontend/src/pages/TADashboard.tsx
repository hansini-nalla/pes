import React, { useEffect, useState, type JSX } from 'react';
import { FiMenu, FiLogOut, FiHome, FiBook, FiShield } from 'react-icons/fi';

interface CourseBatch {
  course: string;
  batch: string;
}

const TADashboard = ({ onLogout }: { onLogout?: () => void }) => {
  const [activePage, setActivePage] = useState("home");
  const [showSidebar, setShowSidebar] = useState(true);
  const [logoutDialog, setLogoutDialog] = useState(false);

  const [courseBatchList, setCourseBatchList] = useState<CourseBatch[]>([]);
  const [roleEmail, setRoleEmail] = useState("");
  const [roleType, setRoleType] = useState("Student");
  const [showRoleMsg, setShowRoleMsg] = useState(false);

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

  useEffect(() => {
    fetch('/api/course-batches')
      .then(res => res.json())
      .then((data: CourseBatch[]) => setCourseBatchList(data));
  }, []);

  const handleRoleUpdate = () => {
    fetch('/api/update-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: roleEmail, role: roleType })
    }).then(() => {
      setShowRoleMsg(true);
      setTimeout(() => setShowRoleMsg(false), 900);
    });
  };

  const DialogBox = ({ show, message, children }: { show: boolean, message: string, children?: React.ReactNode }) => {
    if (!show) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
        <div className="bg-white rounded-2xl shadow-xl px-8 py-8 flex flex-col items-center min-w-[320px]">
          <div className="mb-2">
            <svg width={56} height={56} fill="none" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="28" fill="#6ddf99" />
              <path d="M18 30l7 7 13-13" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="text-lg text-[#235d3a] font-semibold text-center mb-1">{message}</div>
          {children}
        </div>
      </div>
    );
  };

  const pages: Record<string, JSX.Element> = {
    home: (
      <div className="flex flex-col items-center justify-start w-full h-full pt-10 pb-4">
        <h1 className="text-4xl font-bold text-[#38365e] text-center mb-6">
          Welcome to TA Dashboard
        </h1>
        <div className="mt-10 flex flex-col md:flex-row justify-center gap-6 w-full max-w-2xl">
          <button
            onClick={() => setActivePage('courses')}
            className="bg-purple-700 text-white px-10 py-4 text-lg rounded-3xl"
          >
            Manage Courses
          </button>
          <button
            onClick={() => setActivePage('roleManager')}
            className="bg-purple-700 text-white px-10 py-4 text-lg rounded-3xl"
          >
            Manage Roles
          </button>
        </div>
      </div>
    ),
    roleManager: (
      <div className="flex flex-col items-center justify-start w-full h-full pt-10 pb-4">
        <h2 className="text-3xl font-bold text-[#38365e] text-center mb-8">Role Manager</h2>
        <div className="w-full flex flex-col items-start px-6 max-w-xl">
          <p className="mb-8 text-[#38365e] text-left">
            Update the role of a user by providing their email ID and selecting a role.
          </p>
          <form
            className="flex flex-col gap-6 w-full"
            onSubmit={e => {
              e.preventDefault();
              handleRoleUpdate();
            }}
          >
            <div className="flex flex-col items-start gap-1 w-full">
              <label className="text-[#38365e] font-semibold mb-1">Email ID</label>
              <input
                type="email"
                placeholder="Enter user email ID"
                className="border focus:border-blue-400 px-4 py-2 rounded-xl w-full"
                value={roleEmail}
                onChange={e => setRoleEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col items-start gap-1 w-full">
              <label className="text-[#38365e] font-semibold mb-1">Select Role</label>
              <select
                className="border focus:border-blue-400 px-4 py-2 rounded-xl w-full"
                value={roleType}
                onChange={e => setRoleType(e.target.value)}
              >
                <option>Student</option>
                <option>Teaching Assistant (TA)</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-[#57418d] text-white px-7 py-2 rounded-2xl font-semibold shadow transition hover:bg-[#402b6c] mt-2"
              style={{ minWidth: 140 }}
            >
              Update Role
            </button>
          </form>
        </div>
      </div>
    ),
    courses: (
      <div className="flex flex-col items-center justify-start w-full h-full pt-10 pb-4">
        <h2 className="text-3xl font-bold mb-10 text-[#38365e] text-center">Courses and Batches</h2>
        <div className="w-full max-w-5xl">
          <table className="w-full border-separate border-spacing-y-4">
            <thead>
              <tr>
                <th className="bg-[#57418d] text-white py-3 px-6 rounded-l-2xl text-lg font-semibold text-center">
                  Course Name
                </th>
                <th className="bg-[#57418d] text-white py-3 px-6 text-lg font-semibold text-center">
                  Batch Name
                </th>
                <th className="bg-[#57418d] text-white py-3 px-6 rounded-r-2xl text-lg font-semibold text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {courseBatchList.length > 0 ? (
                courseBatchList.map((row, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 text-center text-base">{row.course}</td>
                    <td className="px-6 py-4 text-center text-base">{row.batch}</td>
                    <td className="px-6 py-4 text-center text-base">-</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center text-gray-500 py-4">
                    No courses and batches added yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "linear-gradient(180deg,#ffe3ec 80%,#f0f0f5 100%)" }}>
      {/* Sidebar */}
      <div className={`${showSidebar ? 'w-64' : 'w-20'} bg-gradient-to-b from-[#493a6b] to-[#2D2150] text-white flex flex-col justify-between py-6 px-4 rounded-r-3xl transition-all duration-300`}>
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="self-start mb-6 p-2 border-2 border-transparent hover:border-blue-300 rounded-full active:scale-95 transition"
        >
          <FiMenu className="text-2xl" />
        </button>
        <div className="flex-1 flex flex-col items-center">
          <h2 className={`font-bold mb-10 mt-4 transition-all ${showSidebar ? 'text-2xl' : 'text-lg'}`}>
            {showSidebar ? 'TA Panel' : 'TA'}
          </h2>
          <ul className="space-y-3 w-full">
            {['home', 'roleManager', 'courses'].map((key) => {
              const icons: Record<string, any> = { home: FiHome, roleManager: FiShield, courses: FiBook };
              const Icon = icons[key];
              return (
                <li key={key} onClick={() => setActivePage(key)}
                  className={`cursor-pointer ${activePage === key ? 'bg-[#57418d]' : ''} flex items-center px-4 py-2 rounded transition`}>
                  <Icon className={`transition-all ${showSidebar ? 'mr-2 text-xl' : 'text-3xl'}`} />
                  {showSidebar && (key === 'roleManager' ? 'Manage Roles' : key.charAt(0).toUpperCase() + key.slice(1))}
                </li>
              );
            })}
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

      {/* Main content */}
      <div className="flex-1 relative overflow-y-auto flex justify-center items-start">
        <div className="bg-white rounded-3xl shadow-lg w-full h-auto mt-24 mb-8 mx-4 p-0 flex items-start justify-center overflow-auto max-w-6xl"
          style={{
            minHeight: "calc(100vh - 120px)",
            boxShadow: '0 2px 24px 0 rgba(87,65,141,0.10)'
          }}
        >
          <div className="w-full">{pages[activePage]}</div>
        </div>
        <DialogBox show={showRoleMsg} message="Role Updated Successfully!" />
        <DialogBox show={logoutDialog} message="Are you sure you want to logout?">
          <div className="flex gap-8 mt-4">
            <button
              onClick={() => setLogoutDialog(false)}
              className="bg-gray-200 text-gray-700 rounded-xl px-8 py-2 font-semibold hover:bg-gray-300 transition"
            >
              No
            </button>
            <button
              onClick={() => {
                setLogoutDialog(false);
                if (onLogout) {
                  onLogout();
                } else {
                  window.location.href = "/login";
                }
              }}
              className="bg-red-500 text-white rounded-xl px-8 py-2 font-semibold hover:bg-red-600 transition"
            >
              Yes
            </button>
          </div>
        </DialogBox>
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

export default TADashboard;
