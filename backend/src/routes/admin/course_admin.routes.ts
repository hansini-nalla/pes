import express from "express";
import { deleteCourseAndBatches } from "../../controllers/admin/course.controller.ts";

const router = express.Router();

router.delete("/:courseId", deleteCourseAndBatches);

export default router;
