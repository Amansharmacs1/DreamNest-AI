import { Router } from 'express';
import { improveDesign } from '../controllers/analysisController';

const router = Router();

router.post('/improve', improveDesign);

export default router;
