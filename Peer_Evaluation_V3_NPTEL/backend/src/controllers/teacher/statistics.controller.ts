import { Request, Response, NextFunction } from "express";
import { Evaluation } from "../../models/Evaluation.ts";
import { Exam } from "../../models/Exam.ts";
import { Statistics } from "../../models/Statistics.ts";
import { Ticket } from "../../models/Ticket.ts";
import { User } from "../../models/User.ts";
import { Batch } from "../../models/Batch.ts";
import AuthenticatedRequest from "../../middlewares/authMiddleware.ts";
import { Types } from "mongoose";

export const generateEvaluationStatistics = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { examId } = req.params;
  const { generateTickets = false } = req.query;

  // 1. Auth: Only teachers allowed
  if (req.user?.role !== "teacher") {
    return res.status(403).json({ error: "Only teachers can perform this action." });
  }

  if (!examId) {
    return res.status(400).json({ error: "Missing examId" });
  }

  try {
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    const k = exam.k;
    const allEvals = await Evaluation.find({ exam: examId, status: "completed" });

    if (allEvals.length === 0) {
      return res.status(404).json({ error: "No completed evaluations found" });
    }

    // Group evaluations by evaluatee
    const studentMap = new Map<string, number[]>(); // studentId -> [totalMarks]

    for (const evaluation of allEvals) {
      const studentId = evaluation.evaluatee.toString();
      if (!studentMap.has(studentId)) {
        studentMap.set(studentId, []);
      }

      const total = evaluation.marks.reduce((a, b) => a + b, 0);
      studentMap.get(studentId)?.push(total);
    }

    let flaggedCount = 0;
    const flaggedStudentIds: string[] = [];
    const statDocs: any[] = [];

    if (k <= 3) {
      // Class SD logic
      const studentAverages = Array.from(studentMap.values())
        .filter(arr => arr.length > 0)
        .map(marksArr => average(marksArr));

      const classAverage = average(studentAverages);
      const sd = standardDeviation(studentAverages, classAverage);

      for (const [studentId, marksArr] of studentMap.entries()) {
        if (marksArr.length === 0) continue;

        const avg = average(marksArr);
        const deviation = Math.abs(avg - classAverage);
        const isFlagged = deviation > sd;

        statDocs.push({
          updateOne: {
            filter: { exam: examId, student: studentId },
            update: {
              exam: examId,
              student: studentId,
              average: avg,
              standardDeviation: sd,
              classAverage,
              k,
              wasFlagged: isFlagged,
              individualMarks: marksArr,
            },
            upsert: true,
          },
        });

        if (isFlagged) {
          flaggedCount++;
          flaggedStudentIds.push(studentId);
        }
      }
    } else {
      // Per-student SD logic
      for (const [studentId, marksArr] of studentMap.entries()) {
        if (marksArr.length < k) continue; // skip incomplete evaluations

        const avg = average(marksArr);
        const sd = standardDeviation(marksArr, avg);
        const isWithin = marksArr.every(mark => Math.abs(mark - avg) <= sd);
        const isFlagged = !isWithin;

        statDocs.push({
          updateOne: {
            filter: { exam: examId, student: studentId },
            update: {
              exam: examId,
              student: studentId,
              average: avg,
              standardDeviation: sd,
              k,
              wasFlagged: isFlagged,
              individualMarks: marksArr,
            },
            upsert: true,
          },
        });

        if (isFlagged) {
          flaggedCount++;
          flaggedStudentIds.push(studentId);
        }
      }
    }

    if (statDocs.length > 0) {
      await Statistics.bulkWrite(statDocs);
    }

    // Optional: Auto-create tickets for flagged students
    if (generateTickets === "true") {
      for (const studentId of flaggedStudentIds) {
        const existingTicket = await Ticket.findOne({
          student: studentId,
          exam: examId,
        });
        if (existingTicket) continue;

        const student = await User.findById(studentId);
        let taId = null;
        if (student) {
          const batches = await Batch.find({ students: student._id });
          if (batches.length > 0 && batches[0].ta.length > 0) {
            taId = batches[0].ta[0];
          }
        }

        const ticket = new Ticket({
          student: studentId,
          evaluator: null,
          ta: taId,
          exam: examId,
          message: "Flagged via statistics",
          status: "open",
          escalatedToTeacher: false,
        });
        await ticket.save();
      }
    }

    return res.status(201).json({
      message: "Statistics generated",
      totalStudents: studentMap.size,
      flagged: flaggedCount,
      flaggedStudents: flaggedStudentIds,
    });
  } catch (error) {
    console.error("Error generating statistics:", error);
    next(error);
  }
};

// Helpers
function average(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function standardDeviation(arr: number[], mean: number): number {
  if (arr.length === 0) return 0;
  const variance = arr.reduce((acc, val) => acc + (val - mean) ** 2, 0) / arr.length;
  return Math.sqrt(variance);
}
