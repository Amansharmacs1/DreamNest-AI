import { Request, Response } from 'express';
import { HomePreferences } from '../shared/types';
import { generateDeterministicLayout } from '../algorithms/layoutEngine';
import { generateAILayout } from '../algorithms/aiLayoutEngine';
import { generateInteriorDesign } from '../services/ai/aiInteriorDesigner';

export const generateLayout = async (req: Request, res: Response): Promise<void> => {
  try {
    const preferences: HomePreferences = req.body;

    // Validate request (Basic check, could use Zod here as well)
    if (!preferences || !preferences.plot) {
      res.status(400).json({ error: 'Invalid preferences provided.' });
      return;
    }

    // Try AI generation first
    let layout;
    try {
      console.log('Attempting AI-driven layout generation...');
      layout = await generateAILayout(preferences);
      console.log('AI Layout generation successful.');
    } catch (aiError) {
      console.warn('AI Layout generation failed, falling back to deterministic layout.', aiError);
      // Fallback to deterministic engine
      layout = generateDeterministicLayout(preferences);
    }

    // Step 2: Generate Interior Design using AI
    try {
      console.log('Attempting AI Interior Design generation...');
      layout = await generateInteriorDesign(layout, preferences);
      console.log('AI Interior Design generation successful.');
    } catch (aiInteriorError) {
      console.warn('AI Interior Design generation failed. Returning layout without interior details.', aiInteriorError);
    }

    // TODO: In phase 2, we would save this to the DB here.
    
    res.status(200).json(layout);
  } catch (error: any) {
    console.error('Layout Generation Error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate layout' });
  }
};
