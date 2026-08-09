import { Request, Response } from 'express';
import { runParetoOptimization } from '../optimization/optimizationLoop';
import { OptimizationWeights } from '../optimization/DesignScoringEngine';
import { RoomConstraint } from '../optimization/geminiDesignCriticService';

export const optimizeDesignStream = async (req: Request, res: Response): Promise<void> => {
  // Set headers for Server-Sent Events
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const { layout, weights, constraints, prompt } = req.body;

  if (!layout || !weights) {
    res.write(`data: ${JSON.stringify({ error: 'Missing layout or weights' })}\n\n`);
    res.end();
    return;
  }

  const sendProgress = (message: string) => {
    res.write(`data: ${JSON.stringify({ type: 'progress', message })}\n\n`);
  };

  try {
    const candidates = await runParetoOptimization(
      layout,
      weights as OptimizationWeights,
      (constraints || []) as RoomConstraint[],
      prompt || '',
      sendProgress
    );

    // Send the final result
    res.write(`data: ${JSON.stringify({ type: 'complete', candidates })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error('Optimization error:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
    res.end();
  }
};
