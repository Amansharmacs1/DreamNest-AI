import express from 'express';
import { generateConstructionData } from '../controllers/constructionController';

const router = express.Router();

router.post('/generate', generateConstructionData);

export default router;
