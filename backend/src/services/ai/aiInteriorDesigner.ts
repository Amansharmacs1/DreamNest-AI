import { z } from 'zod';
import { generateObject } from 'ai';
import { HomePreferences, GeneratedLayout } from '../../shared/types';
import { getAIModel } from './AiFactory';
import { placeFurniture, placeLighting, placeDecorations } from '../../algorithms/furniturePlacement';

export const generateInteriorDesign = async (layout: GeneratedLayout, preferences: HomePreferences): Promise<GeneratedLayout> => {
  const model = getAIModel('gemini'); // Using Gemini for high-performance JSON generation
  
  const roomSummaries = layout.rooms.map(r => ({
    id: r.id,
    name: r.name,
    category: r.category,
    width: r.width,
    length: r.length,
    windows: r.windows?.length || 0,
    doors: r.doors?.length || 0
  }));

  const prompt = `
  You are an expert interior designer and architect.
  Provide interior design recommendations for a house.
  House Style: ${preferences.building.houseStyle}
  Budget: ${preferences.plot.budget}

  Here are the rooms in the house:
  ${JSON.stringify(roomSummaries, null, 2)}

  For EACH room, provide:
  1. A list of necessary furniture pieces (e.g., "Queen Bed", "Sofa", "Dining Table"). Provide realistic dimensions for each in feet (width, length, height).
  2. A list of light fixtures.
  3. A list of decorations.
  4. Suggested materials for the floor and walls.
  5. A short explanation of your design choices (designNotes).
  6. Estimated cost in USD for this room based on the budget.

  Make sure to respect the room dimensions. Do not put too much furniture in small rooms.
  `;

  const { object } = await generateObject({
    model,
    schema: z.object({
      rooms: z.array(z.object({
        id: z.string(),
        furniture: z.array(z.object({
          type: z.string(),
          width: z.number(),
          length: z.number(),
          height: z.number(),
          style: z.string(),
          color: z.string()
        })),
        lighting: z.array(z.object({
          type: z.enum(['ceiling', 'wall', 'table', 'pendant']),
          intensity: z.number(),
          color: z.string()
        })),
        decorations: z.array(z.object({
          type: z.string(),
          scale: z.number()
        })),
        materials: z.object({
          floor: z.string(),
          wall: z.string()
        }),
        designNotes: z.string(),
        costEstimate: z.object({
          furniture: z.number(),
          materials: z.number(),
          decorations: z.number(),
          total: z.number(),
          currency: z.string()
        })
      }))
    }),
    prompt,
  });

  // Now map the AI suggestions back to the layout rooms, and place the furniture deterministically.
  layout.rooms = layout.rooms.map(room => {
    const aiDesign = object.rooms.find(r => r.id === room.id);
    if (!aiDesign) return room;

    room.materials = aiDesign.materials;
    room.designNotes = aiDesign.designNotes;
    room.costEstimate = aiDesign.costEstimate;

    // Place items
    room.furniture = placeFurniture(room, aiDesign.furniture);
    room.lighting = placeLighting(room, aiDesign.lighting);
    room.decorations = placeDecorations(room, aiDesign.decorations);

    return room;
  });

  return layout;
};
