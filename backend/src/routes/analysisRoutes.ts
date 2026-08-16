import { Router } from 'express';
import { improveDesign, generateAnalysis } from '../controllers/analysisController';

const router = Router();

router.post('/improve', improveDesign);
router.post('/generate', generateAnalysis);

export default router;
