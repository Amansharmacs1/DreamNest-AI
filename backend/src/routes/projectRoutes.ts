import express from 'express';
import { 
  getProjects, 
  createProject, 
  updateProject, 
  getProjectById, 
  deleteProject,
  generateShareLink,
  getSharedProject,
  createPublicShare,
  getPublicShare
} from '../controllers/projectController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.get('/shared/:shareToken', getSharedProject); // Legacy

// Phase 6: Anonymous Public Sharing
router.post('/share/create', createPublicShare);
router.get('/share/:shareId', getPublicShare);

// Protected routes
router.use(authMiddleware);
router.get('/', getProjects);
router.post('/', createProject);
router.get('/:id', getProjectById);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.post('/:id/share', generateShareLink);

export default router;
