import express from 'express';
import { 
  getProjects, 
  createProject, 
  updateProject, 
  getProjectById, 
  deleteProject,
  generateShareLink,
  getSharedProject
} from '../controllers/projectController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.get('/shared/:shareToken', getSharedProject);

// Protected routes
router.use(authMiddleware);
router.get('/', getProjects);
router.post('/', createProject);
router.get('/:id', getProjectById);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.post('/:id/share', generateShareLink);

export default router;
