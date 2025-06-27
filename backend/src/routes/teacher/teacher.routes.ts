console.log("✅ teacher.routes.ts loaded");

import { Router } from "express";
import { getTeacherCourses } from "../../controllers/teacher/getTeacherCourses.controller.ts";
import { authMiddleware } from "../../middlewares/authMiddleware.ts";
import { getExamsByCourse } from "../../controllers/teacher/getExamsByCourse.controller.ts";

const router = Router();
router.get("/courses", authMiddleware, getTeacherCourses);
router.get("/courses/:courseId/exams", authMiddleware, getExamsByCourse);



export default router;
