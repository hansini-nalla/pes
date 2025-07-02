
import { useEffect, useState } from "react";
import axios from "axios";
import { FiEdit, FiTrash2, FiPlus, FiSend } from "react-icons/fi";

const PORT = import.meta.env.VITE_BACKEND_PORT || 5000;

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg text-white
      ${type === "success" ? "bg-green-600" : "bg-red-600"}`}>
      {message}
    </div>
  );
}
interface Course {
  _id: string;
  name: string;
  batches: { _id: string; name: string }[];
}
interface Exam {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  numQuestions: number;
  k: number;
}

export default function TeacherExams() {
  const [,setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const token = localStorage.getItem("token");
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [exams, setExams] = useState<Exam[]>([]);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [editExam, setEditExam] = useState<Exam | null>(null);
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [k, setK] = useState(1);
  const [questions, setQuestions] = useState([{ q: "", max: 0 }]);

  useEffect(() => {
    axios
      .get(`http://localhost:${PORT}/api/teacher/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCourses(res.data.courses))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedCourse && selectedBatch) {
      axios
        .get(`http://localhost:${PORT}/api/teacher/courses/${selectedCourse}/exams`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setExams(res.data.exams))
        .catch(console.error);
    } else {
      setExams([]);
    }
  }, [selectedCourse, selectedBatch]);

  const refreshExams = async () => {
    const res = await axios.get(`http://localhost:${PORT}/api/teacher/courses/${selectedCourse}/exams`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setExams(res.data.exams);
  };

  const resetForm = () => {
    setTitle("");
    setStartTime("");
    setEndTime("");
    setK(1);
    setQuestions([{ q: "", max: 0 }]);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post(`http://localhost:${PORT}/api/teacher/exams`, {
      title,
      startTime,
      endTime,
      k,
      numQuestions: questions.length,
      questions: questions.map((q) => ({ questionText: q.q, maxMarks: q.max })),
      course: selectedCourse,
      batch: selectedBatch,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setCreateOpen(false);
    resetForm();
    refreshExams();
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editExam) return;
    await axios.put(`http://localhost:${PORT}/api/teacher/exams/${editExam._id}`, {
      title,
      startTime,
      endTime,
      k,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setEditOpen(false);
    setEditExam(null);
    resetForm();
    refreshExams();
  };

  const openEditForm = (exam: Exam) => {
    setEditExam(exam);
    setTitle(exam.title);
    setStartTime(exam.startTime.slice(0, 16));
    setEndTime(exam.endTime.slice(0, 16));
    setK(exam.k);
    setEditOpen(true);
  };

  const deleteExam = async (id: string) => {
    await axios.delete(`http://localhost:${PORT}/api/teacher/exams/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    refreshExams();
  };

  const handleUploadAnswerKey = async (examId: string) => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "application/pdf";
    fileInput.click();

    fileInput.onchange = async () => {
      const file = fileInput.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("answerKeyPdf", file);

      try {
        await axios.post(`http://localhost:${PORT}/api/teacher/${examId}/answer-key`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        setToast({ message: "Answer key uploaded successfully", type: "success" });
      } catch (error: any) {
        setToast({ message: error.response?.data?.message || "Upload failed", type: "error" });
      }
    };
  };
  const handleGenerateQRs = async (examId: string) => {
  try {
    const response = await fetch(`http://localhost:${PORT}/api/teacher/exam/${examId}/generate-qrs`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to generate QR bundle");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `Exam_QRs_${examId}.zip`;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("QR generation failed:", err);
    setToast({ message: "QR generation failed", type: "error" });
  }
};


  return (
    <div className="flex flex-col items-center w-full pt-10 px-6 pb-20">
      <h2 className="text-3xl font-extrabold mb-8 text-center text-purple-800">Manage Exams</h2>

      <div className="flex flex-wrap gap-4 mb-6 justify-center">
        <select className="border-2 border-purple-200 px-4 py-2 rounded-xl shadow-md" value={selectedCourse} onChange={(e) => { setSelectedCourse(e.target.value); setSelectedBatch(""); }}>
          <option value="">Select Course</option>
          {courses.map((c) => (<option key={c._id} value={c._id}>{c.name}</option>))}
        </select>

        <select className="border-2 border-purple-200 px-4 py-2 rounded-xl shadow-md" value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)}>
          <option value="">Select Batch</option>
          {courses.find((c) => c._id === selectedCourse)?.batches.map((b) => (<option key={b._id} value={b._id}>{b.name}</option>))}
        </select>

        <button className="bg-purple-600 text-white px-4 py-2 rounded-xl shadow-md hover:bg-purple-700" onClick={() => setCreateOpen(true)} disabled={!selectedCourse || !selectedBatch}>
          <FiPlus className="inline-block mr-2" /> Create Exam
        </button>
      </div>

      {exams.length > 0 && (
        <table className="w-full max-w-6xl text-left border-separate border-spacing-y-4">
          <thead>
            <tr className="text-purple-700">
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Start</th>
              <th className="px-4 py-2">End</th>
              <th className="px-4 py-2">#Q</th>
              <th className="px-4 py-2">K</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((exam) => (
              <tr key={exam._id} className="bg-purple-50 rounded-xl shadow-md">
                <td className="px-4 py-2 font-medium">{exam.title}</td>
                <td className="px-4 py-2">{new Date(exam.startTime).toLocaleString()}</td>
                <td className="px-4 py-2">{new Date(exam.endTime).toLocaleString()}</td>
                <td className="px-4 py-2">{exam.numQuestions}</td>
                <td className="px-4 py-2">{exam.k}</td>
                <td className="px-4 py-2 flex gap-3 items-center">
                  <button
                    onClick={() => openEditForm(exam)}
                    className="p-2 bg-yellow-100 rounded-full hover:bg-yellow-200 shadow"
                    title="Edit Exam"
                  >
                    <FiEdit className="text-yellow-700" />
                  </button>

                  <button
                    onClick={() => deleteExam(exam._id)}
                    className="p-2 bg-red-100 rounded-full hover:bg-red-200 shadow"
                    title="Delete Exam"
                  >
                    <FiTrash2 className="text-red-600" />
                  </button>

                  <button
                    onClick={() => handleGenerateQRs(exam._id)}
                    className="p-2 bg-indigo-100 rounded-full hover:bg-indigo-200 shadow"
                    title="Generate QR PDFs"
                  >
                    📦
                  </button>


                  <button title="Initiate Peer Evaluation"
                    onClick={async () => {
                      try {
                        const res = await axios.post(
                          `http://localhost:${PORT}/api/teacher/initiate-evaluation`,
                          { examId: exam._id },
                          { headers: { Authorization: `Bearer ${token}` } }
                        );
                        setToast({ message: res.data.message || "Evaluation initiated", type: "success" });
                      } catch (err: any) {
                        setToast({ message: err.response?.data?.message || "Error initiating evaluation", type: "error" });
                      }
                    }}
                    className="group relative p-2 bg-green-100 rounded-full hover:bg-green-200 shadow"
                  >
                    <FiSend className="text-green-700" />
                  </button>
                  <button
                    onClick={() => handleUploadAnswerKey(exam._id)}
                    className="p-2 bg-blue-100 rounded-full hover:bg-blue-200 shadow"
                    title="Upload Answer Key PDF"
                  >
                    📄
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md space-y-4">
            <h2 className="text-xl font-bold text-purple-800">Create Exam</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input className="w-full border-2 px-4 py-2 rounded-xl" required placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <input className="w-full border-2 px-4 py-2 rounded-xl" type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              <input className="w-full border-2 px-4 py-2 rounded-xl" type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              <input className="w-full border-2 px-4 py-2 rounded-xl" type="number" min={1} value={k} onChange={(e) => setK(Number(e.target.value))} placeholder="K (evaluations per student)" />
              <div className="space-y-2">
                <h3 className="font-semibold text-purple-700">Questions</h3>
                {questions.map((q, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input className="flex-1 border-2 px-3 py-2 rounded-xl" placeholder={`Q${idx + 1} text`} value={q.q} onChange={(e) => {
                      const updated = [...questions]; updated[idx].q = e.target.value; setQuestions(updated);
                    }} />
                    <input type="number" className="w-20 border-2 px-2 py-2 rounded-xl" placeholder="Marks" value={q.max} onChange={(e) => {
                      const updated = [...questions]; updated[idx].max = parseInt(e.target.value); setQuestions(updated);
                    }} />
                    <button type="button" onClick={() => setQuestions(questions.filter((_, i) => i !== idx))} className="text-red-600">✕</button>
                  </div>
                ))}
                <button type="button" className="bg-purple-100 px-3 py-1 rounded-xl" onClick={() => setQuestions([...questions, { q: "", max: 0 }])}>+ Add Question</button>
              </div>
              <div className="flex justify-between pt-4">
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-xl">Create</button>
                <button type="button" onClick={() => setCreateOpen(false)} className="text-sm text-purple-600">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && editExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-purple-800">Update Exam</h2>
            <form onSubmit={handleEdit} className="space-y-4">
              <input className="w-full border-2 px-4 py-2 rounded-xl" required placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <input className="w-full border-2 px-4 py-2 rounded-xl" type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              <input className="w-full border-2 px-4 py-2 rounded-xl" type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              <input className="w-full border-2 px-4 py-2 rounded-xl" type="number" value={k} min={1} onChange={(e) => setK(Number(e.target.value))} placeholder="K" />
              <div className="space-y-2">
                <h3 className="font-semibold text-purple-700">Questions</h3>
                {questions.map((q, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input className="flex-1 border-2 px-3 py-2 rounded-xl" placeholder={`Q${idx + 1} text`} value={q.q} onChange={(e) => {
                      const updated = [...questions]; updated[idx].q = e.target.value; setQuestions(updated);
                    }} />
                    <input type="number" className="w-20 border-2 px-2 py-2 rounded-xl" placeholder="Marks" value={q.max} onChange={(e) => {
                      const updated = [...questions]; updated[idx].max = parseInt(e.target.value); setQuestions(updated);
                    }} />
                    <button type="button" onClick={() => setQuestions(questions.filter((_, i) => i !== idx))} className="text-red-600">✕</button>
                  </div>
                ))}
                <button type="button" className="bg-purple-100 px-3 py-1 rounded-xl" onClick={() => setQuestions([...questions, { q: "", max: 0 }])}>+ Add Question</button>
              </div>
              <div className="flex justify-between pt-4">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-xl">Update</button>
                <button type="button" onClick={() => setEditOpen(false)} className="text-sm text-purple-600">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}