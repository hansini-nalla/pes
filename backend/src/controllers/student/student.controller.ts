import { Request, Response, NextFunction } from 'express';

import { RequestHandler } from 'express';
import { User } from '../../models/User.ts';

export const getStudentById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const student = await User.findById(id).select('name email _id'); // assuming User model
    if (!student) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }
    res.json({
      id: student._id,
      name: student.name,
      email: student.email,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
