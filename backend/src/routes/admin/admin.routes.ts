import express from "express";

import {
  
  addCourse,
  updateCourse,
  deleteCourse,
  createBatch,
  updateBatch,
  deleteBatch,
} from "../../controllers/admin/course.controller.ts";

import { authMiddleware } from "../../middlewares/authMiddleware.js";      
import { authorizeRoles } from "../../middlewares/authorizeRoles.js";      

const router = express.Router();


//kept few middleware in comments for testing purpose
//Course operations
router.post(
  "/courses",
  //authMiddleware,
  //authorizeRoles("admin"),
  addCourse
);

router.put(
  "/courses/:courseId",
  //authMiddleware,
  //authorizeRoles("admin"),
  updateCourse
);

router.delete(
  "/courses/:courseId",
  authMiddleware,
  authorizeRoles("admin"),
  deleteCourse
);

//Batch operations
router.post(
  "/batches",
  //authMiddleware,
  //authorizeRoles("admin"),
  createBatch
);

router.put(
  "/batches/:batchId",
  authMiddleware,
  authorizeRoles("admin"),
  updateBatch
);

router.delete(
  "/batches/:batchId",
  authMiddleware,
  authorizeRoles("admin"),
  deleteBatch
);

export default router;
