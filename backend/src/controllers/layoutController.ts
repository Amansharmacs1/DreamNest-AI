import { Request, Response } from 'express';
import { HomePreferences } from '../shared/types';
import { generateDeterministicLayout } from '../algorithms/layoutEngine';
import { generateArchitecturalCandidates } from '../services/geminiArchitectService';
import { generateInteriorDesign } from '../services/ai/aiInteriorDesigner';
import { repairLayout } from '../algorithms/layoutRepairEngine';

// Basic in-memory rate limiter for Phase 3 API protection
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5;
const requestCounts = new Map<string, { count: number; timestamp: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);
  if (!record || (now - record.timestamp > RATE_LIMIT_WINDOW)) {
    requestCounts.set(ip, { count: 1, timestamp: now });
    return false;
  }
  if (record.count >= MAX_REQUESTS) return true;
  record.count++;
  return false;
}

export const generateLayout = async (req: Request, res: Response): Promise<void> => {
  try {
    const preferences: HomePreferences = req.body;

    // Validate request (Basic check, could use Zod here as well)
    if (!preferences || !preferences.plot) {
      res.status(400).json({ error: 'Invalid preferences provided.' });
      return;
    }

    // Rate limiting check
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    if (isRateLimited(ip)) {
      res.status(429).json({ error: 'Too many requests. Please wait a minute before generating again.' });
      return;
    }

    // Try AI generation first (Phase 3 Hybrid Pipeline)
    let layout;
    try {
      console.log('Attempting AI-driven architectural layout generation...');
      
      const candidates = await generateArchitecturalCandidates(preferences, 3);
      
      if (candidates && candidates.length > 0) {
        // Sort by score and pick the best valid candidate
        candidates.sort((a, b) => (b.metadata?.score?.overall || 0) - (a.metadata?.score?.overall || 0));
        layout = candidates[0];
        console.log(`AI Layout generation successful. Selected variant: ${layout.metadata?.variantName} with score ${layout.metadata?.score?.overall}`);
      } else {
        throw new Error('AI Engine failed to generate any valid candidates.');
      }
    } catch (aiError) {
      console.warn('AI Layout generation failed completely, falling back to deterministic layout.', aiError);
      // Fallback to deterministic engine
      layout = generateDeterministicLayout(preferences);
      layout = repairLayout(layout, preferences); // Standardize structure
      layout.metadata = {
        source: 'deterministic',
        confidence: 1.0,
        reasoning: ['Generated using fallback deterministic rule engine due to AI failure.'],
        validated: true,
        explanation: 'Standard algorithmic layout.',
        variantName: 'Deterministic Fallback'
      };
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
