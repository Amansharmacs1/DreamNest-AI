import { Request, Response } from 'express';
import { generateMeasurements } from '../construction/MeasurementEngine';
import { generateCostEstimate } from '../construction/CostEstimationEngine';
import { analyzeConstructionBudget } from '../construction/geminiConstructionService';

export const generateConstructionData = async (req: Request, res: Response) => {
  try {
    const { layout, budget } = req.body;

    if (!layout) {
      return res.status(400).json({ error: 'Layout is required' });
    }

    const measurements = generateMeasurements(layout);
    const estimate = generateCostEstimate(measurements);
    
    // We can run the AI analysis asynchronously or wait for it.
    // For a faster response, we might just return the deterministic data first, 
    // and have a separate endpoint for the AI analysis. Let's do it in one shot for now, or catch errors if it fails.
    let aiAnalysis = null;
    try {
      aiAnalysis = await analyzeConstructionBudget(layout, measurements, estimate, budget);
    } catch (e) {
      console.warn('AI Analysis for construction failed, returning deterministic data only.', e);
    }

    res.json({
      measurements,
      estimate,
      aiAnalysis
    });
  } catch (error) {
    console.error('Construction data generation error:', error);
    res.status(500).json({ error: 'Failed to generate construction data' });
  }
};
