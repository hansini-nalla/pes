import { useEffect, useState } from "react";
import axios from "axios";

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
  pdfUrl: string | null;
}

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
      <div className="p-10 w-full max-w-5xl">
        <div className="bg-white rounded-2xl shadow p-6 text-lg text-[#57418d]">
          Loading pending evaluations...
        </div>
      </div>
    );
  if (error)
    return (
      <div className="p-10 w-full max-w-5xl">
        <div className="bg-white rounded-2xl shadow p-6 text-red-500">{error}</div>
      </div>
    );

  return (
    <div className="p-10 w-full max-w-5xl space-y-8 relative">
      <h2 className="text-3xl font-bold text-[#38365e] mb-4">Pending Peer Evaluations</h2>
      {pending.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-6 text-lg text-[#57418d]">
          No pending evaluations 🎉
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pending.map((ev) => (
            <div
              key={ev._id}
              className="bg-white rounded-2xl shadow p-6 flex flex-col justify-between border border-[#e5e7eb] hover:shadow-lg transition"
            >
              <div>
                <div className="font-semibold text-[#57418d] text-xl mb-2">{ev.exam.title}</div>
                <div className="text-[#38365e] mb-2">
                  <span className="font-medium">Questions:</span> {ev.exam.questions.length}
                </div>
              </div>
              <button
                className="mt-2 bg-[#57418d] text-white px-4 py-2 rounded-xl hover:bg-[#402b6c] transition"
                onClick={() => openEvaluation(ev)}
              >
                Evaluate
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
            className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg relative border border-[#e5e7eb]"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setOpenEval(null)}
            >
              ×
            </button>
            <h3 className="text-2xl font-bold text-[#57418d] mb-2">{openEval.exam.title}</h3>
            {openEval.pdfUrl && (
              <div className="mb-4 flex gap-4">
                <a
                  href={`${openEval.pdfUrl}?token=${localStorage.getItem("token")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#57418d] text-white px-4 py-2 rounded-xl hover:bg-[#402b6c] transition"
                >
                  Open PDF
                </a>
                <a
                  href={`${openEval.pdfUrl}?token=${localStorage.getItem("token")}&download=true`}
                  className="bg-[#57418d] text-white px-4 py-2 rounded-xl hover:bg-[#402b6c] transition"
                >
                  Download PDF
                </a>
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
                  <label className="block font-semibold mb-1">
                    {q.questionText} <span className="text-gray-500">({q.maxMarks} marks)</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={q.maxMarks}
                    required
                    className="border px-4 py-2 rounded-xl w-full"
                    value={marks[idx]}
                    onChange={e => handleMarkChange(idx, e.target.value)}
                  />
                  {markErrors[idx] && (
                    <div className="text-red-500 text-sm mt-1">{markErrors[idx]}</div>
                  )}
                </div>
              ))}
              <div>
                <label className="block font-semibold mb-1">Feedback (optional)</label>
                <textarea
                  className="border px-4 py-2 rounded-xl w-full"
                  rows={3}
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="bg-[#57418d] text-white px-6 py-2 rounded-xl hover:bg-[#402b6c] transition"
                disabled={isSubmitDisabled}
              >
                {submitStatus === "submitting" ? "Submitting..." : "Submit Evaluation"}
              </button>
              {submitStatus === "success" && (
                <div className="text-green-600 mt-2">Evaluation submitted!</div>
              )}
              {submitStatus === "error" && (
                <div className="text-red-500 mt-2">Failed to submit evaluation.</div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeerEvaluationsPending;