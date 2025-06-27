console.log("✅ teacher.routes.ts loaded");

import { Router } from "express";
import { getTeacherCourses } from "../../controllers/teacher/getTeacherCourses.controller.ts";
import { authMiddleware } from "../../middlewares/authMiddleware.ts";
import { getTeacherDashboardStats } from '../../controllers/teacher/dashboardStats.controller.ts';
import { getBatchStudents } from "../../controllers/teacher/getBatchStudents.controller.ts";

const router = Router();
router.get("/courses", authMiddleware, getTeacherCourses);
router.get("/test", (req, res) => {
  console.log("/api/teacher/test HIT");
  res.send("Hello from teacher route");
});
router.get('/dashboard-stats', authMiddleware, getTeacherDashboardStats);
router.get("/batch/:batchId/students", authMiddleware, getBatchStudents);

export default router;
