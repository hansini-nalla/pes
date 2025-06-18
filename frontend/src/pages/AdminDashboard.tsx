import { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChalkboardTeacher, FaBook, FaUserGraduate,  FaBoxes, FaHome } from 'react-icons/fa';

type Tab = 'home' | 'course' | 'batch' | 'role' | 'student' | 'teacher';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
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

  const handleLogout = () => {
    //localStorage.removeItem('authToken'); // or whatever key you use

    //localStorage.clear(); // if you want to wipe everything

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
      <p className="text-sm">2</p>
    </div>

    <div
      onClick={() => setActiveTab('course')}
      className="cursor-pointer bg-green-600 text-white p-4 rounded-lg shadow-md text-center hover:bg-green-700 transition"
    >
      <FaBook size={28} className="mx-auto mb-1" />
      <h2 className="text-lg font-semibold">Courses</h2>
      <p className="text-sm">2</p>
    </div>

    <div
      onClick={() => setActiveTab('student')}
      className="cursor-pointer bg-sky-600 text-white p-4 rounded-lg shadow-md text-center hover:bg-sky-700 transition"
    >
      <FaUserGraduate size={28} className="mx-auto mb-1" />
      <h2 className="text-lg font-semibold">Students</h2>
      <p className="text-sm">40</p>
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
          placeholder="Enter Course Name"
          className="border border-gray-300 rounded px-3 py-2 w-full mb-2"
        />
        <input
          type="text"
          placeholder="Enter Course Code"
          className="border border-gray-300 rounded px-3 py-2 w-full mb-4"
        />
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Add Course
        </button>
      </div>

      {/* Delete Course */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Remove Course</h2>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enter Course ID
        </label>
        <input
          type="text"
          placeholder="e.g., CSE101"
          className="border border-gray-300 rounded px-3 py-2 w-full mb-4"
        />
        <button
          onClick={() => alert("Course deleted successfully.")}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Remove Course
        </button>
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
          placeholder="Enter Batch ID"
          className="border border-gray-300 rounded px-3 py-2 w-full mb-2"
        />
        <input
          type="text"
          placeholder="Assign Course ID"
          className="border border-gray-300 rounded px-3 py-2 w-full mb-2"
        />
        <input
          type="text"
          placeholder="Assign Instructor ID"
          className="border border-gray-300 rounded px-3 py-2 w-full mb-4"
        />
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Add Batch
        </button>
      </div>

      {/* Remove Batch */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Remove Batch</h2>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enter Batch ID
        </label>
        <input
          type="text"
          placeholder="e.g., B001"
          className="border border-gray-300 rounded px-3 py-2 w-full mb-4"
        />
        <button
          onClick={() => alert("Batch deleted successfully.")}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Remove Batch
        </button>
      </div>
    </div>
  );
  case "teacher":
  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Add New Teacher */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Add New Teacher</h2>
        <input
          type="text"
          placeholder="Enter Teacher Name"
          className="border border-gray-300 rounded px-3 py-2 w-full mb-2"
        />
        <input
          type="email"
          placeholder="Enter Teacher Email"
          className="border border-gray-300 rounded px-3 py-2 w-full mb-4"
        />
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Add Teacher
        </button>
      </div>

      {/* Remove Teacher */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Remove Teacher</h2>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enter Teacher ID
        </label>
        <input
          type="text"
          placeholder="e.g., T001"
          className="border border-gray-300 rounded px-3 py-2 w-full mb-4"
        />
        <button
          onClick={() => alert("Teacher deleted successfully.")}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Remove Teacher
        </button>
      </div>

      {/* Update Teacher */}
      <div className="bg-white p-6 rounded-lg shadow col-span-full">
        <h2 className="text-xl font-bold mb-4">Update Teacher Details</h2>
        <input
          type="text"
          placeholder="Teacher ID"
          className="border border-gray-300 rounded px-3 py-2 w-full mb-2"
        />
        <input
          type="text"
          placeholder="Updated Name"
          className="border border-gray-300 rounded px-3 py-2 w-full mb-2"
        />
        <input
          type="email"
          placeholder="Updated Email"
          className="border border-gray-300 rounded px-3 py-2 w-full mb-4"
        />
        <button
          onClick={() => alert("Teacher updated successfully.")}
          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
        >
          Update Teacher
        </button>
      </div>

      {/* View All Teachers */}
      <div className="bg-white p-6 rounded-lg shadow col-span-full">
        <h2 className="text-xl font-bold mb-4">All Teachers</h2>
        <p className="text-sm text-gray-600">List of teachers will appear here after integration.</p>
      </div>
    </div>
  );


case "student":
  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Add New Student */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Add New Student</h2>
        
        <input
          type="text"
          placeholder="Enter Student Name"
          className="border border-gray-300 rounded px-3 py-2 w-full mb-2"
        />
        <input
          type="email"
          placeholder="Enter Student Email"
          className="border border-gray-300 rounded px-3 py-2 w-full mb-4"
        />
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Add Student
        </button>
      </div>

      {/* Remove Student */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Remove Student</h2>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enter Student ID
        </label>
        <input
          type="text"
          placeholder="e.g., S001"
          className="border border-gray-300 rounded px-3 py-2 w-full mb-4"
        />
        <button
          onClick={() => alert("Student deleted successfully.")}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Remove Student
        </button>
      </div>

      {/* Update Student */}
      <div className="bg-white p-6 rounded-lg shadow col-span-full">
        <h2 className="text-xl font-bold mb-4">Update Student Details</h2>
        <input
          type="text"
          placeholder="Student ID"
          className="border border-gray-300 rounded px-3 py-2 w-full mb-2"
        />
        <input
          type="text"
          placeholder="Updated Name"
          className="border border-gray-300 rounded px-3 py-2 w-full mb-2"
        />
        <input
          type="email"
          placeholder="Updated Email"
          className="border border-gray-300 rounded px-3 py-2 w-full mb-4"
        />
        <button
          onClick={() => alert("Student updated successfully.")}
          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
        >
          Update Student
        </button>
      </div>

      {/* View All Students */}
      <div className="bg-white p-6 rounded-lg shadow col-span-full">
        <h2 className="text-xl font-bold mb-4">All Students</h2>
        <p className="text-sm text-gray-600">List of students will appear here after integration.</p>
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
