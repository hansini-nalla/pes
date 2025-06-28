// frontend/src/pages/teacher/TeacherCourses.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { FiDownload, FiUserPlus } from "react-icons/fi";
import { motion } from "framer-motion";

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

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get("http://localhost:5000/api/teacher/courses", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
    // Dummy CSV generation logic (replace with actual API/download logic)
    const csv = `Name,Email,Course,Batch\nJohn Doe,john@example.com,${course.name},${batch.name}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${course.name}_${batch.name}_students.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
                <th
                  className="py-4 px-6 rounded-l-2xl text-lg font-semibold text-center tracking-wide"
                  style={{ backgroundColor: palette['sidebar-bg'], color: palette['text-sidebar-dark'] }}
                >
                  Course Name
                </th>
                <th
                  className="py-4 px-6 text-lg font-semibold text-center tracking-wide"
                  style={{ backgroundColor: palette['sidebar-bg'], color: palette['text-sidebar-dark'] }}
                >
                  Batch Name
                </th>
                <th
                  className="py-4 px-6 rounded-r-2xl text-lg font-semibold text-center tracking-wide"
                  style={{ backgroundColor: palette['sidebar-bg'], color: palette['text-sidebar-dark'] }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {courses.flatMap((course) =>
                course.batches.map((batch) => (
                  <tr
                    key={course._id + batch._id}
                    className="transition"
                    style={{
                      backgroundColor: palette['bg-secondary'],
                      boxShadow: `0 2px 10px rgba(128, 0, 128, 0.04)`,
                      color: palette['text-dark'],
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = palette['sidebar-bg'] + "20")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = palette['bg-secondary'])
                    }
                  >
                    <td className="px-6 py-4 text-center text-base font-medium rounded-l-xl">
                      {course.name}
                    </td>
                    <td className="px-6 py-4 text-center text-base font-medium">{batch.name}</td>
                    <td className="px-6 py-4 text-center flex gap-2 justify-center rounded-r-xl">
                      <motion.button
                        className="px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                        style={{
                          backgroundColor: palette['accent-bright-yellow'],
                          color: palette['text-dark'],
                          boxShadow: `0 4px 15px ${palette['accent-bright-yellow']}40`,
                        }}
                        onClick={() => alert("Enroll modal coming soon")}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <FiUserPlus className="text-lg" />
                        Enroll Student
                      </motion.button>
                      <motion.button
                        className="px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                        style={{
                          backgroundColor: palette['accent-lilac'],
                          color: "#fff",
                          boxShadow: `0 4px 15px ${palette['accent-lilac']}40`,
                        }}
                        onClick={() => handleDownloadCSV(course, batch)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
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
    </div>
  );
};

export default TeacherCourses;
