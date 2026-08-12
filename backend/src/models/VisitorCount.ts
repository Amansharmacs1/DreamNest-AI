import mongoose, { Document, Schema } from 'mongoose';

export interface IVisitorCount extends Document {
  count: number;
}

const VisitorCountSchema = new Schema<IVisitorCount>(
  {
    count: { type: Number, default: 0, required: true },
  },
  { timestamps: true }
);

export const VisitorCount = mongoose.model<IVisitorCount>('VisitorCount', VisitorCountSchema);
