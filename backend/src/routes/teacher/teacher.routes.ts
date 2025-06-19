import { Router, Request, Response } from 'express';
import { authMiddleware } from '../../middlewares/authMiddleware.ts';
import { User } from '../../models/User.ts';
import { Course } from '../../models/Course.ts';
import { Batch } from '../../models/Batch.ts';
import { Exam } from '../../models/Exam.ts';

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

    //console.log('🧠 Logged in teacher ID:', teacherId);

    const teacher = await User.findById(teacherId).select('enrolledCourses');
    if (!teacher || !teacher.enrolledCourses || teacher.enrolledCourses.length === 0) {
      res.json([]);
      return;
    }

    const courses = await Course.find({ _id: { $in: teacher.enrolledCourses } });

    const courseBatchList = await Promise.all(
      courses.map(async (course) => {
        const batch = await Batch.findOne({}).then(b => {
            //console.log('🔍 Scanning batch:', b);
            return Batch.findOne({ course: course._id });
            });
        return {
          course: `${course.name} (${course.code})`,
          batch: batch ? batch.name : 'N/A',
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
  const { courseId, batchId } = req.body;

  if (!courseId || !batchId) {
    res.status(400).json({ error: 'Course and Batch are required' });
    return
  }

  try {
    const exam = await Exam.create({
      course: courseId,
      batch: batchId,
      createdBy: req.user._id,
    });

    res.status(201).json({ message: 'Exam scheduled', exam });
  } catch (err) {
    console.error('Exam creation error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/exams', authMiddleware, async (req: any, res: Response) => {
  try {
    const exams = await Exam.find({ createdBy: req.user._id })
      .populate('course', 'name code')
      .populate('batch', 'name');

    const examList = exams.map((exam) => {
    const course: any = exam.course;
    const batch: any = exam.batch;
    const date = new Date((exam as any).date).toLocaleDateString();

    return {
        course: `${course.name} (${course.code})`,
        batch: batch.name,
        date: date,
        };
    });

    res.json(examList);
  } catch (err) {
    console.error('Exam fetch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
