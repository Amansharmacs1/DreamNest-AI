import { Request, Response } from 'express';
import { runDeterministicAnalysis } from '../algorithms/homeAnalysisEngine';
import { explainAnalysisResult } from '../services/geminiAnalysisService';
import { GeneratedLayout } from '../shared/types';

// Backward compatibility for existing improve mock
export const improveDesign = async (req: Request, res: Response) => {
  res.json({ success: true, message: "Use /api/analysis/generate for full environmental analysis." });
};

export const generateAnalysis = async (req: Request, res: Response) => {
  try {
    const layout = req.body as GeneratedLayout;
    
    if (!layout || !layout.rooms || !layout.plotDimensions) {
      return res.status(400).json({ error: 'Invalid layout provided for analysis.' });
    }

    // Step 1: Run deterministic geometry/spatial analysis locally
    const deterministicResult = runDeterministicAnalysis(layout);

    // Step 2: Use Gemini to explain the results in human-readable terms
    const finalResult = await explainAnalysisResult(deterministicResult);

    res.json(finalResult);
  } catch (error: any) {
    console.error('Error generating analysis:', error);
    res.status(500).json({ error: 'Failed to generate environmental analysis.' });
  }
};
