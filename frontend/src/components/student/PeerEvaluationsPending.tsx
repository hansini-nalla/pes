import { useEffect, useState } from "react";
import axios from "axios";
import { FaRegSmileBeam, FaRegPaperPlane, FaRegFilePdf } from "react-icons/fa";
import { BsStars } from "react-icons/bs";
import { PiExam } from "react-icons/pi";

type Question = {
  questionText: string;
  maxMarks: number;
};

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
  const [marks, setMarks] = useState<(number | "")[]>([]);
  const [feedback, setFeedback] = useState("");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [markErrors, setMarkErrors] = useState<string[]>([]);

  useEffect(() => {
    const fetchPending = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/student/pending-evaluations", {
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

  const openEvaluation = (ev: Evaluation) => {
    setOpenEval(ev);
    setMarks(Array(ev.exam.questions.length).fill(""));
    setFeedback("");
    setSubmitStatus("idle");
    setMarkErrors(Array(ev.exam.questions.length).fill(""));
  };

  const handleMarkChange = (idx: number, value: string) => {
    let newMarks = [...marks];
    let newErrors = [...markErrors];
    if (value === "") {
      newMarks[idx] = "";
      newErrors[idx] = "Please enter a value";
      setMarks(newMarks);
      setMarkErrors(newErrors);
      return;
    }
    const num = Number(value);
    newMarks[idx] = num;
    if (
      openEval &&
      (num > openEval.exam.questions[idx].maxMarks)
    ) {
      newErrors[idx] = "Value greater than max marks";
    } else if (num < 0) {
      newErrors[idx] = "Value cannot be negative";
    } else {
      newErrors[idx] = "";
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

  // PDF fetch helpers
  const fetchPdfWithToken = async (submissionId: string) => {
    const token = localStorage.getItem("token");
    const url = `http://localhost:5000/api/student/submission-pdf/${submissionId}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      throw new Error("Failed to fetch PDF");
    }
    return await res.blob();
  };

  const handleOpenPdf = async (submissionId: string) => {
    try {
      const blob = await fetchPdfWithToken(submissionId);
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
    } catch {
      alert("Failed to open PDF.");
    }
  };

  const handleDownloadPdf = async (submissionId: string) => {
    try {
      const blob = await fetchPdfWithToken(submissionId);
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

  const handleSubmit = async () => {
    if (!openEval) return;
    if (isSubmitDisabled) return;
    setSubmitStatus("submitting");
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/student/submit-peer-evaluation",
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
      setPending(pending.filter(ev => ev._id !== openEval._id));
      setOpenEval(null);
    } catch {
      setSubmitStatus("error");
    }
  };

  if (loading)
    return (
      <div className="p-10 w-full max-w-5xl flex flex-col items-center">
        <BsStars className="text-5xl text-blue-400 animate-spin mb-4" />
        <div className="bg-white rounded-2xl shadow p-6 text-lg text-blue-900 font-semibold">
          Loading your pending evaluations...
        </div>
      </div>
    );
  if (error)
    return (
      <div className="p-10 w-full max-w-5xl flex flex-col items-center">
        <div className="bg-white rounded-2xl shadow p-6 text-red-500 font-semibold">{error}</div>
      </div>
    );

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
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: "rgba(255,255,255,0.0)" }}
          onClick={() => setOpenEval(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg relative border-4 border-blue-200"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-blue-400 text-3xl font-bold"
              onClick={() => setOpenEval(null)}
              aria-label="Close"
            >
              ×
            </button>
            <div className="flex items-center gap-2 mb-2">
              <BsStars className="text-blue-400 text-2xl" />
              <h3 className="text-2xl font-bold text-blue-900">{openEval.exam.title}</h3>
            </div>
            {openEval.submissionId && (
              <div className="mb-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => handleOpenPdf(openEval.submissionId!)}
                  className="bg-gradient-to-r from-blue-400 to-purple-400 text-white px-4 py-2 rounded-xl hover:from-blue-500 hover:to-purple-500 transition flex items-center gap-2"
                >
                  <FaRegFilePdf /> Open PDF
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadPdf(openEval.submissionId!)}
                  className="bg-gradient-to-r from-blue-400 to-purple-400 text-white px-4 py-2 rounded-xl hover:from-blue-500 hover:to-purple-500 transition flex items-center gap-2"
                >
                  <FaRegFilePdf /> Download PDF
                </button>
              </div>
            )}

            <form
              onSubmit={e => {
                e.preventDefault();
                handleSubmit();
              }}
              className="space-y-4"
            >
              {openEval.exam.questions.map((q, idx) => (
                <div key={idx}>
                  <label className="block font-semibold mb-1 text-blue-900">
                    Q{idx + 1}. {q.questionText} <span className="text-gray-500">({q.maxMarks} marks)</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={q.maxMarks}
                    required
                    className={`border-2 px-4 py-2 rounded-xl w-full text-lg focus:ring-2 focus:ring-blue-200 transition ${markErrors[idx]
                      ? "border-red-400 bg-red-50"
                      : "border-blue-200 bg-blue-50 focus:bg-white"
                      }`}
                    value={marks[idx]}
                    onChange={e => handleMarkChange(idx, e.target.value)}
                  />
                  {markErrors[idx] && (
                    <div className="text-red-500 text-sm mt-1 animate-pulse">{markErrors[idx]}</div>
                  )}
                </div>
              ))}
              <div>
                <label className="block font-semibold mb-1 text-blue-900">Feedback (optional)</label>
                <textarea
                  className="border-2 border-blue-200 px-4 py-2 rounded-xl w-full focus:ring-2 focus:ring-blue-200 transition bg-blue-50"
                  rows={3}
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  placeholder="Leave a kind word or suggestion!"
                />
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-400 to-purple-400 text-white px-6 py-2 rounded-xl hover:from-blue-500 hover:to-purple-500 transition font-bold flex items-center gap-2 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isSubmitDisabled}
              >
                <FaRegPaperPlane className="text-lg" />
                {submitStatus === "submitting" ? "Submitting..." : "Submit Evaluation"}
              </button>
              {submitStatus === "success" && (
                <div className="text-green-600 mt-2 flex items-center gap-2">
                  <FaRegSmileBeam className="text-2xl" /> Evaluation submitted!
                </div>
              )}
              {submitStatus === "error" && (
                <div className="text-red-500 mt-2">Failed to submit evaluation. Try again.</div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeerEvaluationsPending;