import { Request, Response, NextFunction } from 'express';
import { Evaluation } from '../../models/Evaluation.ts';
import { Exam } from '../../models/Exam.ts';
import { Batch } from '../../models/Batch.ts';
import { User } from '../../models/User.ts';

export const getPendingEvaluations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const studentId = (req as any).user.id;

    const pendingEvals = await Evaluation.find({
      evaluator: studentId,
      status: 'pending',
    })
      .populate('evaluatee', 'name email')
      .populate('exam', 'title');

    res.json({ evaluations: pendingEvals });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
