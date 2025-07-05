import { Request, Response } from 'express';
import { TeacherTicket } from '../../models/TeacherTicket.ts';
import { Exam } from '../../models/Exam.ts';
import { Batch } from '../../models/Batch.ts';
import { Evaluation } from '../../models/Evaluation.ts';
import catchAsync from '../../utils/catchAsync.ts';

export const getAllEscalatedTickets = catchAsync(async (req: Request, res: Response) => {
  const teacherId = (req as any).user.id;
  
  // Find all batches where the current teacher is the instructor
  const batches = await Batch.find({ instructor: teacherId });
  const batchIds = batches.map(batch => batch._id);
  
  // Find all exams for these batches
  const exams = await Exam.find({ batch: { $in: batchIds } });
  const examIds = exams.map(exam => exam._id);
  
  // Find evaluations related to these exams
  const evaluations = await Evaluation.find({ exam: { $in: examIds } });
  const evaluationIds = evaluations.map(evaluation => evaluation._id);
  
  // Find teacher tickets related to these evaluations
  const tickets = await TeacherTicket.find({ 
    resolved: false,
    evaluationId: { $in: evaluationIds }
  })
  .populate('student')
  .populate('ta')
  .populate({
    path: 'evaluationId',
    populate: {
      path: 'exam',
      populate: {
        path: 'batch',
        select: 'name instructor'
      }
    }
  });
  
  res.status(200).json({ success: true, data: tickets });
});

export const resolveTicket = catchAsync(async (req: Request, res: Response) => {
  const { ticketId } = req.params;
  const teacherId = (req as any).user.id;

  // Find the ticket and verify it belongs to this teacher
  const ticket = await TeacherTicket.findById(ticketId).populate({
    path: 'evaluationId',
    populate: {
      path: 'exam',
      populate: {
        path: 'batch',
        select: 'instructor'
      }
    }
  });
  
  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Ticket not found' });
  }
  
  // Verify the teacher is the instructor of the batch for this ticket
  const evaluation = ticket.evaluationId as any;
  if (!evaluation || !evaluation.exam || !evaluation.exam.batch || evaluation.exam.batch.instructor.toString() !== teacherId) {
    return res.status(403).json({ success: false, message: 'Not authorized to resolve this ticket' });
  }

  ticket.resolved = true;
  await ticket.save();

  res.status(200).json({ success: true, message: 'Ticket resolved successfully' });
});