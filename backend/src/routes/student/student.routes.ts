import { Router } from "express";
import multer from "multer";
import { getStudentDashboard } from "../../controllers/student/student.controller.ts";
import { getStudentExams } from "../../controllers/student/exam.controller.ts";
import { submitEvaluation } from "../../controllers/student/submitEvaluation.controller.ts";
import { getPendingEvaluations } from "../../controllers/student/getPendingEvaluations.controller.ts";
import { getEvaluationResults } from "../../controllers/student/getEvaluationResults.controller.ts";
import { submitAnswer } from "../../controllers/student/submitAnswer.controller.ts";
import { getSubmissions } from "../../controllers/student/getSubmissions.controller.ts";

const router = Router();
const upload = multer();

router.get("/dashboard", getStudentDashboard);
router.get("/exams", getStudentExams);
router.post("/evaluate", submitEvaluation);
router.get("/pending-evaluations", getPendingEvaluations);
router.get("/results", getEvaluationResults);
router.post("/submit-answer", upload.single("pdf"), submitAnswer);
router.get("/submissions", getSubmissions);

export default router;
