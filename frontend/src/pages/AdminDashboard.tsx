import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChalkboardTeacher, FaBook, FaUserGraduate, FaUserShield, FaBoxes, FaHome } from 'react-icons/fa';

type Tab = 'home' | 'course' | 'batch' | 'role';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

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
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-6 rounded-2xl shadow-md text-center">
                <FaChalkboardTeacher size={36} className="mx-auto mb-2" />
                <h2 className="text-xl font-semibold">Teachers</h2>
                <p className="text-lg">2</p>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-emerald-700 text-white p-6 rounded-2xl shadow-md text-center">
                <FaBook size={36} className="mx-auto mb-2" />
                <h2 className="text-xl font-semibold">Courses</h2>
                <p className="text-lg">2</p>
              </div>
              <div className="bg-gradient-to-r from-sky-500 to-cyan-700 text-white p-6 rounded-2xl shadow-md text-center">
                <FaUserGraduate size={36} className="mx-auto mb-2" />
                <h2 className="text-xl font-semibold">Students</h2>
                <p className="text-lg">40</p>
              </div>
            </div>
          </div>
        );
       
      case 'course':
        return (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-bold mb-4">Add New Course</h2>
              <input type="text" placeholder="Enter course ID" className="input mb-2 w-full" />
              <input type="text" placeholder="Enter course name" className="input mb-2 w-full" />
              <div className="flex items-center gap-2 mb-2">
                <input type="checkbox" />
                <label>Open Course</label>
              </div>
              <input type="date" className="input mb-2 w-full" placeholder="Course Start Date" />
              <input type="date" className="input mb-4 w-full" placeholder="Course End Date" />
              <button className="bg-purple-700 text-white py-2 px-4 rounded">Add Course</button>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-4">Delete Course</h2>
              <select className="input mb-4 w-full">
                <option>Select Course</option>
              </select>
              <button className="bg-purple-700 text-white py-2 px-4 rounded">Delete Course</button>
            </div>
          </div>
        );

      case 'batch':
        return (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-bold mb-4">Add New Batch</h2>
              <input type="text" placeholder="Enter batch ID" className="input mb-2 w-full" />
              <select className="input mb-2 w-full">
                <option>Select Instructor</option>
              </select>
              <select className="input mb-4 w-full">
                <option>Select Course</option>
              </select>
              <button className="bg-purple-700 text-white py-2 px-4 rounded">Add Batch</button>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-4">Delete Batch</h2>
              <select className="input mb-4 w-full">
                <option>Select Batch</option>
              </select>
              <button className="bg-purple-700 text-white py-2 px-4 rounded">Delete Batch</button>
            </div>
          </div>
        );

        case 'role':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Role Manager</h2>
            <p className="mb-6 text-gray-700">
              Update the role of a user by providing their email ID and selecting a role.
            </p>

            <div className="max-w-md space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email ID</label>
                <input
                  type="email"
                  placeholder="Enter user email ID"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Select Role</label>
                <select className="w-full p-2 border border-gray-300 rounded">
                  <option>Admin</option>
                  <option>Teacher</option>
                  <option>Student</option>
                  <option>TA</option>
                </select>
              </div>

              <button className="bg-indigo-700 text-white px-4 py-2 rounded hover:bg-indigo-800">
                Update Role
              </button>
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
        <button onClick={() => setActiveTab('role')} className="flex items-center gap-2 hover:bg-indigo-800 px-3 py-2 rounded">
          <FaUserShield /> Role Manager
        </button>
        <button onClick={() => setActiveTab('course')} className="flex items-center gap-2 hover:bg-indigo-800 px-3 py-2 rounded">
          <FaBook /> Course Manager
        </button>
        <button onClick={() => setActiveTab('batch')} className="flex items-center gap-2 hover:bg-indigo-800 px-3 py-2 rounded">
          <FaBoxes /> Batch Manager
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
    </div>
  );
};

export default AdminDashboard;
