import { Request, Response, NextFunction } from "express";
import { Exam } from "../../models/Exam.ts";
import { Batch } from "../../models/Batch.ts";
import { User } from "../../models/User.ts";
import { Ticket } from "../../models/Ticket.ts";

export const raiseTicket = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const studentId = req.user?._id;
    const { examId, evaluatorId, message } = req.body;

    if (!studentId || !examId || !evaluatorId || !message) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const exam = await Exam.findById(examId).lean();
    if (!exam) {
      res.status(404).json({ error: "Exam not found" });
      return;
    }

    // Find batch that includes the student and is tied to the exam's course
    const batch = await Batch.findOne({
      course: exam.course,
      students: studentId,
    });

    if (!batch) {
      res.status(404).json({ error: "Batch not found for student in this course" });
      return;
    }

    // Find a TA responsible for this course + batch
    const ta = await User.findOne({
      role: "ta",
      enrolledCourses: exam.course,
      _id: { $in: batch.students },
    });

    if (!ta) {
      res.status(404).json({ error: "No TA found for this course and batch" });
      return;
    }

    const newTicket = new Ticket({
      student: studentId,
      evaluator: evaluatorId,
      ta: ta._id,
      exam: examId,
      message,
    });

    await newTicket.save();

    res.status(201).json({ message: "Ticket raised successfully", ticketId: newTicket._id });
  } catch (err) {
    console.error("Error in raiseTicket:", err);
    next(err);
  }
};
