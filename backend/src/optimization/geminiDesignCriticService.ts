import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import type { OptimizationWeights } from './DesignScoringEngine';

export interface RoomConstraint {
  id: string;
  locked: boolean;
}

export const analyzeDesignWithGemini = async (
  layout: any, 
  weights: OptimizationWeights,
  constraints: RoomConstraint[],
  prompt: string = ''
) => {
  const systemPrompt = `You are an expert AI Architectural Critic and Optimization Engine.
You have been given a floor plan layout in JSON format, user optimization weights (priorities), and constraints (which rooms are locked).
Your goal is to propose concrete, geometric modifications to improve the design based on the user's priorities or their specific natural language request.

Current Weights: ${JSON.stringify(weights)}
Locked Rooms: ${JSON.stringify(constraints.filter(c => c.locked).map(c => c.id))}

Rules:
1. DO NOT modify locked rooms.
2. Return ONLY structured operations (resize_room, move_room).
3. "resize_room" requires roomId, new width, new length.
4. "move_room" requires roomId, new x, new y.
5. If the user provided a specific prompt ("Make the kitchen bigger"), prioritize that request over general weights.

User Prompt: ${prompt || 'Optimize the design according to the provided weights.'}`;

  try {
    const { object } = await generateObject({
      model: google('gemini-2.5-pro'),
      schema: z.object({
        issues: z.array(z.object({
          type: z.string(),
          severity: z.string(),
          roomId: z.string(),
          description: z.string()
        })),
        operations: z.array(z.object({
          operation: z.enum(['resize_room', 'move_room']),
          roomId: z.string(),
          width: z.number().optional(),
          length: z.number().optional(),
          x: z.number().optional(),
          y: z.number().optional()
        }))
      }),
      system: systemPrompt,
      prompt: JSON.stringify(layout)
    });

    return object;
  } catch (error) {
    console.error('Gemini Critic Error:', error);
    throw new Error('Failed to analyze design with Gemini');
  }
};
