import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: false,
  },
  preferences: {
    theme: { type: String, default: 'system' },
    units: { type: String, default: 'Feet' },
  },
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
