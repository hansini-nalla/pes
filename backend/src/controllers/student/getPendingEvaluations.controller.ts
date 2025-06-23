import { Response, NextFunction } from "express";
import AuthenticatedRequest from "../../middlewares/authMiddleware.ts";
import { Evaluation } from "../../models/Evaluation.ts";
import { Submission } from "../../models/Submission.ts";

export const getPendingEvaluations = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const studentId = req.user?._id;
    const pending = await Evaluation.find({
      evaluator: studentId,
      status: "pending",
    }).populate({
      path: "exam",
      select: "title questions",
    });

    const evaluations = await Promise.all(
      pending.map(async (ev) => {
        if (!ev.exam) return null;
        const submission = await Submission.findOne({
          exam: ev.exam._id,
        });
        return {
          _id: ev._id,
          exam: {
            _id: ev.exam._id,
            title:
              typeof ev.exam === "object" && "title" in ev.exam
                ? ev.exam.title
                : "No Title",
            questions:
              typeof ev.exam === "object" && "questions" in ev.exam
                ? ev.exam.questions
                : [],
          },
          pdfUrl: submission
            ? `http://localhost:5000/api/student/submission-pdf/${ev.exam._id}/${ev.evaluatee}`
            : null,
        };
      })
    );

    res.json({ evaluations: evaluations.filter(Boolean) });
  } catch (err) {
    next(err);
  }
};
