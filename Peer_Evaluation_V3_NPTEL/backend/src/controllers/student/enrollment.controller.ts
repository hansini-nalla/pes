import { Response, NextFunction } from "express";
import Enrollment from "../../models/Enrollment.ts";
import AuthenticatedRequest from "../../middlewares/authMiddleware.ts";

export const createEnrollment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const studentId = req.user?._id;
    const { courseId, batchId, notes } = req.body;

    if (!studentId || !courseId || !batchId) {
      res
        .status(400)
        .json({ message: "studentId, courseId, and batchId are required." });
      return;
    }

    const existing = await Enrollment.findOne({
      studentId,
      courseId,
      batchId,
      status: "pending",
    });
    if (existing) {
      res
        .status(400)
        .json({ message: "Enrollment request already exists and is pending." });
      return;
    }

    const enrollment = new Enrollment({
      studentId,
      courseId,
      batchId,
      notes,
    });
    await enrollment.save();
    res
      .status(201)
      .json({ message: "Enrollment request submitted.", enrollment });
  } catch (error) {
    next(error);
  }
};

export const getStudentEnrollments = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const studentId = req.user?._id;
    if (!studentId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const enrollments = await Enrollment.find({ studentId })
      .populate("courseId")
      .populate("batchId")
      .sort({ createdAt: -1 });
    res.status(200).json(enrollments);
  } catch (error) {
    next(error);
  }
};