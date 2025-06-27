import { Response } from "express";
import { Exam } from "../../models/Exam.ts";
import { Batch } from "../../models/Batch.ts";
import { Submission } from "../../models/Submission.ts";
import { Evaluation } from "../../models/Evaluation.ts";
import AuthenticatedRequest from "../../middlewares/authMiddleware.ts";

export const initiatePeerEvaluation = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const teacherId = req.user?._id;
    const { examId } = req.body;

    if (!teacherId || req.user.role !== "teacher") {
      return res
        .status(403)
        .json({ message: "Only teachers can initiate evaluation." });
    }

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: "Exam not found." });
    if (exam.createdBy.toString() !== teacherId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not the creator of this exam." });
    }

    const batch = await Batch.findById(exam.batch);
    if (!batch) return res.status(404).json({ message: "Batch not found." });
    const students = batch.students.map((id: any) => id.toString());
    if (students.length < 2) {
      return res
        .status(400)
        .json({ message: "Not enough students for peer evaluation." });
    }

    const submissions = await Submission.find({ exam: examId });
    const submissionMap: Record<string, string> = {};
    submissions.forEach((sub) => {
      submissionMap[sub.student.toString()] = sub.id.toString();
    });

    const k = exam.k;
    if (typeof k !== "number" || k < 1 || k >= students.length) {
      return res.status(400).json({
        message: "k must be a positive integer less than number of students.",
      });
    }

    await Evaluation.deleteMany({ exam: examId });

    const n = students.length;
    const evalsToInsert = [];
    for (let i = 0; i < n; i++) {
      const evaluator = students[i];
      let assigned = 0;
      let offset = 1;
      while (assigned < k && offset < n) {
        const evaluatee = students[(i + offset) % n];
        if (evaluatee !== evaluator && submissionMap[evaluatee]) {
          evalsToInsert.push({
            exam: examId,
            evaluator,
            evaluatee,
            marks: [],
            feedback: "",
            status: "pending",
            flagged: false,
          });
          assigned++;
        }
        offset++;
      }
    }

    await Evaluation.insertMany(evalsToInsert);

    res.status(200).json({
      message: "Peer evaluation initiated.",
      totalEvaluations: evalsToInsert.length,
    });
  } catch (err) {
    console.error("Error initiating peer evaluation:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};