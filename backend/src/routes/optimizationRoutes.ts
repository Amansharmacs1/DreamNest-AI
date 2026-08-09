import express from 'express';
import { optimizeDesignStream } from '../controllers/optimizationController';

const router = express.Router();

router.post('/optimize', optimizeDesignStream);

export default router;
