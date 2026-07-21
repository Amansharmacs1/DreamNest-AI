import mongoose, { Schema, Document } from 'mongoose';

export interface ILayout extends Document {
  plotDimensions: { width: number; length: number; unit: string };
  usableArea: { width: number; length: number; startX: number; startY: number };
  rooms: Array<{
    id: string;
    name: string;
    category: string;
    x: number;
    y: number;
    width: number;
    length: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const LayoutSchema: Schema = new Schema({
  plotDimensions: {
    width: { type: Number, required: true },
    length: { type: Number, required: true },
    unit: { type: String, required: true }
  },
  usableArea: {
    width: { type: Number, required: true },
    length: { type: Number, required: true },
    startX: { type: Number, required: true },
    startY: { type: Number, required: true }
  },
  rooms: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    length: { type: Number, required: true }
  }]
}, { timestamps: true });

export default mongoose.model<ILayout>('Layout', LayoutSchema);
