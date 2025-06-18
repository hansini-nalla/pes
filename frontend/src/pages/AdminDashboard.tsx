import { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChalkboardTeacher, FaBook, FaUserGraduate,  FaBoxes, FaHome } from 'react-icons/fa';
import axios from 'axios';

const PORT = import.meta.env.VITE_BACKEND_PORT || 5000;
const token = localStorage.getItem('token');

type Tab = 'home' | 'course' | 'batch' | 'role' | 'student' | 'teacher';
type Course = {
  _id: string;
  name: string;
  code: string;
};

const AdminDashboard = () => {
  const [counts, setCounts] = useState({ teachers: 0, courses: 0, students: 0 });

  const [activeTab, setActiveTab] = useState<Tab>('home');
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseIdToDelete, setCourseIdToDelete] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);

  const [batchName, setBatchName] = useState('');
  const [batchCourseCode, setBatchCourseCode] = useState('');
  const [batchToDelete, setBatchToDelete] = useState('');
  const [batches, setBatches] = useState([]);

  const [teachers, setTeachers] = useState([]);
  const [teacherToDelete, setTeacherToDelete] = useState('');
  const [assignEmail, setAssignEmail] = useState('');
  const [assignCourseCode, setAssignCourseCode] = useState('');
  const [unassignEmail, setUnassignEmail] = useState('');
  const [unassignCourseCode, setUnassignCourseCode] = useState('');

  const [students, setStudents] = useState([]);
  const [studentToDelete, setStudentToDelete] = useState('');
  const [assignStudentEmail, setAssignStudentEmail] = useState('');
  const [assignStudentCourseCode, setAssignStudentCourseCode] = useState('');
  const [unassignStudentEmail, setUnassignStudentEmail] = useState('');
  const [unassignStudentCourseCode, setUnassignStudentCourseCode] = useState('');

  useEffect(() => {
    fetch(`http://localhost:${PORT}/api/dashboard/counts`)
      .then(res => res.json())
      .then(data => {
        setCounts({
          teachers: data.teachers,
          courses: data.courses,
          students: data.students,
        });
      })
      .catch(err => console.error('Failed to fetch dashboard counts:', err));
  }, []);
  
  const fetchCourses = async () => {
    try {
      const res = await axios.get(`http://localhost:${PORT}/api/admin/courses`,{
          headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCourses(res.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };
  const handleAddCourse = async () => {
    try {
      await axios.post(`http://localhost:${PORT}/api/admin/courses`, {
        name: courseName,
        code: courseCode,
      },
      {
      headers: {
        Authorization: `Bearer ${token}`,
      },
  });
      alert('Course added successfully');
      setCourseName('');
      setCourseCode('');
      fetchCourses(); // Refresh list
    } catch (error) {
      console.error(error);
      alert('Failed to add course');
    }
  };
  const handleDeleteCourse = async () => {
    try {
      await axios.delete(`http://localhost:${PORT}/api/admin/courses/code/${courseIdToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert('Course deleted');
      setCourseIdToDelete('');
      fetchCourses(); // Refresh list
    } catch (error: any) {
      console.error(error);
      console.error("Delete error:", error.response?.data || error.message);
      alert('Failed to delete course');
    }
  };
  useEffect(() => {
    if (activeTab === 'course') {
      fetchCourses();
    }
  }, [activeTab]);

  const handleAddBatch = async () => {
    try {
      const token = localStorage.getItem('token');
      const courseRes = await axios.get(`http://localhost:${PORT}/api/admin/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const course = courseRes.data.find((c: any) => c.code === batchCourseCode);

      if (!course) {
        alert('Course not found');
        return;
      }

      await axios.post(`http://localhost:${PORT}/api/admin/batches`, {
        name: batchName,
        courseId: course._id,
        students: [],
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('Batch added successfully');
      setBatchName('');
      setBatchCourseCode('');
      fetchBatches();
    } catch (err) {
      console.error(err);
      alert('Failed to add batch');
    }
  };
  const handleDeleteBatch = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:${PORT}/api/admin/batches/name/${batchToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Batch deleted successfully');
      setBatchToDelete('');
      fetchBatches();
    } catch (err) {
      console.error(err);
      alert('Failed to delete batch');
    }
  };
  const fetchBatches = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:${PORT}/api/admin/batches`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBatches(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    if (activeTab === 'batch') fetchBatches();
  }, [activeTab]);

  const fetchTeachers = async () => {
    try {
      const res = await axios.get(`http://localhost:${PORT}/api/admin/teachers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeachers(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  /*const handleAddTeacher = async () => {
    try {
      await axios.post(`http://localhost:${PORT}/api/admin/teachers`, {
        name: teacherName,
        email: teacherEmail,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('Teacher added successfully');
      setTeacherName('');
      setTeacherEmail('');
      fetchTeachers();
    } catch (err) {
      console.error(err);
      alert('Failed to add teacher');
    }
  };*/
  const handleDeleteTeacher = async () => {
    try {
      await axios.delete(`http://localhost:${PORT}/api/admin/teachers/email/${teacherToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Teacher deleted successfully');
      setTeacherToDelete('');
      fetchTeachers();
    } catch (err) {
      console.error(err);
      alert('Failed to delete teacher');
    }
  };
    const handleAssignCourseToTeacher = async () => {
      console.log("Hello world");
    try {
      await axios.put(`http://localhost:${PORT}/api/admin/teachers/assign-course`, {
        email: assignEmail,
        courseCode: assignCourseCode,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('Teacher assigned to course successfully');
      setAssignEmail('');
      setAssignCourseCode('');
      fetchTeachers(); // Refresh updated data
    } catch (err: any) {
      console.error("Assignment error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to assign course");
    }
  };
  const handleUnassignCourseFromTeacher = async () => {
    try {
      await axios.put(`http://localhost:${PORT}/api/admin/teachers/unassign-course`, {
        email: unassignEmail,
        courseCode: unassignCourseCode,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('Course unassigned from teacher successfully');
      setUnassignEmail('');
      setUnassignCourseCode('');
      fetchTeachers();
    } catch (err: any) {
      console.error("Unassignment error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to unassign course");
    }
  };
  useEffect(() => {
    if (activeTab === 'teacher') fetchTeachers();
  }, [activeTab]);

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`http://localhost:${PORT}/api/admin/student`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  const handleAssignCourseToStudent = async () => {
    try {
      await axios.put(`http://localhost:${PORT}/api/admin/student/assign-course`, {
        email: assignStudentEmail,
        courseCode: assignStudentCourseCode,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('Course assigned to student successfully');
      setAssignStudentEmail('');
      setAssignStudentCourseCode('');
      fetchStudents(); // If you're reloading list
    } catch (err: any) {
      console.error("Assignment error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to assign course");
      }
  };
  const handleUnassignCourseFromStudent = async () => {
    try {
      await axios.put(`http://localhost:${PORT}/api/admin/student/unassign-course`, {
        email: unassignStudentEmail,
        courseCode: unassignStudentCourseCode,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Course unassigned from student successfully');
      setUnassignStudentEmail('');
      setUnassignStudentCourseCode('');
      fetchStudents();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to unassign course');
    }
  };
  const handleDeleteStudent = async () => {
    try {
      await axios.delete(`http://localhost:${PORT}/api/admin/student/email/${studentToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Student deleted successfully');
      fetchStudents();
    } catch (err) {
      alert('Failed to delete student');
    }
  };
  useEffect(() => {
    if (activeTab === 'student') {
      fetchStudents();
      fetchCourses();
    }
  }, [activeTab]);

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

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    localStorage.clear(); 
    navigate('/');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="p-6">
          <h1 className="text-2xl font-bold text-center mb-8">Welcome to the Admin Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              onClick={() => setActiveTab('teacher')}
              className="cursor-pointer bg-indigo-600 text-white p-4 rounded-lg shadow-md text-center hover:bg-indigo-700 transition"
            >
              <FaChalkboardTeacher size={28} className="mx-auto mb-1" />
              <h2 className="text-lg font-semibold">Teachers</h2>
              <p className="text-sm">{counts.teachers}</p>
            </div>

            <div
              onClick={() => setActiveTab('course')}
              className="cursor-pointer bg-green-600 text-white p-4 rounded-lg shadow-md text-center hover:bg-green-700 transition"
            >
              <FaBook size={28} className="mx-auto mb-1" />
              <h2 className="text-lg font-semibold">Courses</h2>
              <p className="text-sm">{counts.courses}</p>
            </div>

            <div
              onClick={() => setActiveTab('student')}
              className="cursor-pointer bg-sky-600 text-white p-4 rounded-lg shadow-md text-center hover:bg-sky-700 transition"
            >
              <FaUserGraduate size={28} className="mx-auto mb-1" />
              <h2 className="text-lg font-semibold">Students</h2>
              <p className="text-sm">{counts.students}</p>
            </div>
          </div>
        </div>
        );
       
      case "course":
      return (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Add Course */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Add New Course</h2>
            <input
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="Enter Course Name"
              className="border border-gray-300 rounded px-3 py-2 w-full mb-2"
            />
            <input
              type="text"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              placeholder="Enter Course Code"
              className="border border-gray-300 rounded px-3 py-2 w-full mb-4"
            />
            <button
              onClick={handleAddCourse}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Add Course
            </button>
          </div>

          {/* Delete Course */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Remove Course</h2>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Course Code
            </label>
            {/* Course Dropdown */}
              <select
                value={courseIdToDelete}
                onChange={(e) => setCourseIdToDelete(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-full mb-4"
              >
                <option value="">Select Course</option>
                {courses.map((course: any) => (
                  <option key={course._id} value={course.code}>
                    {course.name} ({course.code})
                  </option>
                ))}
              </select>
            <button
              onClick={handleDeleteCourse}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Remove Course
            </button>
          </div>

          {/* List Courses */}
          <div className="bg-white p-6 rounded-lg shadow col-span-full">
            <h2 className="text-xl font-bold mb-4">All Courses</h2>
            <ul className="space-y-2">
              {courses.map((course) => (
                <li key={course._id} className="border-b pb-2">
                  <strong>{course.name}</strong> — <code>{course.code}</code><br />
                  <span className="text-sm text-gray-500">ID: {course._id}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        );


      case "batch":
      return (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Add New Batch */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Add New Batch</h2>
            <input
              type="text"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              placeholder="Enter Batch Name"
              className="border border-gray-300 rounded px-3 py-2 w-full mb-2"
            />
            {/* Course Dropdown */}
              <select
                value={batchCourseCode}
                onChange={(e) => setBatchCourseCode(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-full mb-4"
              >
                <option value="">Select Course</option>
                {courses.map((course: any) => (
                  <option key={course._id} value={course.code}>
                    {course.name} ({course.code})
                  </option>
                ))}
              </select>
            <button
              onClick={handleAddBatch}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Add Batch
            </button>
          </div>

          {/* Remove Batch */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Remove Batch</h2>
            {/* Course Dropdown */}
              <select
                value={batchToDelete}
                onChange={(e) => setBatchToDelete(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-full mb-4"
              >
                <option value="">Select Batch</option>
                {batches.map((batch: any) => (
                  <option key={batch._id} value={batch.name}>
                    {batch.name} ({batch.course?.code})
                  </option>
                ))}
              </select>
            <button
              onClick={handleDeleteBatch}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Remove Batch
            </button>
          </div>

          {/* List Batches */}
          <div className="bg-white p-6 rounded-lg shadow col-span-full">
            <h2 className="text-xl font-bold mb-4">All Batches</h2>
            <ul className="space-y-2">
              {batches.map((batch: any) => (
                <li key={batch._id} className="border-b pb-2">
                  <strong>{batch.name}</strong> — {batch.course?.name} ({batch.course?.code})
                </li>
              ))}
            </ul>
          </div>
        </div>
      );

      case "teacher":
      return (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Add New Teacher */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Assign Course to Teacher</h2>
            {/* Teacher Email Dropdown */}
              <select
                value={assignEmail}
                onChange={(e) => setAssignEmail(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-full mb-2"
              >
                <option value="">Select Teacher</option>
                {teachers.map((teacher: any) => (
                  <option key={teacher._id} value={teacher.email}>
                    {teacher.name} ({teacher.email})
                  </option>
                ))}
              </select>
            {/* Course Dropdown */}
              <select
                value={assignCourseCode}
                onChange={(e) => setAssignCourseCode(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-full mb-4"
              >
                <option value="">Select Course</option>
                {courses.map((course: any) => (
                  <option key={course._id} value={course.code}>
                    {course.name} ({course.code})
                  </option>
                ))}
              </select>
            <button
              onClick={handleAssignCourseToTeacher}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Assign Course
            </button>
          </div>

            {/* Unassign Course from Teacher */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Unassign Course from Teacher</h2>

              {/* Teacher Email Dropdown */}
              <select
                value={unassignEmail}
                onChange={(e) => setUnassignEmail(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-full mb-2"
              >
                <option value="">Select Teacher</option>
                {teachers.map((teacher: any) => (
                  <option key={teacher._id} value={teacher.email}>
                    {teacher.name} ({teacher.email})
                  </option>
                ))}
              </select>

              {/* Course Dropdown */}
              <select
                value={unassignCourseCode}
                onChange={(e) => setUnassignCourseCode(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-full mb-4"
              >
                <option value="">Select Course</option>
                {courses.map((course: any) => (
                  <option key={course._id} value={course.code}>
                    {course.name} ({course.code})
                  </option>
                ))}
              </select>

              <button
                onClick={handleUnassignCourseFromTeacher}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Unassign Course
              </button>
            </div>

          {/* Remove Teacher */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Remove Teacher</h2>
            {/* Teacher Email Dropdown */}
              <select
                value={teacherToDelete}
                onChange={(e) => setTeacherToDelete(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-full mb-2"
              >
                <option value="">Select Teacher</option>
                {teachers.map((teacher: any) => (
                  <option key={teacher._id} value={teacher.email}>
                    {teacher.name} ({teacher.email})
                  </option>
                ))}
              </select>
            <button
              onClick={handleDeleteTeacher}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Remove Teacher
            </button>
          </div>

          {/* List Teachers */}
          <div className="bg-white p-6 rounded-lg shadow col-span-full">
            <h2 className="text-xl font-bold mb-4">All Teachers</h2>
            <ul className="space-y-2">
              {teachers.map((teacher: any) => (
                <li key={teacher._id} className="border-b pb-2">
                  <strong>{teacher.name}</strong> — {teacher.email}
                  <br />
                  <span className="text-sm text-gray-600">
                    Courses:{" "}
                    {teacher.enrolledCourses && teacher.enrolledCourses.length > 0
                      ? teacher.enrolledCourses.map((c: any) => `${c.name} (${c.code})`).join(', ')
                      : "None"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      );

      case "student":
        return (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Assign Course */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Assign Course to Student</h2>
              <select
                value={assignStudentEmail}
                onChange={(e) => setAssignStudentEmail(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-full mb-2"
              >
                <option value="">Select Student</option>
                {students.map((s: any) => (
                  <option key={s._id} value={s.email}>
                    {s.name} ({s.email})
                  </option>
                ))}
              </select>
              <select
                value={assignStudentCourseCode}
                onChange={(e) => setAssignStudentCourseCode(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-full mb-4"
              >
                <option value="">Select Course</option>
                {courses.map((c: any) => (
                  <option key={c._id} value={c.code}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
              <button
                onClick={handleAssignCourseToStudent}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Assign Course
              </button>
            </div>

            {/* Unassign Course */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Unassign Course from Student</h2>
              <select
                value={unassignStudentEmail}
                onChange={(e) => setUnassignStudentEmail(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-full mb-2"
              >
                <option value="">Select Student</option>
                {students.map((s: any) => (
                  <option key={s._id} value={s.email}>
                    {s.name} ({s.email})
                  </option>
                ))}
              </select>
              <select
                value={unassignStudentCourseCode}
                onChange={(e) => setUnassignStudentCourseCode(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-full mb-4"
              >
                <option value="">Select Course</option>
                {courses.map((c: any) => (
                  <option key={c._id} value={c.code}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
              <button
                onClick={handleUnassignCourseFromStudent}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Unassign Course
              </button>
            </div>

            {/* Delete Student */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Remove Student</h2>
              <select
                value={studentToDelete}
                onChange={(e) => setStudentToDelete(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-full mb-2"
              >
                <option value="">Select Student</option>
                {students.map((s: any) => (
                  <option key={s._id} value={s.email}>
                    {s.name} ({s.email})
                  </option>
                ))}
              </select>
              <button
                onClick={handleDeleteStudent}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Remove Student
              </button>
            </div>

            {/* List Students */}
            <div className="bg-white p-6 rounded-lg shadow col-span-full">
              <h2 className="text-xl font-bold mb-4">All Students</h2>
              <ul className="space-y-2">
                {students.map((s: any) => (
                  <li key={s._id} className="border-b pb-2">
                    <strong>{s.name}</strong> — {s.email}
                    <br />
                    <span className="text-sm text-gray-600">
                      Courses:{" "}
                      {s.enrolledCourses?.length
                        ? s.enrolledCourses.map((c: any) => `${c.name} (${c.code})`).join(', ')
                        : "None"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          );
        }
      };

  return (
    <div className="flex">
      <aside className="bg-gradient-to-b from-indigo-900 to-indigo-700 text-white w-64 min-h-screen p-4 space-y-6">
        <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
        <button onClick={() => setActiveTab('home')} className="flex items-center gap-2 hover:bg-indigo-800 px-3 py-2 rounded">
          <FaHome /> Home
        </button> 
        <button onClick={() => setActiveTab('course')} className="flex items-center gap-2 hover:bg-indigo-800 px-3 py-2 rounded">
          <FaBook /> Course Manager
        </button>
        <button onClick={() => setActiveTab('batch')} className="flex items-center gap-2 hover:bg-indigo-800 px-3 py-2 rounded">
          <FaBoxes /> Batch Manager
        </button>
        <button onClick={() => setActiveTab('teacher')} className="flex items-center gap-2 hover:bg-indigo-800 px-3 py-2 rounded">
          <FaChalkboardTeacher /> Teacher Manager
        </button>
        <button onClick={() => setActiveTab('student')} className="flex items-center gap-2 hover:bg-indigo-800 px-3 py-2 rounded">
          <FaUserGraduate /> Student Manager
        </button>
        {/*<button className="mt-10 text-red-300 hover:text-red-500"
        onClick={handleLogout}
        >Logout</button>*/}
        {/* Logout Button */}
        <button
          onClick={() => setShowModal(true)}
          className="mt-10 text-red-300 hover:text-red-500"
        >
          Logout
        </button>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm bg-opacity-100 z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm text-center">
            <h2 className="text-lg text-black font-semibold mb-4">Are you sure you want to logout?</h2>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              >
                Yes
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
      </aside>
      <main className="flex-grow bg-gray-100">{renderContent()}</main>

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

export default AdminDashboard;
