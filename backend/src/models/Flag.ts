import { Schema, model, Document, Types } from "mongoose";

export interface IFlag extends Document {
  evaluation: Types.ObjectId;
  flaggedBy: Types.ObjectId;
  resolvedBy?: string;
  resolutionStatus: 'pending' | 'resolved' | 'escalated';
}

const flagSchema = new Schema<IFlag>({
  evaluation: { type: Schema.Types.ObjectId, ref: 'Evaluation', required: true },
  flaggedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  resolutionStatus: {
    type: String,
    enum: ['pending', 'resolved', 'escalated'],
    default: 'pending',
  },
});

export const Flag = model<IFlag>('Flag', flagSchema);
