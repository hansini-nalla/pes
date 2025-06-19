import React, { useState } from 'react';
import {
  FiMenu, FiLogOut, FiHome,
  FiBook, FiEdit, FiShield, FiUsers,
  FiSend, FiEdit as FiEdit2, FiDownload, FiTrash2, FiUserPlus, FiUpload
} from 'react-icons/fi';

// Types
type Student = { name: string; email: string; };
type Exam = {
  name: string;
  course: string;
  batch: string;
  date: string;
  time: string;
  numQuestions: number;
  duration: number;
  totalMarks: number;
  k: number;
  totalStudents: number;
  solutions: string;
};
type CourseBatch = { course: string; batch: string };

// Sample/mock data
const sampleCourses = ["Artificial Intelligence", "Data Structures"];
const sampleBatches = ["101", "103"];
const sampleCourseBatchList: CourseBatch[] = [
  { course: "Artificial Intelligence", batch: "101" },
  { course: "Artificial Intelligence", batch: "103" },
  { course: "Data Structures", batch: "101" }
];
const sampleExams: Exam[] = [
  {
    name: "Quiz_1",
    course: "Artificial Intelligence",
    batch: "101",
    date: "2025-06-17",
    time: "19:00",
    numQuestions: 3,
    duration: 30,
    totalMarks: 30,
    k: 3,
    totalStudents: 20,
    solutions: "",
  },
  {
    name: "Quiz_2",
    course: "Data Structures",
    batch: "103",
    date: "2025-06-18",
    time: "10:00",
    numQuestions: 4,
    duration: 40,
    totalMarks: 40,
    k: 2,
    totalStudents: 15,
    solutions: "",
  }
];

// Simulate login user info (replace with real login data)
const loginUser = {
  name: "Vinit Menaria",
  email: "vinit.menaria@email.com"
};

const TeacherDashboard: React.FC = () => {
  const [showSidebar, setShowSidebar] = useState(true);
  const [activePage, setActivePage] = useState("home");
  const [selectedCourse, setSelectedCourse] = useState(sampleCourses[0]);
  const [selectedBatch, setSelectedBatch] = useState(sampleBatches[0]);
  const [showModal, setShowModal] = useState(false);
  const [exams, setExams] = useState<Exam[]>(sampleExams);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showExamDialog, setShowExamDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Courses & Batches state
  const [enrollments, setEnrollments] = useState<Record<string, Student[]>>({});

  // Enroll modal state
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollCourse, setEnrollCourse] = useState("");
  const [enrollBatch, setEnrollBatch] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [enrollSuccess, setEnrollSuccess] = useState(false);

  // Modal form state
  const [form, setForm] = useState<{
    name: string;
    course: string;
    batch: string;
    date: string;
    time: string;
    numQuestions: string;
    duration: string;
    totalMarks: string;
    k: string;
    solutions: File | undefined;
  }>({
    name: "",
    course: sampleCourses[0],
    batch: sampleBatches[0],
    date: "",
    time: "",
    numQuestions: "",
    duration: "",
    totalMarks: "",
    k: "",
    solutions: undefined,
  });

  // Role management state
  const [roleEmail, setRoleEmail] = useState("");
  const [roleType, setRoleType] = useState("Student");

  // Modal open handler
  const openModal = () => {
    setForm({
      name: "",
      course: selectedCourse,
      batch: selectedBatch,
      date: "",
      time: "",
      numQuestions: "",
      duration: "",
      totalMarks: "",
      k: "",
      solutions: undefined,
    });
    setShowModal(true);
  };

  // Modal close handler
  const closeModal = () => setShowModal(false);

  // Modal form change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as any;
    setForm(prev => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // Modal form submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setExams(prev => [
      ...prev,
      {
        name: form.name,
        course: form.course,
        batch: form.batch,
        date: form.date,
        time: form.time,
        numQuestions: Number(form.numQuestions),
        duration: Number(form.duration),
        totalMarks: Number(form.totalMarks),
        k: Number(form.k),
        totalStudents: Math.floor(Math.random() * 30) + 10,
        solutions: form.solutions ? (form.solutions as File).name : "",
      }
    ]);
    setShowModal(false);
    setShowExamDialog(true);
    setTimeout(() => setShowExamDialog(false), 1200);
  };

  // Enroll Student Modal handlers
  const openEnrollModal = (course: string, batch: string) => {
    setEnrollCourse(course);
    setEnrollBatch(batch);
    setStudentName("");
    setStudentEmail("");
    setShowEnrollModal(true);
    setEnrollSuccess(false);
  };
  const closeEnrollModal = () => setShowEnrollModal(false);

  const handleEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    const key = `${enrollCourse}_${enrollBatch}`;
    setEnrollments(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), { name: studentName, email: studentEmail }]
    }));
    setEnrollSuccess(true);
    setTimeout(() => {
      setShowEnrollModal(false);
      setEnrollSuccess(false);
    }, 1000);
  };

  // Download CSV for a course/batch (frontend only)
  const downloadCSV = (course: string, batch: string) => {
    const key = `${course}_${batch}`;
    const students = enrollments[key] || [];
    let csv = "Name,Email,Course,Batch\n";
    students.forEach(s => {
      csv += `"${s.name}","${s.email}","${course}","${batch}"\n`;
    });
    if (students.length === 0) {
      csv += "No students enrolled,,,\n";
    }
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${course}_${batch}_students.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Profile icon SVG
  const ProfileSVG = () => (
    <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
      <circle cx="19" cy="19" r="19" fill="#57418d" />
      <circle cx="19" cy="14" r="7" fill="#fff" />
      <ellipse cx="19" cy="29.5" rx="11" ry="7.5" fill="#fff" />
    </svg>
  );

  // Home Page
  const HomePage = (
    <div className="flex flex-col items-center justify-start w-full h-full pt-10 pb-4">
      <h1 className="text-4xl font-bold text-[#38365e] text-center mb-6">
        Welcome to Teacher Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 mt-6 w-full max-w-5xl">
        {[
          { icon: FiBook, label: 'Courses', count: sampleCourses.length, color: 'bg-blue-600' },
          { icon: FiUsers, label: 'Batches', count: sampleBatches.length, color: 'bg-green-600' },
          { icon: FiEdit, label: 'Exams', count: exams.length, color: 'bg-red-600' },
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
  );

  // Manage Roles Page
  const RolesPage = (
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
            setShowRoleDialog(true);
            setTimeout(() => setShowRoleDialog(false), 1200);
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
      {/* Role Updated Dialog */}
      {showRoleDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-xl px-8 py-8 flex flex-col items-center min-w-[320px]">
            <svg width={56} height={56} fill="none" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="28" fill="#6ddf99" />
              <path d="M18 30l7 7 13-13" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="text-lg text-[#235d3a] font-semibold text-center mb-1 mt-2">
              Role Updated Successfully!
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Courses and Batches Page
  const CoursesPage = (
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
            {sampleCourseBatchList.length > 0 ? (
              sampleCourseBatchList.map((row, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4 text-center text-base">{row.course}</td>
                  <td className="px-6 py-4 text-center text-base">{row.batch}</td>
                  <td className="px-6 py-4 text-center text-base flex gap-4 justify-center">
                    <button
                      title="Enroll Student"
                      className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition"
                      onClick={() => openEnrollModal(row.course, row.batch)}
                    >
                      <FiUserPlus /> Enroll Student
                    </button>
                    <button
                      title="Download CSV"
                      className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition"
                      onClick={() => downloadCSV(row.course, row.batch)}
                    >
                      <FiDownload /> Download CSV
                    </button>
                  </td>
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
      {/* Enroll Student Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <form
            className="bg-white rounded-2xl shadow-xl px-8 py-8 flex flex-col items-center w-[350px] max-w-full"
            onSubmit={handleEnroll}
          >
            <h2 className="text-2xl font-bold mb-6 text-center">Enroll Student</h2>
            <div className="flex flex-col gap-3 w-full">
              <div>
                <label className="font-semibold">Course:</label>
                <input
                  value={enrollCourse}
                  disabled
                  className="border px-3 py-2 rounded w-full mt-1 bg-gray-100"
                />
              </div>
              <div>
                <label className="font-semibold">Batch:</label>
                <input
                  value={enrollBatch}
                  disabled
                  className="border px-3 py-2 rounded w-full mt-1 bg-gray-100"
                />
              </div>
              <div>
                <label className="font-semibold">Student Name:</label>
                <input
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  className="border px-3 py-2 rounded w-full mt-1"
                  required
                />
              </div>
              <div>
                <label className="font-semibold">Student Email:</label>
                <input
                  type="email"
                  value={studentEmail}
                  onChange={e => setStudentEmail(e.target.value)}
                  className="border px-3 py-2 rounded w-full mt-1"
                  required
                />
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                type="submit"
                className="bg-[#57418d] text-white px-8 py-2 rounded-2xl font-semibold shadow transition hover:bg-[#402b6c]"
              >
                Enroll
              </button>
              <button
                type="button"
                onClick={closeEnrollModal}
                className="bg-gray-200 text-gray-700 rounded-2xl px-8 py-2 font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
            {enrollSuccess && (
              <div className="mt-4 text-green-600 font-semibold text-center">
                Student enrolled successfully!
              </div>
            )}
            <div className="mt-4 w-full">
              <div className="font-semibold mb-1">Enrolled Students:</div>
              <ul className="max-h-24 overflow-y-auto text-sm">
                {(enrollments[`${enrollCourse}_${enrollBatch}`] || []).map((s, i) => (
                  <li key={i} className="mb-1">
                    {s.name} ({s.email})
                  </li>
                ))}
                {(enrollments[`${enrollCourse}_${enrollBatch}`] || []).length === 0 && (
                  <li className="text-gray-400">No students enrolled yet.</li>
                )}
              </ul>
            </div>
          </form>
        </div>
      )}
    </div>
  );

  // Exam Management Page
  const ExamPage = (
    <div className="flex flex-col items-center justify-start w-full h-full pt-10 pb-4">
      <h2 className="text-3xl font-bold mb-10 text-[#38365e] text-center">Exam Management</h2>
      <div className="w-full flex flex-row items-center justify-center gap-8 max-w-2xl mb-2">
        <div className="flex flex-col md:flex-row items-center gap-4 flex-1">
          <label className="text-[#38365e] font-semibold w-24 text-right md:text-left">Course</label>
          <select
            value={selectedCourse}
            onChange={e => {
              setSelectedCourse(e.target.value);
              setSelectedBatch(sampleBatches[0]);
            }}
            className="border-2 border-[#b3aedd] focus:border-blue-400 px-4 py-2 rounded-xl w-44 outline-none transition"
          >
            {sampleCourses.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 flex-1">
          <label className="text-[#38365e] font-semibold w-24 text-right md:text-left">Batch</label>
          <select
            value={selectedBatch}
            onChange={e => setSelectedBatch(e.target.value)}
            className="border-2 border-[#b3aedd] focus:border-blue-400 px-4 py-2 rounded-xl w-44 outline-none transition"
          >
            {sampleBatches.map(b => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div className="flex flex-1 justify-end items-center">
          <button
            onClick={openModal}
            className="px-8 py-2 rounded-2xl font-semibold shadow transition text-white text-base mt-0 ml-4 bg-[#57418d] hover:bg-[#402b6c]"
            style={{ minWidth: 160, fontSize: 18, lineHeight: "24px", whiteSpace: "nowrap" }}
          >
            Schedule Exam
          </button>
        </div>
      </div>
      <div className="w-full max-w-5xl mt-10">
        <table className="w-full border-separate border-spacing-y-4">
          <thead>
            <tr>
              <th className="bg-[#57418d] text-white py-3 px-4 rounded-l-2xl text-base font-semibold text-center">Exam Name</th>
              <th className="bg-[#57418d] text-white py-3 px-4 text-base font-semibold text-center">Batch</th>
              <th className="bg-[#57418d] text-white py-3 px-4 text-base font-semibold text-center">Date</th>
              <th className="bg-[#57418d] text-white py-3 px-4 text-base font-semibold text-center">Time</th>
              <th className="bg-[#57418d] text-white py-3 px-4 text-base font-semibold text-center">No. of questions</th>
              <th className="bg-[#57418d] text-white py-3 px-4 text-base font-semibold text-center">Duration</th>
              <th className="bg-[#57418d] text-white py-3 px-4 text-base font-semibold text-center">Total Marks</th>
              <th className="bg-[#57418d] text-white py-3 px-4 text-base font-semibold text-center">K</th>
              <th className="bg-[#57418d] text-white py-3 px-4 text-base font-semibold text-center">Total Students</th>
              <th className="bg-[#57418d] text-white py-3 px-4 text-base font-semibold text-center">Solutions</th>
              <th className="bg-[#57418d] text-white py-3 px-4 rounded-r-2xl text-base font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {exams.length > 0 ? (
              exams.map((ex, i) => (
                <tr key={i}>
                  <td className="px-4 py-2 text-center">{ex.name}</td>
                  <td className="px-4 py-2 text-center">{ex.batch}</td>
                  <td className="px-4 py-2 text-center">{ex.date}</td>
                  <td className="px-4 py-2 text-center">{ex.time}</td>
                  <td className="px-4 py-2 text-center">{ex.numQuestions}</td>
                  <td className="px-4 py-2 text-center">{ex.duration} mins</td>
                  <td className="px-4 py-2 text-center">{ex.totalMarks}</td>
                  <td className="px-4 py-2 text-center">{ex.k}</td>
                  <td className="px-4 py-2 text-center">{ex.totalStudents || '-'}</td>
                  <td className="px-4 py-2 text-center">
                    <span className="text-blue-700 underline cursor-pointer">View Solutions</span>
                  </td>
                  <td className="px-4 py-2 text-center flex gap-2 justify-center">
                    <button title="Edit" className="border-2 border-green-300 rounded-lg p-1 hover:bg-green-50">
                      <FiEdit2 className="text-green-600 text-xl" />
                    </button>
                    <button title="Download" className="border-2 border-blue-300 rounded-lg p-1 hover:bg-blue-50">
                      <FiDownload className="text-blue-800 text-xl" />
                    </button>
                    <button title="Upload" className="border-2 border-purple-300 rounded-lg p-1 hover:bg-purple-50">
                      <FiUpload className="text-purple-800 text-xl" />
                    </button>
                    <button title="Send" className="border-2 border-blue-200 rounded-lg p-1 hover:bg-blue-50" onClick={() => {
                      setShowSendDialog(true);
                      setTimeout(() => setShowSendDialog(false), 1200);
                    }}>
                      <FiSend className="text-blue-400 text-xl" />
                    </button>
                    <button title="Delete" className="border-2 border-red-300 rounded-lg p-1 hover:bg-red-50">
                      <FiTrash2 className="text-red-500 text-xl" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={11} className="text-center text-gray-500 py-4">
                  No exams scheduled yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="flex items-center justify-center w-full h-full">
            <form
              className="bg-white rounded-2xl shadow-xl px-8 py-8 flex flex-col items-center w-[400px] max-w-full overflow-y-auto"
              style={{ maxHeight: "90vh" }}
              onSubmit={handleSubmit}
            >
              <h2 className="text-2xl font-bold mb-6 text-center">Schedule Exam</h2>
              <div className="flex flex-col gap-3 w-full">
                <label className="font-semibold">Name:
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="border px-3 py-2 rounded w-full mt-1"
                    placeholder="Exam Name"
                    required
                  />
                </label>
                <label className="font-semibold">Date:
                  <input
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={handleChange}
                    className="border px-3 py-2 rounded w-full mt-1"
                    required
                  />
                </label>
                <label className="font-semibold">Time (24-hour):
                  <input
                    name="time"
                    type="time"
                    value={form.time}
                    onChange={handleChange}
                    className="border px-3 py-2 rounded w-full mt-1"
                    required
                  />
                </label>
                <label className="font-semibold">Number of Questions:
                  <input
                    name="numQuestions"
                    type="number"
                    min={1}
                    value={form.numQuestions}
                    onChange={handleChange}
                    className="border px-3 py-2 rounded w-full mt-1"
                    required
                  />
                </label>
                <label className="font-semibold">Duration (in mins.):
                  <input
                    name="duration"
                    type="number"
                    min={1}
                    value={form.duration}
                    onChange={handleChange}
                    className="border px-3 py-2 rounded w-full mt-1"
                    required
                  />
                </label>
                <label className="font-semibold">Total Marks:
                  <input
                    name="totalMarks"
                    type="number"
                    min={1}
                    value={form.totalMarks}
                    onChange={handleChange}
                    className="border px-3 py-2 rounded w-full mt-1"
                    required
                  />
                </label>
                <label className="font-semibold">No. of Peers (K):
                  <input
                    name="k"
                    type="number"
                    min={1}
                    value={form.k}
                    onChange={handleChange}
                    className="border px-3 py-2 rounded w-full mt-1"
                    required
                  />
                </label>
                <label className="font-semibold">Solutions:
                  <div className="flex items-center">
                    <label className="mr-2">
                      <input
                        name="solutions"
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleChange}
                        className="hidden"
                        id="solution-file"
                      />
                      <span
                        className="inline-block px-3 py-1 bg-[#232323] text-white rounded cursor-pointer"
                        style={{ fontWeight: 500 }}
                        onClick={() => document.getElementById('solution-file')?.click()}
                      >
                        Choose File
                      </span>
                    </label>
                    <span className="ml-2 text-sm text-gray-700">
                      {form.solutions ? (form.solutions as File).name : "No file chosen"}
                    </span>
                  </div>
                </label>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="bg-[#57418d] text-white px-8 py-2 rounded-2xl font-semibold shadow transition hover:bg-[#402b6c]"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-200 text-gray-700 rounded-2xl px-8 py-2 font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Exam Scheduled Dialog */}
      {showExamDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-xl px-8 py-8 flex flex-col items-center min-w-[320px]">
            <svg width={56} height={56} fill="none" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="28" fill="#6ddf99" />
              <path d="M18 30l7 7 13-13" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="text-lg text-[#235d3a] font-semibold text-center mb-1 mt-2">
              Exam Scheduled Successfully!
            </div>
          </div>
        </div>
      )}
      {/* Send Dialog */}
      {showSendDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-xl px-8 py-8 flex flex-col items-center min-w-[320px]">
            <svg width={56} height={56} fill="none" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="28" fill="#6ddf99" />
              <path d="M18 30l7 7 13-13" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="text-lg text-[#235d3a] font-semibold text-center mb-1 mt-2">
              Solutions sent to students for evaluation!
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Sidebar navigation handler
  const handleSidebarNav = (key: string) => {
    if (key === "logout") {
      setShowLogoutDialog(true);
    } else {
      setActivePage(key);
    }
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
            <li
              onClick={() => handleSidebarNav("home")}
              className={`cursor-pointer ${activePage === "home" ? 'bg-[#57418d]' : ''} flex items-center px-4 py-2 rounded transition`}
            >
              <FiHome className={`transition-all ${showSidebar ? 'mr-2 text-xl' : 'text-3xl'}`} />
              {showSidebar && "Home"}
            </li>
            <li
              onClick={() => handleSidebarNav("roleManager")}
              className={`cursor-pointer ${activePage === "roleManager" ? 'bg-[#57418d]' : ''} flex items-center px-4 py-2 rounded transition`}
            >
              <FiShield className={`transition-all ${showSidebar ? 'mr-2 text-xl' : 'text-3xl'}`} />
              {showSidebar && "Manage Roles"}
            </li>
            <li
              onClick={() => handleSidebarNav("courses")}
              className={`cursor-pointer ${activePage === "courses" ? 'bg-[#57418d]' : ''} flex items-center px-4 py-2 rounded transition`}
            >
              <FiBook className={`transition-all ${showSidebar ? 'mr-2 text-xl' : 'text-3xl'}`} />
              {showSidebar && "Courses"}
            </li>
            <li
              onClick={() => handleSidebarNav("exams")}
              className={`cursor-pointer ${activePage === "exams" ? 'bg-[#57418d]' : ''} flex items-center px-4 py-2 rounded transition`}
            >
              <FiEdit className={`transition-all ${showSidebar ? 'mr-2 text-xl' : 'text-3xl'}`} />
              {showSidebar && "Exams"}
            </li>
          </ul>
        </div>
        <button
          className="flex items-center justify-center gap-2 hover:text-red-400 transition"
          onClick={() => handleSidebarNav("logout")}
        >
          <FiLogOut className={`${showSidebar ? 'mr-2 text-xl' : 'text-3xl'}`} />
          {showSidebar && 'Logout'}
        </button>
      </div>
      {/* Main Content */}
      <div className="flex-1 relative overflow-y-auto flex justify-center items-start">
        {/* Profile button */}
        <div className="absolute top-4 right-6 z-20">
          <button
            className="p-2 flex items-center justify-center rounded-full border-2 border-transparent hover:border-blue-300 transition active:scale-95 bg-white shadow"
            style={{ boxShadow: '0 2px 14px 0 rgba(87,65,141,0.16)' }}
            onClick={() => setShowProfile((prev) => !prev)}
            aria-label="Profile"
          >
            <ProfileSVG />
          </button>
          {showProfile && (
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
              <div className="space-y-2">
                <p><strong>Name:</strong> {loginUser.name}</p>
                <p><strong>Email:</strong> {loginUser.email}</p>
              </div>
            </div>
          )}
        </div>
        {/* Main content area */}
        <div
          className="bg-white rounded-3xl shadow-lg w-full h-auto mt-24 mb-8 mx-4 p-0 flex items-start justify-center overflow-auto max-w-6xl"
          style={{
            minHeight: "calc(100vh - 120px)",
            boxShadow: '0 2px 14px 0 rgba(87,65,141,0.16)'
          }}
        >
          {/* Render active page content */}
          {activePage === "home" && HomePage}
          {activePage === "roleManager" && RolesPage}
          {activePage === "courses" && CoursesPage}
          {activePage === "exams" && ExamPage}
        </div>
        {/* Logout Dialog */}
        {showLogoutDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-2xl shadow-xl px-8 py-8 flex flex-col items-center min-w-[320px] relative animate-fadein">
              <div className="mb-2">
                <svg width={56} height={56} fill="none" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="28" fill="#6ddf99" />
                  <path d="M18 30l7 7 13-13" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="text-lg text-[#235d3a] font-semibold text-center mb-1">
                Are you sure you want to logout?
              </div>
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => {
                    setShowLogoutDialog(false);
                    setTimeout(() => {
                      window.location.href = "/login";
                    }, 200);
                  }}
                  className="bg-[#57418d] text-white px-8 py-2 rounded-2xl font-semibold shadow transition hover:bg-[#402b6c]"
                >
                  Yes, Logout
                </button>
                <button
                  onClick={() => setShowLogoutDialog(false)}
                  className="bg-gray-200 text-gray-700 rounded-2xl px-8 py-2 font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;