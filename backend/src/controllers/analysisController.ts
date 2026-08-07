import { Request, Response } from 'express';
import { AISmartAnalyzer } from '../services/ai/aiSmartAnalyzer';

export const improveDesign = async (req: Request, res: Response) => {
  try {
    const { layout, provider } = req.body;
    
    if (!layout) {
      return res.status(400).json({ error: 'Layout is required' });
    }

    const improvedData = await AISmartAnalyzer.generateImprovementSuggestions(layout, provider);
    
    res.json(improvedData);
  } catch (error: any) {
    console.error('Error in improveDesign controller:', error);
    res.status(500).json({ error: 'Failed to improve design' });
  }
};
