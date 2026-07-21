import { Request, Response } from 'express';
import { HomePreferences } from '../shared/types';
import { generateDeterministicLayout } from '../algorithms/layoutEngine';

export const generateLayout = (req: Request, res: Response): void => {
  try {
    const preferences: HomePreferences = req.body;

    // Validate request (Basic check, could use Zod here as well)
    if (!preferences || !preferences.plot) {
      res.status(400).json({ error: 'Invalid preferences provided.' });
      return;
    }

    // Call deterministic engine
    const layout = generateDeterministicLayout(preferences);

    // TODO: In phase 2, we would save this to the DB here.
    
    res.status(200).json(layout);
  } catch (error: any) {
    console.error('Layout Generation Error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate layout' });
  }
};
