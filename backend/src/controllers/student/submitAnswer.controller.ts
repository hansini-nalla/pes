import { Request, Response, NextFunction } from "express";
import { Submission } from "../../models/Submission.ts";
import { Exam } from "../../models/Exam.ts";

export const submitAnswer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("submitAnswer called");
    const { examId, studentId } = req.body;

    if (!studentId) {
      res.status(400).json({ error: "studentId is required in body" });
      return;
    }
    if (!req.file || !examId) {
      res.status(400).json({ error: "PDF file and examId are required" });
      return;
    }

    // Check if exam exists and is within submission window
    const exam = await Exam.findById(examId);
    if (!exam) {
      res.status(404).json({ error: "Exam not found" });
      return;
    }

    const now = new Date();
    if (now < exam.startTime || now > exam.endTime) {
      res.status(403).json({ error: "Submission window is closed" });
      return;
    }

    // Prevent duplicate submissions
    const existing = await Submission.findOne({
      student: studentId,
      exam: examId,
    });
    if (existing) {
      res.status(409).json({ error: "You have already submitted your answer" });
      return;
    }

    await Submission.create({
      student: studentId,
      exam: examId,
      course: exam.course,
      batch: exam.batch,
      answerPdf: req.file.buffer,
      answerPdfMimeType: req.file.mimetype,
      submittedAt: now,
    });

    res.json({ message: "PDF answer submitted successfully" });
  } catch (err) {
    next(err);
  }
};