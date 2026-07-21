import { Router } from 'express';
import { generateLayout } from '../controllers/layoutController';

const router = Router();

router.post('/generate', generateLayout);

export default router;
