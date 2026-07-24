import { z } from 'zod';
import { generateObject } from 'ai';
import { HomePreferences, GeneratedLayout } from '../shared/types';
import { getAIModel } from '../services/ai/AiFactory';

function convertToFeet(value: number, unit: string): number {
  switch (unit.toLowerCase()) {
    case 'meters': return value * 3.28084;
    case 'gaj': return value * 3;
    default: return value;
  }
}

function legalizeLayout(layout: any) {
  // 1. Grid Snap
  layout.rooms.forEach((room: any) => {
    room.x = Math.round(room.x);
    room.y = Math.round(room.y);
    room.width = Math.round(room.width);
    room.length = Math.round(room.length);
  });

  const { startX, startY, width: usableW, length: usableL } = layout.usableArea;
  const endX = startX + usableW;
  const endY = startY + usableL;

  // 2. Resolve Overlaps (Simple relaxation)
  const iterations = 10;
  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < layout.rooms.length; i++) {
      for (let j = i + 1; j < layout.rooms.length; j++) {
        const r1 = layout.rooms[i];
        const r2 = layout.rooms[j];
        
        // Only check same floor
        if (r1.floor !== r2.floor) continue;

        const overlapX = Math.max(0, Math.min(r1.x + r1.width, r2.x + r2.width) - Math.max(r1.x, r2.x));
        const overlapY = Math.max(0, Math.min(r1.y + r1.length, r2.y + r2.length) - Math.max(r1.y, r2.y));

        if (overlapX > 0 && overlapY > 0) {
          // They overlap! Push the one that is NOT a staircase. 
          // If both are stairs (shouldn't happen on same floor), skip.
          const r1IsStair = r1.name === 'Staircase';
          const r2IsStair = r2.name === 'Staircase';
          
          if (r1IsStair && r2IsStair) continue;
          
          const shiftX = overlapX / 2;
          const shiftY = overlapY / 2;

          if (overlapX < overlapY) {
            // Push horizontally
            if (!r1IsStair && !r2IsStair) {
              if (r1.x < r2.x) { r1.x -= shiftX; r2.x += shiftX; }
              else { r1.x += shiftX; r2.x -= shiftX; }
            } else if (r1IsStair) {
              if (r1.x < r2.x) r2.x += overlapX; else r2.x -= overlapX;
            } else {
              if (r2.x < r1.x) r1.x += overlapX; else r1.x -= overlapX;
            }
          } else {
            // Push vertically
            if (!r1IsStair && !r2IsStair) {
              if (r1.y < r2.y) { r1.y -= shiftY; r2.y += shiftY; }
              else { r1.y += shiftY; r2.y -= shiftY; }
            } else if (r1IsStair) {
              if (r1.y < r2.y) r2.y += overlapY; else r2.y -= overlapY;
            } else {
              if (r2.y < r1.y) r1.y += overlapY; else r1.y -= overlapY;
            }
          }
        }
      }
    }
  }

  // 3. Enforce Boundaries and re-snap
  layout.rooms.forEach((room: any) => {
    room.x = Math.round(room.x);
    room.y = Math.round(room.y);
    
    if (room.x < startX) room.x = startX;
    if (room.y < startY) room.y = startY;
    if (room.x + room.width > endX) room.x = endX - room.width;
    if (room.y + room.length > endY) room.y = endY - room.length;
  });
}

export const generateAILayout = async (preferences: HomePreferences): Promise<GeneratedLayout> => {
  const plotWidth = convertToFeet(preferences.plot.width, preferences.plot.unit);
  const plotLength = convertToFeet(preferences.plot.length, preferences.plot.unit);

  const setbackX = plotWidth * 0.1;
  const setbackY = plotLength * 0.1;
  
  const usableStartX = setbackX;
  const usableStartY = setbackY;
  const usableWidth = plotWidth - (2 * setbackX);
  const usableLength = plotLength - (2 * setbackY);
  
  const numFloors = Math.max(1, preferences.building.numberOfFloors);
  const hasStairs = numFloors > 1;

  const model = getAIModel('gemini'); // Force gemini for layout generation

  const prompt = `
  You are an expert architect AI. Generate a 2D floor plan layout based on these preferences:
  ${JSON.stringify(preferences, null, 2)}
  
  Constraints:
  1. Plot dimensions (usable area): StartX: ${usableStartX}, StartY: ${usableStartY}, Width: ${usableWidth}, Length: ${usableLength}. ALL rooms must fit inside this bounding box!
  2. Number of floors: ${numFloors}.
  3. No rooms should overlap on the same floor.
  4. If multiple floors exist, you MUST include a room with category 'circulation', name 'Staircase'. This staircase MUST exist on EVERY floor (from floor 0 to ${numFloors - 1}), and it MUST have the EXACT SAME x, y, width, and length on every floor (stack vertically).
  5. Include all requested bedrooms, bathrooms, living rooms, etc.
  6. If Vastu is required (${preferences.preferences.vastuRequired}), try to put the kitchen in the SE or NW, and the master bedroom in the SW.
  `;

  const { object } = await generateObject({
    model,
    schema: z.object({
      plotDimensions: z.object({
        width: z.number(),
        length: z.number(),
        unit: z.string(),
      }),
      usableArea: z.object({
        width: z.number(),
        length: z.number(),
        startX: z.number(),
        startY: z.number(),
      }),
      rooms: z.array(z.object({
        id: z.string(),
        name: z.string(),
        category: z.enum(['living', 'sleeping', 'service', 'outdoor', 'circulation']),
        stairStyle: z.enum(['Straight', 'L Shape', 'U Shape']).optional(),
        stairDirection: z.enum(['north', 'south', 'east', 'west']).optional(),
        floor: z.number(),
        x: z.number(),
        y: z.number(),
        width: z.number(),
        length: z.number(),
      }))
    }),
    prompt,
  });

  // Legalize the layout to ensure it's practical
  legalizeLayout(object);

  return object as GeneratedLayout;
};
