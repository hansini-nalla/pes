import { Request, Response, NextFunction } from "express";
import { Evaluation } from "../../models/Evaluation.ts";
import { Ticket } from "../../models/Ticket.ts";
import { Batch } from "../../models/Batch.ts";
import { User } from "../../models/User.ts";
import AuthenticatedRequest from "../../middlewares/authMiddleware.ts";

export const generateTicketsForPendingEvaluations = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { examId } = req.params;

  if (!examId) {
    res.status(400).json({ error: "Missing examId" });
    return; 
  }

  try {
    const pendingEvaluations = await Evaluation.find({
      exam: examId,
      status: "pending",
    });

    const createdTickets = [];

    for (const evalDoc of pendingEvaluations) {
      const existingTicket = await Ticket.findOne({
        student: evalDoc.evaluatee,
        evaluator: evalDoc.evaluator,
        exam: evalDoc.exam,
      });

      if (existingTicket) continue;

      let taId = null;
      const student = await User.findById(evalDoc.evaluatee);
      if (student) {
        const batches = await Batch.find({ students: student._id });
        if (batches.length > 0 && batches[0].ta.length > 0) {
          taId = batches[0].ta[0];
        }
      }

      const zeroMarks = Array(evalDoc.marks.length).fill(0);
      evalDoc.marks = zeroMarks;
      evalDoc.flagged = true;
      await evalDoc.save();

      // Creating tickets
      const ticket = new Ticket({
        student: evalDoc.evaluatee,
        evaluator: evalDoc.evaluator,
        ta: taId,
        exam: evalDoc.exam,
        message: "unchecked",
        status: "open",
        escalatedToTeacher: false,
      });

      await ticket.save();
      createdTickets.push(ticket);
    }

    if (createdTickets.length === 0) {
      res.status(200).json({
        message: "No pending evaluations found or all already ticketed.",
      });
      return;
    }

    res.status(201).json({
      message: `${createdTickets.length} tickets created for pending evaluations.`,
      tickets: createdTickets.length,
    });
    return;
  } catch (error) {
    console.error("Error generating tickets:", error);
    next(error);
  }
};
