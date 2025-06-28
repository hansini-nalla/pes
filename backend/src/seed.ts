// seed.ts
import mongoose from 'mongoose';
import { User } from './models/User.ts';
import { Course } from './models/Course.ts';
import { Batch } from './models/Batch.ts';
import { Exam } from './models/Exam.ts';
import { Submission } from './models/Submission.ts';

const MONGO_URI = 'mongodb+srv://pes_user:pES2179ProJEct@cluster0.5qoh2wk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clean slate
    await Promise.all([
      User.deleteMany({}),
      Course.deleteMany({}),
      Batch.deleteMany({}),
      Exam.deleteMany({}),
      Submission.deleteMany({})
    ]);
    console.log('🧹 Collections cleared');

    // Teacher
    const teacher = await User.create({
      _id: new mongoose.Types.ObjectId('666300f1bdb1f2a9cf00d111'),
      name: 'Dr. Kavita Sharma',
      email: 'kavita.clean@iitropar.ac.in',
      password: 'hashed-password',
      role: 'teacher',
    });

    // Course
    const course = await Course.create({
      _id: new mongoose.Types.ObjectId('66630111bdb1f2a9cf00d222'),
      name: 'Advanced Algorithms',
      code: 'CS999',
      startDate: new Date('2024-08-20'),
      endDate: new Date('2024-12-30'),
    });

    // 10 Students
    const studentIds = Array.from({ length: 10 }).map(
      (_, i) => new mongoose.Types.ObjectId(`66630190bdb1f2a9cf00d${300 + i}`)
    );

    await User.insertMany(
      studentIds.map((id, i) => ({
        _id: id,
        name: `User ${i + 1}`,
        email: `cleanuser${i + 1}@mail.com`,
        password: 'hashed-password',
        role: 'student',
      }))
    );

    // Batch
    const batch = await Batch.create({
      _id: new mongoose.Types.ObjectId('66630200bdb1f2a9cf00d333'),
      name: 'Batch Z',
      course: course._id,
      instructor: teacher._id,
      students: studentIds,
    });

    // Exam
    const exam = await Exam.create({
      _id: new mongoose.Types.ObjectId('66630250bdb1f2a9cf00d444'),
      title: 'Final Assessment',
      course: course._id,
      batch: batch._id,
      startTime: new Date('2025-06-25T12:00:00Z'),
      endTime: new Date('2025-06-27T14:00:00Z'),
      k: 2,
      numQuestions: 2,
      createdBy: teacher._id,
      questions: [
        { questionText: 'Define NP-Complete with example.', maxMarks: 10 },
        { questionText: 'Explain Dynamic Programming with a use-case.', maxMarks: 10 },
      ],
    });

    // Submissions
    await Submission.insertMany(
      studentIds.map((studentId, idx) => ({
        student: studentId,
        exam: exam._id,
        batch: batch._id,
        course: course._id,
        answerPdf: `https://dummy.exam/subs/clean${idx + 1}.pdf`,
        answerPdfMimeType: 'application/pdf',
        submittedAt: new Date('2025-06-26T13:00:00Z'),
      }))
    );

    console.log('✅ Seeding complete and clean');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
};

seed();
