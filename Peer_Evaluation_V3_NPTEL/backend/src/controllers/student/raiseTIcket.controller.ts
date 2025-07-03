import { Request, Response, NextFunction } from "express";
import { Exam } from "../../models/Exam.ts";
import { Batch } from "../../models/Batch.ts";
import { Ticket } from "../../models/Ticket.ts";

export const raiseTicket = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log("HIT /raise-ticket controller");

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

    const batch = await Batch.findOne({
      course: exam.course,
      students: studentId,
    });

    if (!batch) {
      res.status(404).json({ error: "Batch not found for student in this course" });
      return;
    }

    const taId = batch.ta?.[0];
    if (!taId) {
      res.status(404).json({ error: "No TA assigned to this batch" });
      return;
    }

    const newTicket = new Ticket({
      student: studentId,
      evaluator: evaluatorId,
      ta: taId,
      exam: examId,
      message,
    });

    await newTicket.save();

    res.status(201).json({ message: "Ticket raised successfully", ticketId: newTicket._id });
  } catch (err: any) {
    console.error("Error in raiseTicket:", err.message || err);
    res.status(500).json({ error: "Something went wrong while raising the ticket." });
  }
};
