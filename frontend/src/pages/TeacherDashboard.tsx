// frontend/src/components/teacher/TeacherDashboard.tsx
import { useState, useEffect } from "react";
import { FiMenu, FiHome, FiShield, FiBook, FiEdit, FiLogOut, FiSun, FiMoon } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import TeacherHome from "../components/teacher/TeacherHome";
import TeacherManageRoles from "../components/teacher/ManageRoles";
import TeacherCourses from "../components/teacher/TeacherCourses";
import TeacherExams from "../components/teacher/TeacherExams";

const palette = {
  "bg-primary": "#FFFBF6",
  "bg-secondary": "#FFFAF2",
  "sidebar-bg": "#E6E6FA",
  "text-dark": "#4B0082",
  "text-muted": "#A9A9A9",
  "text-sidebar-dark": "#4B0082",
  "border-soft": "#F0E6EF",
  "white": "#FFFFFF",
  "shadow-medium": "rgba(128, 0, 128, 0.08)",
};

const ProfileSVG = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ color: palette["text-dark"] }}
  >
    <path d="M18 20a6 6 0 0 0-12 0" />
    <circle cx="12" cy="10" r="4" />
    <circle cx="12" cy="12" r="10" />
  </svg>
);

const TeacherDashboard = () => {
  const [activePage, setActivePage] = useState("home");
  const [showSidebar, setShowSidebar] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState({ name: "", email: "", role: "" });

  useEffect(() => {
    fetch("http://localhost:5000/api/dashboard/profile", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then(res => res.json())
      .then(data => setProfile(data))
      .catch(() => {});
  }, []);

  const toggleDarkMode = () => setDarkMode((d) => !d);

  const pages: Record<string, JSX.Element> = {
    home: <TeacherHome />,
    roles: <TeacherManageRoles />,
    courses: <TeacherCourses />,
    exams: <TeacherExams />,
  };

  const icons: Record<string, any> = {
    home: FiHome,
    roles: FiShield,
    courses: FiBook,
    exams: FiEdit,
  };

  return (
    <div className="flex h-screen overflow-hidden relative" style={{ backgroundColor: palette["bg-primary"] }}>
      {/* Sidebar */}
      <motion.div
        className={`flex flex-col justify-between py-6 px-4 rounded-r-3xl shadow-xl z-20 transition-all duration-300 ${
          showSidebar ? "w-64" : "w-20"
        }`}
        style={{
          backgroundColor: palette["sidebar-bg"],
          boxShadow: `8px 0 30px ${palette["shadow-medium"]}`,
        }}
      >
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="mb-6 p-2 border-2 border-transparent rounded-full"
          style={{ borderColor: palette["text-dark"] }}
        >
          <FiMenu className="text-2xl" style={{ color: palette["text-sidebar-dark"] }} />
        </button>
        <div className="flex-1 flex flex-col items-center">
          <h2
            className={`font-bold mb-10 mt-4 transition-all duration-300 ${
              showSidebar ? "text-2xl" : "text-lg"
            }`}
            style={{ color: palette["text-sidebar-dark"] }}
          >
            {showSidebar ? "Teacher Panel" : "Tea"}
          </h2>
          <ul className="space-y-3 w-full">
            {Object.entries(pages).map(([key]) => {
              const Icon = icons[key];
              return (
                <motion.li
                  key={key}
                  onClick={() => setActivePage(key)}
                  className={`cursor-pointer flex items-center px-4 py-2 rounded-lg relative transition-all`}
                  style={{
                    color: palette["text-sidebar-dark"],
                    backgroundColor: activePage === key ? palette["sidebar-bg"] : "transparent",
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  {activePage === key && (
                    <motion.div
                      layoutId="activePage"
                      className="absolute inset-0 rounded-lg -z-10"
                      style={{
                        backgroundColor: palette["sidebar-bg"],
                        boxShadow: `0 0 15px ${palette["sidebar-bg"]}40`,
                      }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  <Icon className={`transition-all duration-300 ${showSidebar ? "mr-3 text-xl" : "text-3xl"}`} />
                  {showSidebar && (
                    <span className="font-medium whitespace-nowrap">
                      {key === "roles" ? "Manage Roles" : key.charAt(0).toUpperCase() + key.slice(1)}
                    </span>
                  )}
                </motion.li>
              );
            })}
          </ul>
        </div>
        <motion.button
          className="flex items-center justify-center gap-2 hover:opacity-80 transition-all duration-200"
          style={{ color: palette["text-sidebar-dark"] }}
          whileHover={{ scale: 1.03, x: 5 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiLogOut className={`${showSidebar ? "mr-3 text-xl" : "text-3xl"}`} />
          {showSidebar && <span className="font-medium whitespace-nowrap">Logout</span>}
        </motion.button>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 relative overflow-y-auto flex justify-center items-start p-4 z-10">
        {/* Profile icon top right */}
        <div className="absolute top-4 right-6 z-20">
          <button
            onClick={() => setShowProfile((p) => !p)}
            className="p-2 rounded-full border-2 border-transparent shadow"
            style={{
              backgroundColor: palette["white"],
              borderColor: palette["border-soft"],
              boxShadow: `0 2px 14px 0 ${palette["shadow-medium"]}`,
            }}
            title="Profile"
          >
            <ProfileSVG />
          </button>
          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-3 w-80 p-4 rounded-b-3xl shadow-lg z-10"
                style={{
                  backgroundColor: palette["bg-secondary"],
                  borderTopLeftRadius: 0,
                  borderTopRightRadius: 0,
                  boxShadow: `0 4px 14px ${palette["shadow-medium"]}`,
                  color: palette["text-dark"],
                }}
              >
                <h2 className="text-xl font-bold mb-4">Profile Info</h2>
                <div className="space-y-2 mb-2">
                  <p><strong>Name:</strong> {profile.name}</p>
                  <p><strong>Email:</strong> {profile.email}</p>
                  <p><strong>Role:</strong> {profile.role}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Main Card Content */}
        <div
          className="rounded-3xl shadow-2xl w-full max-w-6xl h-auto mt-20 mb-10 mx-6 px-8 py-6 flex flex-col items-start justify-start"
          style={{
            minHeight: "calc(100vh - 120px)",
            backgroundColor: palette["bg-primary"],
            boxShadow: `0 10px 40px ${palette["shadow-medium"]}`,
          }}
        >
          <div className="w-full">{pages[activePage]}</div>
        </div>

        {/* Dark Mode Toggle */}
        <motion.button
          onClick={toggleDarkMode}
          className="fixed bottom-6 right-6 p-3 rounded-full shadow-lg z-50"
          style={{
            backgroundColor: palette["sidebar-bg"],
            color: palette["white"],
            boxShadow: `0 4px 15px ${palette["sidebar-bg"]}40`,
          }}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          {darkMode ? <FiSun className="text-2xl" /> : <FiMoon className="text-2xl" />}
        </motion.button>
      </div>
    </div>
  );
};

export default TeacherDashboard;
