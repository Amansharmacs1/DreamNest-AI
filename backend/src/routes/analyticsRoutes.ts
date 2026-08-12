import express from 'express';
import { incrementVisitorCount, getVisitorCount } from '../controllers/analyticsController';

const router = express.Router();

router.get('/visitor', getVisitorCount);
router.post('/visitor/increment', incrementVisitorCount);

export default router;
