import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import layoutRoutes from './routes/layoutRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dreamnest';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/layout', layoutRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'DreamNest AI backend is running' });
});

// Start the server regardless of DB connection (Phase 1 doesn't strictly need DB yet)
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Database connection (Non-blocking)
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.warn('Warning: Could not connect to MongoDB. Running without database persistence.', error.message);
  });
