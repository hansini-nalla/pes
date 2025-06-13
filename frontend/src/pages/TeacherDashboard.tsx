import React, { useState, useEffect } from 'react';
import type { JSX } from 'react';
import {
  FiMenu, FiLogOut, FiHome,
  FiBook, FiUsers, FiEdit, FiShield
} from 'react-icons/fi';

// Types for backend data
interface ExamRecord {
  course: string;
  batch: string;
  date: string;
}
interface SummaryData {
  courses: number;
  batches: number;
  exams: number;
}
interface CourseBatch {
  course: string;
  batch: string;
}

const TeacherDashboard = ({ onLogout }: { onLogout?: () => void }) => {
  // Data from backend (simulate with state/fetch)
  const [summary, setSummary] = useState<SummaryData>({ courses: 0, batches: 0, exams: 0 });
  const [courseBatchList, setCourseBatchList] = useState<CourseBatch[]>([]);
  const [examRecords, setExamRecords] = useState<ExamRecord[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [batches, setBatches] = useState<string[]>([]);
  const [profileData, setProfileData] = useState({ name: "", email: "" });

  // UI state
  const [activePage, setActivePage] = useState("home");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [showExamMsg, setShowExamMsg] = useState(false);
  const [showRoleMsg, setShowRoleMsg] = useState(false);
  const [showProfileMsg, setShowProfileMsg] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [roleEmail, setRoleEmail] = useState("");
  const [roleType, setRoleType] = useState("Student");
  const [logoutDialog, setLogoutDialog] = useState(false);

  // Validation errors for profile
  const [profileErrors, setProfileErrors] = useState<{ name?: string, email?: string }>({});

  // Fetch all backend data
  useEffect(() => {
    fetch('/api/summary')
      .then(r => r.json())
      .then((data: SummaryData) => setSummary(data));

    fetch('/api/course-batches')
      .then(r => r.json())
      .then((data: CourseBatch[]) => setCourseBatchList(data));

    fetch('/api/exams')
      .then(r => r.json())
      .then((data: ExamRecord[]) => setExamRecords(data));

    fetch('/api/courses')
      .then(r => r.json())
      .then((data: string[]) => setCourses(data));

    fetch('/api/profile')
      .then(r => r.json())
      .then((data: { name: string, email: string }) => {
        setProfileData(data);
        setProfileSaved(!!data.name && !!data.email);
      });
  }, []);

  // Fetch batches when a course is selected
  useEffect(() => {
    if (selectedCourse) {
      fetch(`/api/batches?course=${encodeURIComponent(selectedCourse)}`)
        .then(r => r.json())
        .then((b: string[]) => setBatches(b));
    } else {
      setBatches([]);
      setSelectedBatch("");
    }
  }, [selectedCourse]);

  // Exam scheduling
  const handleExamSchedule = () => {
    if (!selectedCourse || !selectedBatch) return;
    fetch('/api/schedule-exam', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course: selectedCourse, batch: selectedBatch })
    })
      .then(r => r.json())
      .then((newExam: ExamRecord) => {
        setExamRecords(prev => [...prev, newExam]);
        setShowExamMsg(true);
        setTimeout(() => setShowExamMsg(false), 900); // fast hide
      });
  };

  // Save profile (with validation)
  const handleSaveProfile = () => {
    const errors: { name?: string, email?: string } = {};
    if (!profileData.name.trim()) errors.name = "Name is required";
    if (!profileData.email.trim()) errors.email = "Email is required";
    setProfileErrors(errors);
    if (Object.keys(errors).length > 0) return;
    fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    })
      .then(() => {
        setProfileSaved(true);
        setActivePage("home");
        setShowProfilePopup(false);
        setShowProfileMsg(true);
        setTimeout(() => setShowProfileMsg(false), 900); // fast hide
      });
  };

  // Role update
  const handleRoleUpdate = () => {
    fetch('/api/update-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: roleEmail, role: roleType })
    })
      .then(() => {
        setShowRoleMsg(true);
        setTimeout(() => setShowRoleMsg(false), 900); // fast hide
      });
  };

  // Profile icon SVG (solid avatar style)
  const ProfileSVG = () => (
    <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
      <circle cx="19" cy="19" r="19" fill="#57418d" />
      <circle cx="19" cy="14" r="7" fill="#fff" />
      <ellipse cx="19" cy="29.5" rx="11" ry="7.5" fill="#fff" />
    </svg>
  );

  // Dialog Box
  const DialogBox = ({
    show,
    message,
    children
  }: { show: boolean, message: string, children?: React.ReactNode }) => {
    if (!show) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
        <div className="bg-white rounded-2xl shadow-xl px-8 py-8 flex flex-col items-center min-w-[320px] relative animate-fadein">
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

  // Main pages
  const pages: Record<string, JSX.Element> = {
    home: (
      <div className="flex flex-col items-center justify-start w-full h-full pt-10 pb-4">
        <h1 className="text-4xl font-bold text-[#38365e] text-center mb-6">
          Welcome to Teacher Dashboard
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 mt-6 w-full max-w-5xl">
          {[
            { icon: FiBook, label: 'Courses', count: summary.courses, color: 'bg-blue-600' },
            { icon: FiUsers, label: 'Batches', count: summary.batches, color: 'bg-green-600' },
            { icon: FiEdit, label: 'Exams', count: summary.exams, color: 'bg-red-600' },
          ].map(c => (
            <div key={c.label} className={`${c.color} p-6 rounded-3xl text-white flex flex-col justify-center items-center h-40`}>
              <c.icon className="mb-2" size={40} />
              <h3 className="text-lg font-semibold">{c.label}</h3>
              <p className="text-3xl font-bold">{c.count}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col md:flex-row justify-center gap-6 w-full max-w-2xl">
         <button
  onClick={() => setActivePage('courses')}
  className="bg-purple-700 text-white px-10 py-4 text-lg rounded-3xl"
>
  Manage Courses
</button>
<button
  onClick={() => setActivePage('exams')}
  className="bg-purple-700 text-white px-10 py-4 text-lg rounded-3xl"
>
  Schedule Exams
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
    ),
    exams: (
      <div className="flex flex-col items-center justify-start w-full h-full pt-10 pb-4">
        <h2 className="text-3xl font-bold mb-10 text-[#38365e] text-center">Exam Management</h2>
        <div className="w-full flex flex-row items-center justify-center gap-8 max-w-2xl mb-2">
          <div className="flex flex-col md:flex-row items-center gap-4 flex-1">
            <label className="text-[#38365e] font-semibold w-24 text-right md:text-left">Course</label>
            <select
              value={selectedCourse}
              onChange={e => {
                setSelectedCourse(e.target.value);
                setSelectedBatch("");
              }}
              className="border-2 border-[#b3aedd] focus:border-blue-400 px-4 py-2 rounded-xl w-44 outline-none transition"
            >
              <option value="">Select Course</option>
              {courses.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4 flex-1">
            <label className="text-[#38365e] font-semibold w-24 text-right md:text-left">Batch</label>
            <select
              disabled={!selectedCourse}
              value={selectedBatch}
              onChange={e => setSelectedBatch(e.target.value)}
              className={`border-2 border-[#b3aedd] focus:border-blue-400 px-4 py-2 rounded-xl w-44 outline-none transition ${!selectedCourse ? 'bg-gray-100 text-gray-500' : ''}`}
            >
              <option>{!selectedCourse ? 'No Batches Available' : 'Select Batch'}</option>
              {selectedCourse && batches.map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div className="flex flex-1 justify-end">
            <button
              onClick={handleExamSchedule}
              disabled={!(selectedCourse && selectedBatch)}
              className={`px-6 py-2 rounded-2xl font-semibold shadow transition text-white text-base mt-0 ml-4 ${selectedCourse && selectedBatch ? 'bg-[#8f8f9d] hover:bg-[#57418d]' : 'bg-gray-400 cursor-not-allowed'}`}
            >
              Schedule Exam
            </button>
          </div>
        </div>
        <div className="w-full max-w-5xl mt-10">
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
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {examRecords.length > 0 ? (
                examRecords.map((ex, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4 text-center text-base">{ex.course}</td>
                    <td className="px-6 py-4 text-center text-base">{ex.batch}</td>
                    <td className="px-6 py-4 text-center text-base">{ex.date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center text-gray-500 py-4">
                    No exams scheduled yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    ),
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
            {showSidebar ? 'Teacher Panel' : 'TP'}
          </h2>
          <ul className="space-y-3 w-full">
            {['home', 'roleManager', 'courses', 'exams'].map((key) => {
              const icons: Record<string, any> = { home: FiHome, roleManager: FiShield, courses: FiBook, exams: FiEdit };
              const Icon = icons[key];
              return (
                <li key={key} onClick={() => setActivePage(key)}
                  className={`cursor-pointer ${activePage === key ? 'bg-[#57418d]' : ''} flex items-center px-4 py-2 rounded transition`}>
                  <Icon className={`transition-all ${showSidebar ? 'mr-2 text-xl' : 'text-3xl'} ${!showSidebar ? 'text-3xl md:text-4xl' : ''}`} />
                  {
                    showSidebar && (key === 'roleManager' ? 'Manage Roles' : key.charAt(0).toUpperCase() + key.slice(1))
                  }
                </li>
              );
            })}
          </ul>
        </div>
        <button
          onClick={() => setLogoutDialog(true)}
          className="flex items-center justify-center gap-2 hover:text-red-400 transition"
        >
          <FiLogOut className={`${showSidebar ? 'mr-2 text-xl' : 'text-3xl'} ${!showSidebar ? 'text-3xl md:text-4xl' : ''}`} />
          {showSidebar && 'Logout'}
        </button>
      </div>
      {/* Main Content */}
      <div className="flex-1 relative overflow-y-auto flex justify-center items-start">
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
              {!profileSaved ? (
                <div className="space-y-4">
                  <div>
                    <input
                      value={profileData.name}
                      onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                      placeholder="Name"
                      className="border focus:border-blue-400 px-4 py-2 rounded-xl w-full"
                    />
                    {profileErrors.name && <p className="text-red-600 text-sm mt-1">{profileErrors.name}</p>}
                  </div>
                  <div>
                    <input
                      value={profileData.email}
                      onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                      placeholder="Email"
                      className="border focus:border-blue-400 px-4 py-2 rounded-xl w-full"
                    />
                    {profileErrors.email && <p className="text-red-600 text-sm mt-1">{profileErrors.email}</p>}
                  </div>
                  <button
                    onClick={handleSaveProfile}
                    className="bg-purple-700 text-white px-4 py-2 rounded-3xl w-full"
                  >
                    Save Profile
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p><strong>Name:</strong> {profileData.name}</p>
                  <p><strong>Email:</strong> {profileData.email}</p>
                </div>
              )}
            </div>
          )}
        </div>
        {/* Single rounded main content area, always up towards the top, starting below the profile icon */}
        <div
          className="bg-white rounded-3xl shadow-lg w-full h-auto mt-24 mb-8 mx-4 p-0 flex items-start justify-center overflow-auto max-w-6xl"
          style={{
            minHeight: "calc(100vh - 120px)",
            boxShadow: '0 2px 24px 0 rgba(87,65,141,0.10)'
          }}
        >
          <div className="w-full">
            {pages[activePage]}
          </div>
        </div>
        <DialogBox show={showProfileMsg} message="Profile Saved Successfully!" />
        <DialogBox show={showExamMsg} message="Exam Scheduled Successfully!" />
        <DialogBox show={showRoleMsg} message="Role Updated Successfully!" />
        {/* Logout Dialog */}
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
    </div>
  );
};

export default TeacherDashboard;