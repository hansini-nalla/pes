console.log("✅ teacher.routes.ts loaded");

import { Router } from "express";
import { getTeacherCourses } from "../../controllers/teacher/getTeacherCourses.controller.ts";
import { authMiddleware } from "../../middlewares/authMiddleware.ts";

const router = Router();
router.get("/courses", authMiddleware, getTeacherCourses);
router.get("/test", (req, res) => {
  console.log("/api/teacher/test HIT");
  res.send("Hello from teacher route");
});



export default router;
