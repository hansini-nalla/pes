import mongoose, { Document, Schema } from 'mongoose';

export interface ITeacherTicket extends Document {
  subject: string;
  description: string;
  student: mongoose.Types.ObjectId;
  ta?: mongoose.Types.ObjectId;
  evaluationId?: mongoose.Types.ObjectId;
  resolved: boolean;
  createdAt: Date;
}

const teacherTicketSchema = new Schema<ITeacherTicket>(
  {
    subject: { type: String, required: true },
    description: { type: String, required: true },
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },      
    ta: { type: Schema.Types.ObjectId, ref: 'User' },                         
    evaluationId: { type: Schema.Types.ObjectId, ref: 'Evaluation' },       
    resolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const TeacherTicket = mongoose.model<ITeacherTicket>('TeacherTicket', teacherTicketSchema);
