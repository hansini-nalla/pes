import { useEffect, useState } from "react";
import axios from "axios";
import { FiDownload, FiUserPlus } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Papa from "papaparse";

interface Batch {
  _id: string;
  name: string;
}

interface Course {
  _id: string;
  name: string;
  code: string;
  batches: Batch[];
}

const palette = {
  'bg-secondary': '#FFFAF2',
  'sidebar-bg': '#E6E6FA',
  'border-soft': '#F0E6EF',
  'text-dark': '#4B0082',
  'text-muted': '#A9A9A9',
  'text-sidebar-dark': '#4B0082',
  'accent-bright-yellow': '#FFD700',
  'accent-lilac': '#C8A2C8',
};

const TeacherCourses = () => {
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [csvData, setCsvData] = useState<{ name: string; email: string }[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/teacher/courses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(res.data?.courses || []);
      } catch (err) {
        console.error("Failed to fetch courses", err);
        setCourses([]);
      }
    };
    fetchCourses();
  }, []);

  const handleDownloadCSV = (course: Course, batch: Batch) => {
    const csv = `Name,Email,Course,Batch\nJohn Doe,john@example.com,${course.name},${batch.name}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${course.name}_${batch.name}_students.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData(results.data as { name: string; email: string }[]);
      },
    });
  };

  const handleEnroll = async () => {
    if (!selectedCourse || !selectedBatch || csvData.length === 0) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/teacher/enroll",
        {
          courseId: selectedCourse._id,
          batchId: selectedBatch._id,
          students: csvData,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage(res.data.message || "Enrolled successfully!");
      setTimeout(() => setShowModal(false), 1500);
    } catch (err: any) {
      setMessage(err.response?.data?.error || "Error enrolling students");
    }
  };

  return (
    <div className="flex flex-col items-center justify-start w-full h-full pt-10 pb-4">
      <h2 className="text-3xl font-extrabold mb-10 text-center drop-shadow" style={{ color: palette['text-dark'] }}>
        Courses and Batches
      </h2>
      <div className="w-full max-w-5xl">
        {courses === null ? (
          <p className="text-center text-lg font-medium" style={{ color: palette['text-muted'] }}>Loading courses...</p>
        ) : courses.length === 0 ? (
          <p className="text-center text-lg font-semibold" style={{ color: palette['text-muted'] }}>No courses assigned yet.</p>
        ) : (
          <table className="w-full border-separate" style={{ borderSpacing: "0 16px" }}>
            <thead>
              <tr>
                <th className="py-4 px-6 rounded-l-2xl text-lg font-semibold text-center tracking-wide" style={{ backgroundColor: palette['sidebar-bg'], color: palette['text-sidebar-dark'] }}>
                  Course Name
                </th>
                <th className="py-4 px-6 text-lg font-semibold text-center tracking-wide" style={{ backgroundColor: palette['sidebar-bg'], color: palette['text-sidebar-dark'] }}>
                  Batch Name
                </th>
                <th className="py-4 px-6 rounded-r-2xl text-lg font-semibold text-center tracking-wide" style={{ backgroundColor: palette['sidebar-bg'], color: palette['text-sidebar-dark'] }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {courses.flatMap((course) =>
                course.batches.map((batch) => (
                  <tr key={course._id + batch._id}
                    style={{
                      backgroundColor: palette['bg-secondary'],
                      boxShadow: `0 2px 10px rgba(128, 0, 128, 0.04)`,
                      color: palette['text-dark'],
                    }}
                  >
                    <td className="px-6 py-4 text-center font-medium rounded-l-xl">{course.name}</td>
                    <td className="px-6 py-4 text-center">{batch.name}</td>
                    <td className="px-6 py-4 text-center flex gap-2 justify-center rounded-r-xl">
                      <motion.button
                        className="px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                        style={{ backgroundColor: palette['accent-bright-yellow'], color: palette['text-dark'], boxShadow: `0 4px 15px ${palette['accent-bright-yellow']}40` }}
                        onClick={() => {
                          setSelectedCourse(course);
                          setSelectedBatch(batch);
                          setShowModal(true);
                          setMessage(null);
                          setCsvData([]);
                        }}
                      >
                        <FiUserPlus className="text-lg" />
                        Enroll Student
                      </motion.button>
                      <motion.button
                        className="px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                        style={{ backgroundColor: palette['accent-lilac'], color: "#fff", boxShadow: `0 4px 15px ${palette['accent-lilac']}40` }}
                        onClick={() => handleDownloadCSV(course, batch)}
                      >
                        <FiDownload className="text-lg" />
                        Download CSV
                      </motion.button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl border"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: palette['text-dark'] }}>
                Upload CSV for {selectedCourse?.name} - {selectedBatch?.name}
              </h3>
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="mb-4 w-full border border-gray-300 p-2 rounded"
              />
              {csvData.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm mb-2 font-semibold" style={{ color: palette['text-muted'] }}>
                    Preview ({csvData.length} students):
                  </p>
                  <ul className="text-sm max-h-40 overflow-y-auto list-disc pl-5 text-gray-700">
                    {csvData.map((s, idx) => (
                      <li key={idx}>{s.name} ({s.email})</li>
                    ))}
                  </ul>
                </div>
              )}
              {message && <p className="text-sm font-semibold mb-2" style={{ color: palette['text-muted'] }}>{message}</p>}
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium border" style={{ color: palette['text-muted'] }}>
                  Cancel
                </button>
                <button onClick={handleEnroll} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ backgroundColor: palette['sidebar-bg'], color: palette['text-dark'] }}>
                  Confirm Upload
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeacherCourses;
