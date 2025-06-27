import { Request, Response } from "express";
import { User } from "../../models/User.ts";
import { Batch } from "../../models/Batch.ts";
import { Exam } from "../../models/Exam.ts";
import AuthenticatedRequest from "../../middlewares/authMiddleware.ts";

// Returns count of courses, batches, and exams for the teacher dashboard
export const getTeacherDashboardStats = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const user = req.user;
    if (!user || user.role !== "teacher") {
      res.status(403).json({ message: "Access denied: Teacher only." });
    }

    const teacher = await User.findById(user._id).select("enrolledCourses");
    const courseIds = teacher?.enrolledCourses || [];
    const coursesCount = Array.isArray(courseIds) ? courseIds.length : 0;

    const batchesCount = await Batch.countDocuments({ instructor: user._id });
    const examsCount = await Exam.countDocuments({ createdBy: user._id });

    res.json({
      isTeacher: true,
      coursesCount,
      batchesCount,
      examsCount,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};
