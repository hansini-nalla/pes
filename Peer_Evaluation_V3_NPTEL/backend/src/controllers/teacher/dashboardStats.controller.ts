import { Response } from "express";
import { Batch } from "../../models/Batch.ts";
import { Exam } from "../../models/Exam.ts";
import AuthenticatedRequest from "../../middlewares/authMiddleware.ts";

export const getTeacherDashboardStats = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    if (!user || user.role !== "teacher") {
      res.status(403).json({ message: "Access denied: Teacher only." });
      return;
    }

    // 🔍 Find all batches where the user is instructor
    const batches = await Batch.find({ instructor: user._id }).select("course");

    // 🧠 Create a set of unique course IDs
    const courseSet = new Set<string>();
    batches.forEach((batch) => {
      if (batch.course) courseSet.add(batch.course.toString());
    });

    const coursesCount = courseSet.size;
    const batchesCount = batches.length;
    const examsCount = await Exam.countDocuments({ createdBy: user._id });

    res.json({
      isTeacher: true,
      coursesCount,
      batchesCount,
      examsCount,
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
