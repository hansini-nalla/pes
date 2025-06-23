import express from "express";

import {
  addCourse,
  //updateCourse,
  deleteCourse,
  getAllCourses,
  //getCourseById,
  getAllBatches,
  //getBatchById,
  createBatch,
  //updateBatch,
  deleteBatch,
  //Update the role
  updateStudentTaRole,
} from "../../controllers/admin/course.controller.ts";

import { authMiddleware } from "../../middlewares/authMiddleware.ts";      
import { authorizeRoles } from "../../middlewares/authorizeRoles.ts";      

const router = express.Router();


//kept few middleware in comments for testing purpose

//Course operations
router.post("/courses",authMiddleware,authorizeRoles("admin"),addCourse);
//router.put("/courses/:courseId",authMiddleware,authorizeRoles("admin"),updateCourse);
router.delete("/courses/code/:code",authMiddleware,authorizeRoles("admin"),deleteCourse);
router.get('/courses/',authMiddleware,authorizeRoles("admin"), getAllCourses);
//router.get('/courses/:id',authMiddleware,authorizeRoles("admin"), getCourseById);

//Batch operations
router.post("/batches",authMiddleware,authorizeRoles("admin"),createBatch);
//router.put("/batches/:batchId",authMiddleware,authorizeRoles("admin"),updateBatch);
router.delete("/batches/:id",authMiddleware,authorizeRoles("admin"),deleteBatch);
router.get('/batches/',authMiddleware,authorizeRoles("admin"), getAllBatches);
//router.get('/batches/:id',authMiddleware,authorizeRoles("admin"), getBatchById);
router.post('/update-student-ta-role', updateStudentTaRole);

export default router;
