import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    default: 'Untitled Project',
  },
  plotDimensions: { type: mongoose.Schema.Types.Mixed },
  usableArea: { type: mongoose.Schema.Types.Mixed },
  preferences: { type: mongoose.Schema.Types.Mixed },
  rooms: { type: mongoose.Schema.Types.Mixed },
  thumbnail: {
    type: String,
    default: '',
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  shareToken: {
    type: String,
    unique: true,
    sparse: true,
  },
  analysis: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

export const Project = mongoose.model('Project', projectSchema);
