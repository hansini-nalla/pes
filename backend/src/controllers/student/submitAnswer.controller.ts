// import { Request, Response, NextFunction } from "express";
// import { Submission } from "../../models/Submission.ts";
// import { Exam } from "../../models/Exam.ts";

// declare global {
//   namespace Express {
//     interface User {
//       _id: string;
//     }
//     interface Request {
//       user?: User;
//     }
//   }
// }

// export const submitAnswer = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { examId } = req.body;
//     const studentId = req.user?._id;

//     if (!studentId) {
//       next(new Error("Unauthorized"));
//       return;
//     }
//     if (!req.file || !examId) {
//       next(new Error("PDF file and examId are required"));
//       return;
//     }

//     const exam = await Exam.findById(examId);
//     if (!exam) {
//       next(new Error("Exam not found"));
//       return;
//     }

//     const now = new Date();
//     if (now < exam.startTime || now > exam.endTime) {
//       next(new Error("Submission window is closed"));
//       return;
//     }

//     const existing = await Submission.findOne({
//       student: studentId,
//       exam: examId,
//     });
//     if (existing) {
//       next(new Error("You have already submitted your answer"));
//       return;
//     }

//     await Submission.create({
//       student: studentId,
//       exam: examId,
//       course: exam.course,
//       batch: exam.batch,
//       answerPdf: req.file.buffer,
//       answerPdfMimeType: req.file.mimetype,
//       submittedAt: now,
//     });

//     res.json({ message: "PDF answer submitted successfully" });
//   } catch (err) {
//     next(err);
//   }
// };
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

    // Accept studentId from body for now (no user check)
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
    // const exam = await Exam.find();
    // console.log("Exam found:", exam);
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
