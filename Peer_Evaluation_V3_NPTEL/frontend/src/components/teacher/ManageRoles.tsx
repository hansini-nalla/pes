import { useState, useEffect } from "react";
import axios from "axios";
import { FiUserCheck } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const PORT = import.meta.env.VITE_BACKEND_PORT || 5000;

const palette = {
  'bg-secondary': '#FFFAF2',
  'sidebar-bg': '#E6E6FA',
  'border-soft': '#F0E6EF',
  'text-dark': '#4B0082',
  'text-muted': '#A9A9A9',
  'text-sidebar-dark': '#4B0082',
};

const ManageRoles = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [currentTA, setCurrentTA] = useState<any | null>(null);

  useEffect(() => {
    axios
      .get(`http://localhost:${PORT}/api/teacher/courses`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setCourses(res.data.courses));
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    const course = courses.find((c) => c._id === selectedCourse);
    setBatches(course?.batches || []);
    setSelectedBatch("");
    setStudents([]);
    setCurrentTA(null);
  }, [selectedCourse]);

  useEffect(() => {
    if (!selectedBatch) return;

    axios
      .get(`http://localhost:${PORT}/api/teacher/students`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setStudents(res.data.students));

    axios
      .get(`http://localhost:${PORT}/api/teacher/batch/${selectedBatch}/ta`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setCurrentTA(res.data.ta))
      .catch(() => setCurrentTA(null));
  }, [selectedBatch]);

  const handleAssignTA = async () => {
    try {
      const res = await axios.post(
        `http://localhost:${PORT}/api/teacher/batch/${selectedBatch}/assign-ta`,
        { studentId: selectedStudent },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setMessage(res.data.message || "TA assigned successfully!");

      // 🔄 Refresh current TA
      const taRes = await axios.get(
        `http://localhost:${PORT}/api/teacher/batch/${selectedBatch}/ta`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setCurrentTA(taRes.data.ta);

      // ✅ Clear message after 3s
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Error assigning TA");
    }
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center w-full h-full pt-10 pb-4"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.div
        className="shadow-2xl rounded-3xl border px-10 py-12 max-w-lg w-full flex flex-col items-center relative"
        style={{
          backgroundColor: palette['bg-secondary'],
          borderColor: palette['border-soft'],
          boxShadow: `0 8px 25px rgba(128,0,128,0.08)`
        }}
        initial={{ scale: 0.97 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex justify-center">
          <div className="p-4 rounded-full shadow-lg" style={{ backgroundColor: palette['sidebar-bg'] }}>
            <FiUserCheck className="text-4xl" style={{ color: palette['text-sidebar-dark'] }} />
          </div>
        </div>
        <h2 className="text-3xl font-extrabold mb-2 text-center drop-shadow mt-6" style={{ color: palette['text-dark'] }}>
          Manage TA Assignments
        </h2>
        <p className="mb-8 text-center text-base font-medium" style={{ color: palette['text-muted'] }}>
          Assign a student the role of Teaching Assistant for a batch.
        </p>

        <form className="flex flex-col gap-8 w-full" onSubmit={e => {
          e.preventDefault();
          handleAssignTA();
        }}>
          {/* Course Selector */}
          <div className="flex flex-col gap-2 w-full">
            <label className="font-semibold" style={{ color: palette['text-dark'] }}>Select Course</label>
            <select
              className="border-2 px-4 py-3 rounded-xl w-full shadow-md"
              style={{
                borderColor: palette['border-soft'],
                backgroundColor: "#FFFFFF",
                color: palette['text-dark'],
                outlineColor: palette['sidebar-bg']
              }}
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              required
            >
              <option value="">-- Select Course --</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.name} ({course.code})
                </option>
              ))}
            </select>
          </div>

          {/* Batch Selector */}
          {batches.length > 0 && (
            <div className="flex flex-col gap-2 w-full">
              <label className="font-semibold" style={{ color: palette['text-dark'] }}>Select Batch</label>
              <select
                className="border-2 px-4 py-3 rounded-xl w-full shadow-md"
                style={{
                  borderColor: palette['border-soft'],
                  backgroundColor: "#FFFFFF",
                  color: palette['text-dark'],
                  outlineColor: palette['sidebar-bg']
                }}
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                required
              >
                <option value="">-- Select Batch --</option>
                {batches.map((batch) => (
                  <option key={batch._id} value={batch._id}>
                    {batch.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Current TA Display */}
          {currentTA && (
            <div className="flex flex-col gap-2 w-full">
              <label className="font-semibold" style={{ color: palette['text-dark'] }}>
                Current TA
              </label>
              <div
                className="px-4 py-3 rounded-xl border-2 shadow-md bg-white"
                style={{
                  borderColor: palette['border-soft'],
                  color: palette['text-muted'],
                }}
              >
                {currentTA.name} ({currentTA.email})
              </div>
            </div>
          )}

          {/* Student Selector */}
          {students.length > 0 && (
            <div className="flex flex-col gap-2 w-full">
              <label className="font-semibold" style={{ color: palette['text-dark'] }}>Select Student</label>
              <select
                className="border-2 px-4 py-3 rounded-xl w-full shadow-md"
                style={{
                  borderColor: palette['border-soft'],
                  backgroundColor: "#FFFFFF",
                  color: palette['text-dark'],
                  outlineColor: palette['sidebar-bg']
                }}
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                required
              >
                <option value="">-- Select Student --</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name} ({student.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={!selectedStudent}
            className="px-6 py-3 rounded-xl font-semibold text-white shadow-md disabled:opacity-50"
            style={{
              backgroundColor: palette['sidebar-bg'],
              color: palette['text-sidebar-dark'],
              boxShadow: `0 4px 15px ${palette['sidebar-bg']}40`
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.2 }}
          >
            Assign TA Role
          </motion.button>

          {/* Toast Notification */}
          <AnimatePresence>
            {message && (
              <motion.div
                className="text-center font-medium mt-2"
                style={{ color: palette['text-muted'] }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ManageRoles;
