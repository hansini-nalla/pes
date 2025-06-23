import { Request, Response, NextFunction } from "express";
import { Submission } from "../../models/Submission.ts";

export const getSubmissionPdf = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { examId, studentId } = req.params;
    const submission = await Submission.findOne({
      exam: examId,
      student: studentId,
    });
    if (!submission || !submission.answerPdf) {
      res.status(404).send("PDF not found");
      return;
    }
    res.setHeader(
      "Content-Type",
      submission.answerPdfMimeType || "application/pdf"
    );
    res.setHeader("Content-Disposition", "inline; filename=submission.pdf");
    res.send(submission.answerPdf);
  } catch (err) {
    next(err);
  }
};