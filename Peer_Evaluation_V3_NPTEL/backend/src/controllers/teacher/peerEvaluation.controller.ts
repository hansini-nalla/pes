import { Response } from "express";
import { Exam } from "../../models/Exam.ts";
import { Batch } from "../../models/Batch.ts";
import { Submission } from "../../models/Submission.ts";
import { Evaluation } from "../../models/Evaluation.ts";
import AuthenticatedRequest from "../../middlewares/authMiddleware.ts";

function assignBalancedEvaluations(
  studentIds: string[],
  k: number
): { evaluator: string; evaluatee: string }[] {
  const n = studentIds.length;
  const assignments: { evaluator: string; evaluatee: string }[] = [];

  for (let offset = 1; offset <= k; offset++) {
    for (let i = 0; i < n; i++) {
      const evaluator = studentIds[i];
      const evaluatee = studentIds[(i + offset) % n];
      if (evaluator !== evaluatee) {
        assignments.push({ evaluator, evaluatee });
      }
    }
  }

  return assignments;
}
export const initiatePeerEvaluation = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const teacherId = req.user?._id;
    const { examId } = req.body;

    if (!teacherId || req.user.role !== "teacher") {
      res
        .status(403)
        .json({ message: "Only teachers can initiate evaluation." });
      return;
    }

    const exam = await Exam.findById(examId).select("batch k");
    if (!exam) {
      res.status(404).json({ message: "Exam not found." });
      return;
    }

    const batch = await Batch.findById(exam.batch).select("instructor");
    if (!batch) {
      res.status(404).json({ message: "Batch not found." });
      return;
    }

    if (batch.instructor.toString() !== teacherId.toString()) {
      res
        .status(403)
        .json({ message: "You are not the instructor for this batch." });
      return;
    }

    const submissions = await Submission.find({ exam: examId });
    const submittedStudents = submissions.map((sub) => sub.student.toString());

    const k = exam.k;
    const n = submittedStudents.length;

    if (typeof k !== "number" || k < 1 || k >= n) {
      res.status(400).json({
        message:
          "k must be a positive integer less than number of submitted students.",
      });
      return;
    }

    // ✅ Step 1: Shuffle for randomness
    const shuffled = [...submittedStudents].sort(() => Math.random() - 0.5);

    // ✅ Step 2: Generate balanced evaluation pairs
    const assignments = assignBalancedEvaluations(shuffled, k);

    // ✅ Step 3: Clear old evaluations for this exam
    await Evaluation.deleteMany({ exam: examId });

    // ✅ Step 4: Prepare and insert evaluations
    const evalsToInsert = assignments.map(({ evaluator, evaluatee }) => ({
      exam: examId,
      evaluator,
      evaluatee,
      marks: [],
      feedback: "",
      status: "pending",
      flagged: false,
    }));

    await Evaluation.insertMany(evalsToInsert);

    res.status(200).json({
      message:
        "Peer evaluation initiated with balanced randomized assignments.",
      totalEvaluations: evalsToInsert.length,
    });
  } catch (err) {
    console.error("Error initiating peer evaluation:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
