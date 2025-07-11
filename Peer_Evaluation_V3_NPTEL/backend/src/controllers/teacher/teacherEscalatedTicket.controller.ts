import { Request, Response } from 'express';
import { TeacherTicket } from '../../models/TeacherTicket.ts';
import catchAsync from '../../utils/catchAsync.ts';
import { sendTicketResolvedEmail } from '../../utils/email.ts';
import mongoose from 'mongoose';

export const getAllEscalatedTickets = catchAsync(async (req: Request, res: Response) => {
  const tickets = await TeacherTicket.find({ resolved: false })
    .populate('student')
    .populate('ta');

  res.status(200).json({ success: true, data: tickets });
});

export const resolveTicket = catchAsync(async (req: Request, res: Response) => {
  const { ticketId } = req.params;
  const { remark, marksUpdated } = req.body;

  const ticket = await TeacherTicket.findById(ticketId).populate('student');
  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Ticket not found' });
  }

  ticket.resolved = true;
  ticket.remark = remark;
  ticket.resolvedAt = new Date();
  ticket.marksUpdated = marksUpdated ?? null;
  await ticket.save();

  const student = ticket.student as any;

  if (student?.email) {
    await sendTicketResolvedEmail(
      student.email,
      student.name || 'Student',
      ticket.subject,
      ticket.description,
      remark,
      (ticket._id as mongoose.Types.ObjectId).toString(),
      ticket.marksUpdated // ✅ send marks in email
    );
  }

  res.status(200).json({ success: true, message: 'Ticket resolved and email sent successfully' });
});

export const getResolvedTickets = catchAsync(async (req: Request, res: Response) => {
  const tickets = await TeacherTicket.find({ resolved: true })
    .populate('student')
    .populate('ta')
    .sort({ resolvedAt: -1 });

  res.status(200).json({ success: true, data: tickets });
});
