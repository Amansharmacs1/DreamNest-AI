import mongoose from 'mongoose';

const sharedProjectSchema = new mongoose.Schema({
  shareId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    default: 'Untitled Design',
  },
  preferences: { type: mongoose.Schema.Types.Mixed },
  layout: { type: mongoose.Schema.Types.Mixed },
  interior: { type: mongoose.Schema.Types.Mixed },
  analysis: { type: mongoose.Schema.Types.Mixed },
  thumbnail: {
    type: String,
    default: '',
  },
  // To allow creators to delete their shares later if needed
  creatorToken: {
    type: String,
    select: false // Do not expose by default in queries
  }
}, { timestamps: true });

export const SharedProject = mongoose.model('SharedProject', sharedProjectSchema);
