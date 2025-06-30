import { Request, Response } from 'express';
import { TeacherTicket } from '../../models/TeacherTicket.ts';
import catchAsync from '../../utils/catchAsync.ts';


export const getAllEscalatedTickets = catchAsync(async (req: Request, res: Response) => {
  const tickets = await TeacherTicket.find({ resolved: false }).populate('student').populate('ta');
  res.status(200).json({ success: true, data: tickets });
});

export const resolveTicket = catchAsync(async (req: Request, res: Response) => {
  const { ticketId } = req.params;

  const ticket = await TeacherTicket.findById(ticketId);
  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Ticket not found' });
  }

  ticket.resolved = true;
  await ticket.save();

  res.status(200).json({ success: true, message: 'Ticket resolved successfully' });
});
