import { Router } from "express";
import multer from "multer";
import { getAllEscalatedTickets, resolveTicket } from "../../controllers/teacher/teacherEscalatedTicket.controller.ts";

import { authMiddleware } from "../../middlewares/authMiddleware.ts";
import { getTeacherCourses } from "../../controllers/teacher/getTeacherCourses.controller.ts";
import { getExamsByCourse } from "../../controllers/teacher/getExamsByCourse.controller.ts";
import { getTeacherDashboardStats } from "../../controllers/teacher/dashboardStats.controller.ts";
import {
  createExam,
  getSingleExam,
  updateExam,
  deleteExam,
  getExamSubmissions,
  uploadAnswerKey
} from "../../controllers/teacher/exam.controller.ts";
import { getBatchStudents } from "../../controllers/teacher/getBatchStudents.controller.ts";
import { initiatePeerEvaluation } from "../../controllers/teacher/peerEvaluation.controller.ts";
import { assignTaToBatch } from "../../controllers/teacher/assignTaToBatch.controller.ts";
import { getAllStudents } from "../../controllers/teacher/getAllStudents.controller.ts";
import { enrollStudents } from '../../controllers/teacher/teacherEnroll.controller.ts';
import { getBatchStudents2 } from '../../controllers/teacher/teacherEnroll.controller.ts';
import { getBatchTA } from "../../controllers/teacher/getBatchTA.controller.ts";


const router = Router();
const upload = multer();
// Courses
router.get("/courses", authMiddleware, getTeacherCourses);
router.get("/courses/:courseId/exams", authMiddleware, getExamsByCourse);

// Dashboard Stats
router.get("/dashboard-stats", authMiddleware, getTeacherDashboardStats);

// Exam CRUD + Submissions
router.post("/exams", authMiddleware, createExam);
router.get("/exams/:examId", authMiddleware, getSingleExam);
router.put("/exams/:examId", authMiddleware, updateExam);
router.delete("/exams/:examId", authMiddleware, deleteExam);
router.get("/exams/:examId/submissions", authMiddleware, getExamSubmissions);
router.get("/test", (req, res) => {
  console.log("/api/teacher/test HIT");
  res.send("Hello from teacher route");
});
router.post("/:examId/answer-key", authMiddleware, upload.single("answerKeyPdf"), uploadAnswerKey);

router.get("/batch/:batchId/students", authMiddleware, getBatchStudents);
router.post("/initiate-evaluation", authMiddleware, initiatePeerEvaluation);

router.post('/batch/:batchId/assign-ta',authMiddleware,assignTaToBatch);
router.get("/students", authMiddleware, getAllStudents);
router.post('/enroll', authMiddleware, enrollStudents);
router.get('/batch/:batchId/students', authMiddleware, getBatchStudents2);
router.get("/batch/:batchId/ta", authMiddleware, getBatchTA);

//Escalated Tickets
router.get("/escalated-tickets", authMiddleware, getAllEscalatedTickets);
router.put("/resolve-ticket/:ticketId", authMiddleware, resolveTicket);
export default router;