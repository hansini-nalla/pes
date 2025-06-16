import express from 'express';
import { RequestHandler } from 'express';
import { authMiddleware } from "../../middlewares/authMiddleware.js";      
import { authorizeRoles } from "../../middlewares/authorizeRoles.js";
import {
  createTeacher,
  getAllTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
} from '../../controllers/admin/teacher.controller.ts';

const router = express.Router();

router.post('/',authMiddleware,
  authorizeRoles("admin"), createTeacher);
router.get('/',authMiddleware,
  authorizeRoles("admin"), getAllTeachers);
router.get('/:id',authMiddleware,
  authorizeRoles("admin"), getTeacherById as RequestHandler);
router.put('/:id',authMiddleware,
  authorizeRoles("admin"), updateTeacher as RequestHandler);
router.delete('/:id',authMiddleware,
  authorizeRoles("admin"), deleteTeacher as RequestHandler);

export default router;
