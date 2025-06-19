// This file defines the Express route for the admin dashboard to fetch counts of teachers, courses, and students.
import { Router, Request, Response } from 'express';
import { User } from '../../models/User.ts';
import { Course } from '../../models/Course.ts';

const router = Router();

router.get('/counts', async (req: Request, res: Response) => {
  try {
    const teachersCount = await User.countDocuments({ role: 'teacher' });
    const coursesCount = await Course.countDocuments();
    const studentsCount = await User.countDocuments({ role: 'student' });

    res.json({
      teachers: teachersCount,
      courses: coursesCount,
      students: studentsCount,
    });
  } catch (error) {
    console.error('Error fetching dashboard counts:', error);
    res.status(500).json({ error: 'Failed to fetch counts' });
  }
});

export default router;
