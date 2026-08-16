import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import layoutRoutes from './routes/layoutRoutes';
import aiRoutes from './routes/aiRoutes';
import analysisRoutes from './routes/analysisRoutes';
import authRoutes from './routes/authRoutes';
import projectRoutes from './routes/projectRoutes';
import optimizationRoutes from './routes/optimizationRoutes';
import constructionRoutes from './routes/constructionRoutes';
import analyticsRoutes from './routes/analyticsRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dreamnest';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/layout', layoutRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/optimization', optimizationRoutes);
app.use('/api/construction', constructionRoutes);
app.use('/api/analytics', analyticsRoutes);


// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Nivasa AI backend is running' });
});

// Start the server regardless of DB connection (Phase 1 doesn't strictly need DB yet)
app.listen(Number(PORT), '0.0.0.0', () => {
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
