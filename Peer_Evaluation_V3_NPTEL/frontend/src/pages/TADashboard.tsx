import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Removed specific react-icons/fi imports as they will be replaced by FeatherIcon
// import { FiHome, FiShield, FiLogOut, FiSun, FiMoon, FiUser, FiMenu, FiKey } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const TADashboard = ({ onLogout }: { onLogout?: () => void }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'flagged' | 'enrollments' | 'password'>('home');
  const [flaggedCount, setFlaggedCount] = useState<number>(3);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true'); // Using darkMode boolean state
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();

  const course = "CS101 - Data Structures";
  const batch = "Batch A";

  const enrollmentRequests = [
    { name: 'Alice Johnson', email: 'alice@example.com' },
    { name: 'Bob Smith', email: 'bob@example.com' }
  ];

  // --- Color Palettes for Theming ---
  const lightPalette = {
      'bg-primary': '#fef9f4',
      'bg-secondary': '#ffffff',
      'accent-purple-light': '#ebe4ff',
      'accent-purple-dark': '#e5e9f8',
      'text-primary': '#2c1552',
      'text-secondary': '#4b3b77',
      'text-muted': '#555',
      'sidebar-active-bg': '#efe2ff',
      'sidebar-active-text': '#6226c9',
      'sidebar-hover-bg': '#f4f0ff',
      'sidebar-icon-color': '#8a75d1',
      'card-blue-bg': '#dbe8fd',
      'card-pink-bg': '#f6d4fa',
      'card-orange-bg': '#ffe3ec',
      'card-text-light-mode': '#2c1552', // Added for clarity, though same as text-primary
      'logout-button-text': '#6a32a8',
      'logout-button-hover': '#ef4444', // red-400
      'profile-button-bg': '#eceaff',
      'profile-button-hover': '#dedaff',
      'logout-dialog-bg': '#ffffff',
      'logout-dialog-text': '#2c1552',
      'logout-cancel-bg': '#e5e7eb', // gray-200
      'logout-cancel-hover': '#d1d5db', // gray-300
      'logout-cancel-text': '#2c1552',
      'logout-confirm-bg': '#ef4444', // red-500
      'logout-confirm-hover': '#dc2626', // red-600
      'flagged-badge-bg': '#ffecf0',
      'flagged-badge-text': '#ff3366',
      'form-input-border': '#e5e7eb', // gray-200
      'form-input-focus-border': '#a78bfa', // purple-400
      'form-input-bg': '#ffffff',
      'form-input-text': '#2c1552',
      'form-button-bg': '#6a32a8',
      'form-button-hover': '#5a2694',
  };

  const darkPalette = {
      'bg-primary': '#1A1A2E',
      'bg-secondary': '#16213E',
      'accent-purple-light': '#0F3460',
      'accent-purple-dark': '#0F3460',
      'text-primary': '#E0E0E0',
      'text-secondary': '#B0BEC5',
      'text-muted': '#90A4AE',
      'sidebar-active-bg': '#4A148C', // Lighter purple for highlight
      'sidebar-active-text': '#FFFFFF', // White text on lighter purple
      'sidebar-hover-bg': '#34495E',
      'sidebar-icon-color': '#B0BEC5',
      'card-blue-bg': '#BBDEFB', // Light blue
      'card-pink-bg': '#E1BEE7', // Light purple/pink
      'card-orange-bg': '#FFCCBC', // Light orange
      'card-text-dark-mode': '#333333', // Dark text for contrast on light cards
      'logout-button-text': '#E0E0E0',
      'logout-button-hover': '#EF5350',
      'profile-button-bg': '#3F51B5',
      'profile-button-hover': '#5C6BC0',
      'logout-dialog-bg': '#16213E',
      'logout-dialog-text': '#E0E0E0',
      'logout-cancel-bg': '#424242',
      'logout-cancel-hover': '#616161',
      'logout-cancel-text': '#E0E0E0',
      'logout-confirm-bg': '#EF5350',
      'logout-confirm-hover': '#D32F2F',
      'flagged-badge-bg': '#FFCDD2',
      'flagged-badge-text': '#C62828',
      'form-input-border': '#3F51B5',
      'form-input-focus-border': '#8E24AA',
      'form-input-bg': '#1A1A2E',
      'form-input-text': '#E0E0E0',
      'form-button-bg': '#6A1B9A',
      'form-button-hover': '#8E24AA',
  };

  type Palette = typeof lightPalette;
  const currentPalette = useMemo(() => darkMode ? darkPalette : lightPalette, [darkMode]);

  // Helper component for Feather Icons (SVGs)
  const FeatherIcon = ({ name, size = 24, strokeWidth = 2, className = '', color = 'currentColor' }: { name: string, size?: number, strokeWidth?: number, className?: string, color?: string }) => {
    const iconPaths: { [key: string]: JSX.Element } = {
      'home': <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></>,
      'shield': <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></>,
      'log-out': <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></>,
      'sun': <><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></>,
      'moon': <><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></>,
      'user': <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></>,
      'menu': <><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></>,
      'key': <><path d="M21 2l-2 2m-7 7l-4 4L3 18l3-3m2-2l4-4m-3 3l-6 6a2 2 0 01-3 3L3 21l-3-3 2-2a2 2 0 013-3l6-6z"></path></>,
    };

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        {iconPaths[name]}
      </svg>
    );
  };

  // Modal Component (adapted for dynamic colors)
  const Modal = ({ show, onClose, onConfirm, title, children, currentPalette }: { show: boolean, onClose: () => void, onConfirm: () => void, title: string, children: React.ReactNode, currentPalette: Palette }) => {
    if (!show) return null;
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                className="rounded-2xl p-8 shadow-xl text-center"
                style={{ backgroundColor: currentPalette['logout-dialog-bg'], color: currentPalette['logout-dialog-text'] }}>
                <h2 className="text-xl font-bold mb-4">{title}</h2>
                <div className="mb-6">{children}</div>
                <div className="flex justify-center gap-6">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg font-medium" style={{ backgroundColor: currentPalette['logout-cancel-bg'], color: currentPalette['logout-cancel-text'] }}>Cancel</button>
                    <button onClick={onConfirm} className="px-6 py-2 rounded-lg text-white font-semibold" style={{ backgroundColor: currentPalette['logout-confirm-bg'] }}>Logout</button>
                </div>
            </motion.div>
        </motion.div>
    );
  };

  useEffect(() => {
    // Apply theme class to documentElement
    document.documentElement.classList.toggle('dark', darkMode);
    // Store theme preference
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(prev => !prev);
  };

  const pages = {
    home: (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-8 w-full"
      >
        <h1 className="text-3xl font-extrabold mb-2" style={{ color: currentPalette['text-primary'] }}>
          Hello, TA 👋
        </h1>
        <h2 className="text-xl font-semibold mb-6" style={{ color: currentPalette['text-primary'] }}>
          Welcome to TA Dashboard
        </h2>

        <div className="mb-6">
          <p className="text-md font-medium" style={{ color: currentPalette['text-secondary'] }}>Course: <span className="font-bold">{course}</span></p>
          <p className="text-md font-medium" style={{ color: currentPalette['text-secondary'] }}>Batch: <span className="font-bold">{batch}</span></p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="shadow rounded-2xl p-6 text-center" style={{ backgroundColor: currentPalette['card-blue-bg'], color: darkMode ? currentPalette['card-text-dark-mode'] : currentPalette['card-text-light-mode'] }}>
            <p className="font-medium mb-2">Flagged Evaluations</p>
            <p className="text-3xl font-bold">{flaggedCount}</p>
          </div>
          <div className="shadow rounded-2xl p-6 text-center" style={{ backgroundColor: currentPalette['card-pink-bg'], color: darkMode ? currentPalette['card-text-dark-mode'] : currentPalette['card-text-light-mode'] }}>
            <p className="font-medium mb-2">Resolved</p>
            <p className="text-3xl font-bold">--</p>
          </div>
          <div className="shadow rounded-2xl p-6 text-center" style={{ backgroundColor: currentPalette['card-orange-bg'], color: darkMode ? currentPalette['card-text-dark-mode'] : currentPalette['card-text-light-mode'] }}>
            <p className="font-medium mb-2">Escalated</p>
            <p className="text-3xl font-bold">--</p>
          </div>
        </div>
      </motion.div>
    ),
    flagged: (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-8 w-full"
      >
        <h2 className="text-3xl font-bold mb-6" style={{ color: currentPalette['text-primary'] }}>
          Flagged Evaluations
        </h2>
        <div className="border rounded-xl p-6 shadow-sm" style={{ backgroundColor: currentPalette['bg-secondary'], color: currentPalette['text-primary'], borderColor: currentPalette['text-muted'] }}>
          <p>List of evaluations flagged by students or peers will appear here.</p>
        </div>
      </motion.div>
    ),
    enrollments: (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-8 w-full"
      >
        <h2 className="text-3xl font-bold mb-6" style={{ color: currentPalette['text-primary'] }}>
          Enrollment Requests
        </h2>
        <div className="space-y-4">
          {enrollmentRequests.map((req, idx) => (
            <div key={idx} className="border rounded-xl p-4 shadow-sm flex justify-between items-center" style={{ backgroundColor: currentPalette['bg-secondary'], color: currentPalette['text-primary'], borderColor: currentPalette['text-muted'] }}>
              <div>
                <p className="font-semibold">{req.name}</p>
                <p className="text-sm" style={{ color: currentPalette['text-muted'] }}>{req.email}</p>
              </div>
              <div className="flex gap-2">
                {/* These buttons are hardcoded with Tailwind classes, keeping them as is */}
                <button className="px-4 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg">Accept</button>
                <button className="px-4 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg">Decline</button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    ),
    password: (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-8 w-full h-full flex flex-col items-center justify-start"
      >
        <h2 className="text-4xl font-bold mb-10" style={{ color: currentPalette['text-primary'] }}>Change Password</h2>
        <div className="border rounded-3xl p-10 shadow-xl w-full max-w-2xl" style={{ backgroundColor: currentPalette['bg-secondary'], color: currentPalette['text-primary'], borderColor: currentPalette['text-muted'] }}>
          <form className="space-y-6">
            <div>
              <label className="block mb-2 text-lg font-semibold" htmlFor="currentPassword" style={{ color: currentPalette['text-primary'] }}>Current Password</label>
              <input type="password" id="currentPassword" name="currentPassword" className="w-full px-4 py-3 rounded-xl text-base" style={{ borderColor: currentPalette['form-input-border'], backgroundColor: currentPalette['form-input-bg'], color: currentPalette['form-input-text'] }} required />
            </div>
            <div>
              <label className="block mb-2 text-lg font-semibold" htmlFor="newPassword" style={{ color: currentPalette['text-primary'] }}>New Password</label>
              <input type="password" id="newPassword" name="newPassword" className="w-full px-4 py-3 rounded-xl text-base" style={{ borderColor: currentPalette['form-input-border'], backgroundColor: currentPalette['form-input-bg'], color: currentPalette['form-input-text'] }} required />
            </div>
            <div>
              <label className="block mb-2 text-lg font-semibold" htmlFor="confirmPassword" style={{ color: currentPalette['text-primary'] }}>Confirm New Password</label>
              <input type="password" id="confirmPassword" name="confirmPassword" className="w-full px-4 py-3 rounded-xl text-base" style={{ borderColor: currentPalette['form-input-border'], backgroundColor: currentPalette['form-input-bg'], color: currentPalette['form-input-text'] }} required />
            </div>
            <button type="submit" className="w-full text-white py-3 px-4 rounded-xl font-semibold text-lg" style={{ backgroundColor: currentPalette['form-button-bg'] }}>Change Password</button>
          </form>
        </div>
      </motion.div>
    )

  };

  return (
    <div className="flex min-h-screen font-sans relative" style={{ backgroundColor: currentPalette['bg-primary'], color: currentPalette['text-primary'] }}>
      <div className={`${showSidebar ? 'w-64' : 'w-20'} transition-all duration-300 p-5 pt-4 rounded-r-3xl flex flex-col justify-between`} style={{ backgroundColor: currentPalette['accent-purple-light'] }}>
        <div>
          <button onClick={() => setShowSidebar(!showSidebar)} className="mb-4 text-left">
            <FeatherIcon name="menu" className="text-2xl" color={currentPalette['sidebar-icon-color']} />
          </button>
          <h2 className={`font-extrabold text-xl mb-6 pl-2 ${!showSidebar && 'hidden'}`} style={{ color: currentPalette['text-primary'] }}>TA Panel</h2>
          <ul className="space-y-4">
            {[{ key: 'home', label: 'Home', icon: 'home' },
              { key: 'flagged', label: 'Flagged Evaluations', icon: 'shield' },
              { key: 'enrollments', label: 'Enrollment Requests', icon: 'user' },
              { key: 'password', label: 'Change Password', icon: 'key' }] // Added 'key' icon
              .map(({ key, label, icon: iconName }) => (
              <li
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`cursor-pointer flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${
                  activeTab === key ? '' : `hover:bg-[${currentPalette['sidebar-hover-bg']}]`
                }`}
                style={{
                  backgroundColor: activeTab === key ? currentPalette['sidebar-active-bg'] : 'transparent',
                  color: activeTab === key ? currentPalette['sidebar-active-text'] : currentPalette['text-primary']
                }}
              >
                <FeatherIcon name={iconName} className="text-xl" color={activeTab === key ? currentPalette['sidebar-active-text'] : currentPalette['sidebar-icon-color']} />
                {showSidebar && (
                  <span className="flex items-center gap-2 font-medium">
                    {label}
                    {key === 'flagged' && (
                      <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: currentPalette['flagged-badge-bg'], color: currentPalette['flagged-badge-text'] }}>
                        {flaggedCount}
                      </span>
                    )}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col items-center">
          <button onClick={() => setShowLogoutDialog(true)} className="flex items-center gap-2 px-3 py-2 transition" style={{ color: currentPalette['logout-button-text'] }}>
            <FeatherIcon name="log-out" className="text-xl" color={currentPalette['logout-button-text']} />
            {showSidebar && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>

      <main className="flex-1 p-6 md:p-10">
        <div className="flex justify-end items-center mb-4">
          <div className="relative">
            <button onClick={() => setShowProfileDropdown(prev => !prev)} className="p-2 rounded-full shadow" style={{ backgroundColor: currentPalette['profile-button-bg'], color: currentPalette['text-primary'] }}>
              <FeatherIcon name="user" className="text-xl" color={currentPalette['text-primary']} />
            </button>
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-56 border rounded-xl shadow-lg p-4 text-sm" style={{ backgroundColor: currentPalette['bg-secondary'], color: currentPalette['text-primary'], borderColor: currentPalette['text-muted'] }}>
                <p><strong>Name:</strong> Test TA</p>
                <p><strong>Email:</strong> ta@example.com</p>
                <p><strong>Role:</strong> Teaching Assistant</p>
              </div>
            )}
          </div>
        </div>
        {pages[activeTab]}
      </main>

      <AnimatePresence>
        {showLogoutDialog && (
          <Modal
            show={showLogoutDialog}
            onClose={() => setShowLogoutDialog(false)}
            onConfirm={() => {
              setShowLogoutDialog(false);
              navigate('/login');
              onLogout?.();
            }}
            title="Are you sure you want to logout?"
            currentPalette={currentPalette}
          >
            {/* No additional children needed for this modal */}
          </Modal>
        )}
      </AnimatePresence>

      <button onClick={toggleTheme} className="fixed bottom-6 right-6 p-3 rounded-full shadow-xl z-50" style={{ backgroundColor: currentPalette['profile-button-bg'], color: currentPalette['text-primary'] }}>
        {darkMode ? <FeatherIcon name="sun" className="text-xl" color={currentPalette['text-primary']} /> : <FeatherIcon name="moon" className="text-xl" color={currentPalette['text-primary']} />}
      </button>
    </div>
  );
};

export default TADashboard;
