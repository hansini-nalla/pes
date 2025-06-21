// StudentDashboard.tsx
import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import {
  FiMenu,
  FiLogOut,
  FiHome,
  FiBook,
  FiUsers,
  FiCheckCircle,
  FiUploadCloud,
  FiUser,
  FiEdit,
  FiTrash,
  FiUpload,
  FiSend,
  FiDownload
} from 'react-icons/fi';

interface CourseTestSubmission {
  file: File | null;
}

const courseTests: Record<string, string[]> = {
  Maths: ['Test 1', 'Test 2'],
  Physics: ['Test 1', 'Test 2'],
  'AI/ML': ['Test 1', 'Test 2']
};

const PORT = import.meta.env.VITE_BACKEND_PORT || 5000;

const StudentDashboard = ({ onLogout }: { onLogout?: () => void }) => {
  const token = localStorage.getItem('token');
  //const [counts, setCounts] = useState({ courses: 0, batches: 0, exams: 0 });
  const [profileData, setProfileData] = useState({ name: "", email: "", role: "" });
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [activePage, setActivePage] = useState('dashboard');
  const [showSidebar, setShowSidebar] = useState(true);
  const [logoutDialog, setLogoutDialog] = useState(false);
  const [submissions, setSubmissions] = useState<Record<string, Record<string, CourseTestSubmission>>>({});
  const [evaluations, setEvaluations] = useState<Record<string, Record<string, { pdfs: string[]; marks: Record<number, string> }>>>({});
  const [tickets, setTickets] = useState<Record<string, { title: string; description: string; file?: File | null }>>({});

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
    }));
  };

  const handleDelete = (course: string, test: string) => {
    const updated = { ...submissions };
    delete updated[course]?.[test];
    setSubmissions(updated);
  };

  const handleMarkChange = (course: string, test: string, index: number, value: string) => {
    setEvaluations(prev => ({
      ...prev,
      [course]: {
        ...prev[course],
        [test]: {
          ...prev[course]?.[test],
          marks: {
            ...prev[course]?.[test]?.marks,
            [index]: value
          }
        }
      }
    }));
  };

  const handleTicketChange = (course: string, field: 'title' | 'description', value: string) => {
    setTickets(prev => ({
      ...prev,
      [course]: {
        ...prev[course],
        [field]: value
      }
    }));
  };

  const handleTicketFile = (course: string, file: File | null) => {
    setTickets(prev => ({
      ...prev,
      [course]: {
        ...prev[course],
        file
      }
    }));
  };

  const handleSubmitTicket = (course: string) => {
    alert(`Ticket submitted for ${course}: ${tickets[course]?.title}`);
  };

  const UploadIcon = ({ course, test, onSubmit }: {
    course: string;
    test: string;
    onSubmit: (course: string, test: string, file: File | null) => void;
  }) => (
    <>
      <input
        type="file"
        accept="application/pdf"
        id={`upload-${course}-${test}`}
        hidden
        onChange={(e) => onSubmit(course, test, e.target.files?.[0] || null)}
      />
      <label htmlFor={`upload-${course}-${test}`} className="p-2 border-2 border-purple-400 rounded-lg text-purple-600 hover:bg-purple-100 cursor-pointer">
        <FiUpload />
      </label>
    </>
  );

  const coursesPage = (
    <div className="p-10 w-full max-w-5xl space-y-8">
      <h2 className="text-3xl font-bold text-[#38365e] mb-4">Your Courses</h2>
      {Object.keys(courseTests).map(course => (
        <div key={course} className="bg-white rounded-2xl shadow p-6 space-y-4">
          <h3 className="text-xl font-semibold text-[#57418d]">{course}</h3>
          <div className="space-y-4">
            {courseTests[course].map(test => (
              <div key={test} className="border rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <div className="font-medium text-[#38365e]">{test}</div>
                  <div className="flex items-center space-x-3 text-xl">
                    {submissions[course]?.[test]?.file && (
                      <button onClick={() => alert(`Edit ${test}`)} className="p-2 border-2 border-green-400 rounded-lg text-green-600 hover:bg-green-100">
                        <FiEdit />
                      </button>
                    )}
                    {submissions[course]?.[test]?.file && (
                      <a
                        href={URL.createObjectURL(submissions[course][test].file!)}
                        download={submissions[course][test].file!.name}
                        className="p-2 border-2 border-blue-400 rounded-lg text-blue-600 hover:bg-blue-100"
                      >
                        <FiDownload />
                      </a>
                    )}
                    <UploadIcon course={course} test={test} onSubmit={handleUpload} />
                    <button onClick={() => alert(`Submitted: ${test}`)} className="p-2 border-2 border-cyan-400 rounded-lg text-cyan-600 hover:bg-cyan-100">
                      <FiSend />
                    </button>
                    {submissions[course]?.[test]?.file && (
                      <button onClick={() => handleDelete(course, test)} className="p-2 border-2 border-red-400 rounded-lg text-red-600 hover:bg-red-100">
                        <FiTrash />
                      </button>
                    )}
                  </div>
                </div>
                {submissions[course]?.[test]?.file && (
                  <p className="text-sm mt-2 text-gray-600">Uploaded: {submissions[course][test].file!.name}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const peerEvaluationPage = (
    <div className="p-10 w-full max-w-5xl space-y-8">
      <h2 className="text-3xl font-bold text-[#38365e] mb-4">Peer Evaluation</h2>
      {Object.keys(courseTests).map(course => (
        <div key={course} className="bg-white rounded-2xl shadow p-6 space-y-4">
          <h3 className="text-xl font-semibold text-[#57418d]">{course}</h3>
          {courseTests[course].map(test => (
            <div key={test} className="border rounded-xl p-4 shadow-sm">
              <h4 className="text-lg font-medium text-[#38365e] mb-2">{test} - Marks out of 10</h4>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="mb-3 flex items-center space-x-4">
                  <a
                    href={`https://example.com/pdf/${course}-${test}-file${i + 1}.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    View PDF {i + 1}
                  </a>
                  <input
                    type="text"
                    placeholder="Marks /10"
                    className="border px-3 py-1 rounded-xl text-sm"
                    value={evaluations[course]?.[test]?.marks?.[i] || ''}
                    onChange={(e) => handleMarkChange(course, test, i, e.target.value)}
                  />
                </div>
              ))}
              <button className="mt-2 bg-[#57418d] text-white px-4 py-2 rounded-xl hover:bg-[#402b6c]">Submit Marks</button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  const raiseTicketPage = (
    <div className="p-10 w-full max-w-4xl space-y-8">
      <h2 className="text-3xl font-bold text-[#38365e] mb-4">Raise Ticket</h2>
      {Object.keys(courseTests).map(course => (
        <div key={course} className="bg-white rounded-xl p-6 shadow space-y-4">
          <h3 className="text-xl font-semibold text-[#57418d]">{course}</h3>
          <input
            type="text"
            placeholder="Issue Title"
            className="border px-4 py-2 rounded-xl w-full"
            value={tickets[course]?.title || ''}
            onChange={(e) => handleTicketChange(course, 'title', e.target.value)}
          />
          <textarea
            placeholder="Describe your issue..."
            className="border px-4 py-2 rounded-xl w-full"
            rows={4}
            value={tickets[course]?.description || ''}
            onChange={(e) => handleTicketChange(course, 'description', e.target.value)}
          />
          <input
            type="file"
            className="block w-full text-sm"
            onChange={(e) => handleTicketFile(course, e.target.files?.[0] || null)}
          />
          <button onClick={() => handleSubmitTicket(course)} className="bg-[#57418d] text-white px-6 py-2 rounded-xl hover:bg-[#402b6c]">Submit Ticket</button>
        </div>
      ))}
    </div>
  );

  const viewMarksPage = (
    <div className="p-10 w-full max-w-3xl">
      <h2 className="text-3xl font-bold text-[#38365e] mb-6">Your Marks</h2>
      <table className="w-full text-left border-separate border-spacing-y-3">
        <thead>
          <tr>
            <th className="bg-[#57418d] text-white px-4 py-3 rounded-l-xl">Subject</th>
            <th className="bg-[#57418d] text-white px-4 py-3">Internal</th>
            <th className="bg-[#57418d] text-white px-4 py-3 rounded-r-xl">Final</th>
          </tr>
        </thead>
        <tbody>
          {[
            { subject: 'Maths', internal: 23, final: 40 },
            { subject: 'AI/ML', internal: 25, final: 45 }
          ].map((m, idx) => (
            <tr key={idx}>
              <td className="px-4 py-2 text-[#38365e]">{m.subject}</td>
              <td className="px-4 py-2">{m.internal}</td>
              <td className="px-4 py-2">{m.final}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const dashboardPage = (
    <div className="flex flex-col items-center justify-center w-full h-full py-10">
      <h1 className="text-4xl font-bold text-[#38365e] mb-6">Welcome, {profileData.name}</h1>
      <p className="text-lg text-[#38365e] text-center">Access your courses, submit answers, view marks, and more.</p>
      <div className="mt-10 flex flex-col md:flex-row justify-center gap-6 w-full max-w-2xl">
              <button
                onClick={() => setActivePage('courses')}
                className="bg-purple-700 text-white px-10 py-4 text-lg rounded-3xl"
              >
                Courses
              </button>
              <button
                onClick={() => setActivePage('peerEvaluation')}
                className="bg-purple-700 text-white px-10 py-4 text-lg rounded-3xl"
              >
                Peer Evaluation
              </button>
              <button
                onClick={() => setActivePage('viewMarks')}
                className="bg-purple-700 text-white px-10 py-4 text-lg rounded-3xl"
              >
                View Marks
              </button>
              <button
                onClick={() => setActivePage('raiseTicket')}
                className="bg-purple-700 text-white px-10 py-4 text-lg rounded-3xl"
              >
                Raise Ticket
              </button>
            </div>
    </div>
  );

  const pages: Record<string, JSX.Element> = {
    dashboard: dashboardPage,
    courses: coursesPage,
    peerEvaluation: peerEvaluationPage,
    viewMarks: viewMarksPage,
    raiseTicket: raiseTicketPage,
    profile: <div className="p-10">Profile page</div>
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
