import { useEffect, useState } from "react";
import axios from "axios";
import { FaRegSmileBeam, FaRegPaperPlane, FaRegFilePdf } from "react-icons/fa";
import { BsStars } from "react-icons/bs";
import { PiExam } from "react-icons/pi";

const PORT = import.meta.env.VITE_BACKEND_PORT || 5000;

interface Question {
  questionText: string;
  maxMarks: number;
}

interface Evaluation {
  _id: string;
  exam: {
    _id: string;
    title: string;
    questions: Question[];
  };
  submissionId: string | null;
  pdfUrl: string | null;
}

const pastelColors = [
  "bg-gradient-to-br from-blue-100 to-blue-50",
  "bg-gradient-to-br from-purple-100 to-purple-50",
  "bg-gradient-to-br from-pink-100 to-pink-50",
  "bg-gradient-to-br from-yellow-100 to-yellow-50",
  "bg-gradient-to-br from-green-100 to-green-50",
  "bg-gradient-to-br from-orange-100 to-orange-50",
];

const PeerEvaluationsPending = () => {
  const [pending, setPending] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openEval, setOpenEval] = useState<Evaluation | null>(null);
  const [marks, setMarks] = useState<(number | '')[]>([]);
  const [feedback, setFeedback] = useState("");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [markErrors, setMarkErrors] = useState<string[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchPending = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:${PORT}/api/student/pending-evaluations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPending(res.data.evaluations || []);
      } catch (err: any) {
        setError(
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to fetch pending evaluations"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  const openEvaluation = async (ev: Evaluation) => {
    setOpenEval(ev);
    setMarks(Array(ev.exam.questions.length).fill(""));
    setFeedback("");
    setSubmitStatus("idle");
    setMarkErrors(Array(ev.exam.questions.length).fill(""));
    setPdfUrl(null);
    if (ev.submissionId) {
      try {
        const token = localStorage.getItem("token");
        const url = `http://localhost:${PORT}/api/student/submission-pdf/${ev.submissionId}`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const blob = await res.blob();
          const blobUrl = window.URL.createObjectURL(blob);
          setPdfUrl(blobUrl);
        } else {
          setPdfUrl(null);
        }
      } catch {
        setPdfUrl(null);
      }
    }
  };

  const handleMarkChange = (idx: number, value: string) => {
    const newMarks = [...marks];
    const newErrors = [...markErrors];
    if (value === "") {
      newMarks[idx] = "";
      newErrors[idx] = "Please enter a value";
    } else {
      const num = Number(value);
      newMarks[idx] = num;
      if (openEval && num > openEval.exam.questions[idx].maxMarks) {
        newErrors[idx] = "Value greater than max marks";
      } else if (num < 0) {
        newErrors[idx] = "Value cannot be negative";
      } else {
        newErrors[idx] = "";
      }
    }
    setMarks(newMarks);
    setMarkErrors(newErrors);
  };

  const isSubmitDisabled =
    submitStatus === "submitting" ||
    !openEval ||
    marks.length !== openEval.exam.questions.length ||
    marks.some(m => m === "" || typeof m !== "number") ||
    markErrors.some(e => e);

  const handleDownloadPdf = async (submissionId: string) => {
    try {
      const token = localStorage.getItem("token");
      const url = `http://localhost:${PORT}/api/student/submission-pdf/${submissionId}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "submission.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => window.URL.revokeObjectURL(link.href), 10000);
    } catch {
      alert("Failed to download PDF.");
    }
  };

  const handleCloseModal = () => {
    setOpenEval(null);
    setMarks([]);
    setFeedback("");
    setSubmitStatus("idle");
    setMarkErrors([]);
    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };

  const handleSubmit = async () => {
    if (!openEval || isSubmitDisabled) return;
    setSubmitStatus("submitting");
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:${PORT}/api/student/submit-peer-evaluation`,
        {
          evaluationId: openEval._id,
          marks: marks.map(m => m === "" ? 0 : m),
          feedback,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSubmitStatus("success");
      setPending(prev => prev.filter(ev => ev._id !== openEval._id));
      handleCloseModal();
    } catch {
      setSubmitStatus("error");
    }
  };

  if (loading) {
    return (
      <div className="p-10 w-full max-w-5xl flex flex-col items-center">
        <BsStars className="text-5xl text-blue-400 animate-spin mb-4" />
        <div className="bg-white rounded-2xl shadow p-6 text-lg text-blue-900 font-semibold">
          Loading your pending evaluations...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 w-full max-w-5xl flex flex-col items-center">
        <div className="bg-white rounded-2xl shadow p-6 text-red-500 font-semibold">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-10 w-full max-w-5xl space-y-8 relative">
      <div className="flex items-center gap-3 mb-4">
        <FaRegSmileBeam className="text-4xl text-blue-400" />
        <h2 className="text-3xl font-bold text-blue-900">Pending Peer Evaluations</h2>
      </div>
      {pending.length === 0 ? (
        <div className="bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-2xl shadow p-8 text-lg text-blue-900 flex flex-col items-center">
          <FaRegSmileBeam className="text-6xl text-blue-300 mb-2" />
          <span>No pending evaluations 🎉</span>
          <span className="text-xs text-gray-400 mt-2">Enjoy your free time!</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pending.map((ev, i) => (
            <div
              key={ev._id}
              className={`rounded-2xl shadow p-6 flex flex-col justify-between border border-[#e5e7eb] hover:shadow-xl transition ${pastelColors[i % pastelColors.length]} relative`}
            >
              <div className="absolute -top-5 -right-5">
                <PiExam className="text-5xl text-blue-200 opacity-60" />
              </div>
              <div>
                <div className="font-semibold text-blue-900 text-xl mb-2 flex items-center gap-2">
                  <BsStars className="text-blue-400" /> {ev.exam.title}
                </div>
                <div className="text-blue-800 mb-2">
                  <span className="font-medium">Questions:</span> {ev.exam.questions.length}
                </div>
              </div>
              <button
                className="mt-2 bg-gradient-to-r from-blue-400 to-purple-400 text-white px-4 py-2 rounded-xl hover:from-blue-500 hover:to-purple-500 transition font-bold shadow"
                onClick={() => openEvaluation(ev)}
              >
                Start Evaluation
              </button>
            </div>
          ))}
        </div>
      )}

{openEval && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center">
    <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6 space-y-6">
      <h3 className="text-2xl font-bold text-indigo-700">Evaluate: {openEval.exam.title}</h3>

      {openEval.exam.questions.map((q, idx) => (
        <div key={idx} className="space-y-1">
          <label className="block font-medium text-gray-700">
            Q{idx + 1}: {q.questionText} (Max: {q.maxMarks})
          </label>
          <input
            type="number"
            className="w-full px-4 py-2 border rounded-xl"
            value={marks[idx]}
            onChange={(e) => handleMarkChange(idx, e.target.value)}
            placeholder="Enter marks"
            min={0}
            max={q.maxMarks}
          />
          {markErrors[idx] && <p className="text-red-500 text-sm">{markErrors[idx]}</p>}
        </div>
      ))}

      <div className="space-y-1">
        <label className="block font-medium text-gray-700">Feedback</label>
        <textarea
          className="w-full px-4 py-2 border rounded-xl"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Write feedback for your peer"
        />
      </div>

      <div className="flex flex-wrap gap-4 justify-end mt-6">
        {pdfUrl && (
          <button
            onClick={() => handleDownloadPdf(openEval.submissionId!)}
            className="bg-red-100 text-red-700 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
          >
            <FaRegFilePdf /> Download PDF
          </button>
        )}
        <button
          onClick={handleCloseModal}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          className={`px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-2 ${
            isSubmitDisabled ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          <FaRegPaperPlane /> Submit Evaluation
        </button>
      </div>
    </div>
  </div>
)}


    </div>
    
  );
  
};

export default PeerEvaluationsPending;
