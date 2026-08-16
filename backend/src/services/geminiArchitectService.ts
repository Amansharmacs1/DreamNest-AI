import { z } from 'zod';
import { generateObject } from 'ai';
import { HomePreferences, GeneratedLayout, DesignMetadata } from '../shared/types';
import { getAIModel } from './ai/AiFactory';
import { repairLayout } from '../algorithms/layoutRepairEngine';
import { calculateDesignScore } from '../algorithms/scoringEngine';

function convertToFeet(value: number, unit: string): number {
  switch (unit.toLowerCase()) {
    case 'meters': return value * 3.28084;
    case 'gaj': return value * 3;
    default: return value;
  }
}

const RoomSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  category: z.enum(['living', 'sleeping', 'service', 'outdoor', 'circulation']),
  stairStyle: z.string().optional(),
  stairDirection: z.string().optional(),
  floor: z.number(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  length: z.number(),
});

const LayoutCandidateSchema = z.object({
  rooms: z.array(RoomSchema),
  explanation: z.string().describe("A concise architectural explanation of why this layout was chosen, focusing on circulation, lighting, and room adjacency."),
  variantName: z.string().describe("A short name for this variant, e.g., 'Space Optimized', 'Light Optimized'"),
});

export const generateArchitecturalCandidates = async (
  preferences: HomePreferences,
  attempts = 3
): Promise<GeneratedLayout[]> => {
  const plotWidth = convertToFeet(preferences.plot.width, preferences.plot.unit);
  const plotLength = convertToFeet(preferences.plot.length, preferences.plot.unit);

  const setbackX = plotWidth * 0.1;
  const setbackY = plotLength * 0.1;
  const usableStartX = setbackX;
  const usableStartY = setbackY;
  const usableWidth = plotWidth - (2 * setbackX);
  const usableLength = plotLength - (2 * setbackY);
  
  const numFloors = Math.max(1, preferences.building.numberOfFloors);

  const model = getAIModel('gemini');

  const prompt = `
  You are a Senior Architectural AI. Design a highly practical 2D floor plan based on these user preferences:
  ${JSON.stringify(preferences, null, 2)}
  
  CRITICAL CONSTRAINTS:
  1. Plot Usable Area: StartX=${usableStartX}, StartY=${usableStartY}, Max Width=${usableWidth}, Max Length=${usableLength}. ALL rooms MUST physically fit inside this bounding box!
  2. Number of Floors: ${numFloors}.
  3. Rooms MUST NOT overlap on the same floor.
  4. If multiple floors exist, you MUST include a room with category 'circulation', name 'Staircase' on EVERY floor (from 0 to ${numFloors - 1}) at the EXACT SAME x, y coordinates so they stack vertically.
  5. Include all requested rooms: ${preferences.rooms.bedrooms} Bedrooms, ${preferences.rooms.livingRooms} Living, ${preferences.rooms.kitchen} Kitchen, etc.
  6. ARCHITECTURAL INTELLIGENCE: Place the Kitchen near the Dining room. Keep Bedrooms away from the main entrance for privacy.
  7. OUTDOOR FEATURES: 
     - Swimming Pool/Garden/Parking must be category 'outdoor' on floor 0.
     - Solar Panels must be category 'outdoor' on floor ${numFloors} (the roof layer).
  
  Return a structured JSON with 'rooms', 'explanation', and 'variantName'.
  `;

  // We run up to `attempts` generations in parallel to gather variants
  const generationPromises = Array.from({ length: attempts }).map(() => 
    generateObject({
      model,
      schema: LayoutCandidateSchema,
      prompt,
    }).catch(e => {
      console.warn("Gemini generation failed for a candidate:", e.message);
      return null;
    })
  );

  const results = await Promise.all(generationPromises);
  const validCandidates: GeneratedLayout[] = [];

  for (const res of results) {
    if (!res) continue;
    
    try {
      const { object } = res;
      
      // Map to base structure
      let candidate: GeneratedLayout = {
        plotDimensions: { width: preferences.plot.width, length: preferences.plot.length, unit: preferences.plot.unit },
        usableArea: { width: usableWidth, length: usableLength, startX: usableStartX, startY: usableStartY },
        rooms: object.rooms as any,
        metadata: {
          source: 'gemini',
          confidence: 0.9,
          reasoning: [object.explanation],
          validated: false,
          explanation: object.explanation,
          variantName: object.variantName
        }
      };

      // Repair and geometrically validate (Snap, fix overlaps, check bounds)
      candidate = repairLayout(candidate, preferences);
      
      // Score the candidate
      const score = calculateDesignScore(candidate, preferences);
      candidate.metadata!.score = score;
      candidate.metadata!.validated = true;

      validCandidates.push(candidate);
    } catch (err: any) {
      console.warn("Candidate rejected during deterministic validation/repair:", err.message);
    }
  }

  return validCandidates;
};
