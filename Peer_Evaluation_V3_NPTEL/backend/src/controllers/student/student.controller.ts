import { Request, Response } from 'express';



interface AuthRequest extends Request {
  user?: any; 
}

export const getStudentProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = req.user;

    if (!student) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    res.json({
      id: student._id,
      name: student.name,
      email: student.email,
      role: "student",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
