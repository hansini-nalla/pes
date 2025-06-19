import { Router, Request, Response } from 'express';
import { authMiddleware } from '../../middlewares/authMiddleware.ts';
import { User } from '../../models/User.ts';
import { Course } from '../../models/Course.ts';
import { Batch } from '../../models/Batch.ts';
import { Exam } from '../../models/Exam.ts';
import mongoose from 'mongoose';

const router = Router();

router.post('/update-role', async (req: Request, res: Response) => {
  const { email, role } = req.body;

  if (!email || !role) {
    res.status(400).json({ error: 'Email and role are required' });
    return;
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    user.role = role;
    await user.save();

    res.json({ message: `Role updated to '${role}' for ${email}` });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await User.find({ role: { $in: ['student', 'ta'] } }).select('name email role');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/teacher-courses', authMiddleware, async (req: any, res: Response) => {
  try {
    const teacherId = req.user?._id;

    const teacher = await User.findById(teacherId).select('enrolledCourses');
    if (!teacher || !teacher.enrolledCourses || teacher.enrolledCourses.length === 0) {
      res.json([]);
      return;
    }

    const courses = await Course.find({ _id: { $in: teacher.enrolledCourses } });

    const courseBatchList = await Promise.all(
      courses.map(async (course) => {
        const batch = await Batch.findOne({ course: course._id });

        return {
          courseId: course._id,
          courseName: `${course.name} (${course.code})`,
          batchId: batch?._id,
          batchName: batch?.name || 'N/A',
        };
      })
    );

    res.json(courseBatchList);
  } catch (error) {
    console.error('Error fetching teacher courses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/schedule-exam', authMiddleware, async (req: any, res: Response) => {
  const { courseId, batchId, title, startTime, endTime, numQuestions } = req.body;

  if (!courseId || !batchId || !title || !startTime || !endTime || !numQuestions) {
    res.status(400).json({ error: 'All fields are required' });
    return;
  }

  try {
    const exam = await Exam.create({
            course: courseId,
            batch: batchId,
            title,
            startTime,
            endTime,
            numQuestions,
            createdBy: req.user._id,
          }); 

    res.status(201).json({ message: 'Exam scheduled', exam });
  } catch (err) {
    console.error('Exam creation error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/exams', authMiddleware, async (req: any, res: Response) => {
  console.log('🧠 Logged in teacher ID:', req.user._id);
  try {
    const teacherId = new mongoose.Types.ObjectId(req.user._id);
    const exams = await Exam.find({ createdBy: teacherId })
      .populate('course', 'name code') 
      .populate('batch', 'name');     
      console.log('📦 Exams found:', exams.length); 

    const examList = exams.map((exam) => {
      const course = exam.course as any;
      const batch = exam.batch as any;

      return {
        title: exam.title,
        course: `${course.name} (${course.code})`,
        batch: batch.name,
        startTime : exam.startTime.toLocaleString([], {year: 'numeric',month: '2-digit',day: '2-digit',hour: '2-digit',minute: '2-digit',}),
        endTime: new Date(exam.endTime).toLocaleString([], {year: 'numeric',month: '2-digit',day: '2-digit',hour: '2-digit',minute: '2-digit',}),
        numQuestions: exam.numQuestions,
      };
    });

    res.json(examList);
  } catch (err) {
    console.error('Exam fetch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


export default router;
