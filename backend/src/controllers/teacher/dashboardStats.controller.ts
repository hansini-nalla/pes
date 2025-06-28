import { Request, Response } from "express";
import { User } from "../../models/User.ts";
import { Batch } from "../../models/Batch.ts";
import { Exam } from "../../models/Exam.ts";
import { Course } from "../../models/Course.ts";
import AuthenticatedRequest from "../../middlewares/authMiddleware.ts";

interface DashboardStats {
  isTeacher: boolean;
  coursesCount: number;
  batchesCount: number;
  activeExamsCount: number;
  courses: Array<{
    courseId: string;
    courseName: string;
    batchesCount: number;
    activeExamsCount: number;
  }>;
}

export const getTeacherDashboardStats = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const user = req.user;
    if (!user || user.role !== "teacher") {
      res.status(403).json({ message: "Access denied: Teacher only." });
      return;
    }

    const batches = await Batch.find({ instructor: user._id }).lean();
    const courseIds = [...new Set(batches.map((b) => b.course.toString()))];
    const courses = await Course.find({ _id: { $in: courseIds } })
      .select("_id name")
      .lean();

    const courseNameMap = new Map<string, string>();
    courses.forEach((course) => {
      courseNameMap.set(course._id.toString(), course.name);
    });

    const courseMap = new Map<
      string,
      {
        courseId: string;
        courseName: string;
        batchesCount: number;
      }
    >();

    batches.forEach((batch) => {
      const courseId = batch.course.toString();
      const courseName = courseNameMap.get(courseId) || "Unknown Course";

      if (!courseMap.has(courseId)) {
        courseMap.set(courseId, {
          courseId,
          courseName,
          batchesCount: 0,
        });
      }
      const courseData = courseMap.get(courseId);
      if (courseData) {
        courseData.batchesCount += 1;
      }
    });

    const now = new Date();
    const coursesWithStats = await Promise.all(
      Array.from(courseMap.values()).map(async (course) => {
        const courseBatches = batches.filter(
          (b) => b.course.toString() === course.courseId
        );
        const batchIds = courseBatches.map((b) => b._id);

        const activeExamsCount = await Exam.countDocuments({
          batch: { $in: batchIds },
          createdBy: user._id,
          endTime: { $gt: now },
        });

        return {
          ...course,
          activeExamsCount,
        };
      })
    );

    const stats: DashboardStats = {
      isTeacher: true,
      coursesCount: courseMap.size,
      batchesCount: batches.length,
      activeExamsCount: coursesWithStats.reduce(
        (sum, course) => sum + course.activeExamsCount,
        0
      ),
      courses: coursesWithStats,
    };

    res.json(stats);
  } catch (err) {
    console.error("Error fetching teacher dashboard stats:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
