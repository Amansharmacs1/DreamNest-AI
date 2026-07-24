import express from 'express';
import { aiChat, analyzeLayout, generateCostEstimate, parseRequirements } from '../controllers/aiController';

const router = express.Router();

router.post('/chat', aiChat);
router.post('/analyze', analyzeLayout);
router.post('/cost', generateCostEstimate);
router.post('/parse-requirements', parseRequirements);

export default router;
