import { Router } from 'express';
import catchAsync from '../../utils/catchAsync.ts';
import { authMiddleware } from "../../middlewares/authMiddleware.js";      
import { authorizeRoles } from "../../middlewares/authorizeRoles.js";     

import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from '../../controllers/admin/student.controller.ts';


const router = Router();

router.get('/', authMiddleware,
  authorizeRoles("admin"), catchAsync(getAllStudents));
router.get('/:id', authMiddleware,
  authorizeRoles("admin"), catchAsync(getStudentById));
router.post('/',  authMiddleware,
  authorizeRoles("admin"),catchAsync(createStudent));
router.put('/:id',  authMiddleware,
  authorizeRoles("admin"),catchAsync(updateStudent));
router.delete('/:id',  authMiddleware,
  authorizeRoles("admin"),catchAsync(deleteStudent));

export default router;
