import { Request, Response } from 'express';
import { streamText, generateObject, generateText } from 'ai';
import { z } from 'zod';
import { getAIModel, AIProvider } from '../services/ai/AiFactory';

export const aiChat = async (req: Request, res: Response) => {
  try {
    const { messages, provider, layout } = req.body;
    
    // Convert array of generic messages to standard AI format
    const model = getAIModel((provider as AIProvider) || 'gemini');

    const systemPrompt = `You are NIVA ROBO, an expert software architect and AI architect. 
    You help users optimize their floor plans, answer design questions, and suggest improvements.
    The user's current layout is: ${layout ? JSON.stringify(layout) : 'Not generated yet'}.
    Be concise, helpful, and friendly.`;

    const result = await streamText({
      model,
      system: systemPrompt,
      messages,
    });

    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    });

    for await (const chunk of result.textStream) {
      res.write(`0:${JSON.stringify(chunk)}\n`);
    }
    res.end();
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const analyzeLayout = async (req: Request, res: Response) => {
  try {
    const { layout, provider } = req.body;
    const model = getAIModel((provider as AIProvider) || 'gemini');

    const result = await generateObject({
      model,
      schema: z.object({
        strengths: z.array(z.string()),
        weaknesses: z.array(z.string()),
        suggestions: z.array(z.string()),
        trafficFlow: z.string()
      }),
      prompt: `Analyze this floor plan layout and provide an architectural critique. Layout: ${JSON.stringify(layout)}`
    });

    res.json(result.object);
  } catch (error: any) {
    console.error('Analyze error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const generateCostEstimate = async (req: Request, res: Response) => {
  try {
    const { layout, budget, provider } = req.body;
    const model = getAIModel((provider as AIProvider) || 'gemini');

    const result = await generateObject({
      model,
      schema: z.object({
        totalEstimatedCost: z.number(),
        civilWork: z.number(),
        finishing: z.number(),
        breakdown: z.array(z.object({
          category: z.string(),
          cost: z.number(),
          description: z.string()
        })),
        savingsSuggestions: z.array(z.string())
      }),
      prompt: `Generate a construction cost estimate for a house in India. Layout: ${JSON.stringify(layout)}. User budget preference: ${budget}. 
      Calculate the total square footage from the layout. Standard construction rates in India are ₹1,500 to ₹2,500 per sq ft depending on the budget preference. 
      Return highly realistic figures in Indian Rupees (INR). Do not arbitrarily scale down to a random number. Calculate the actual market cost.`
    });

    res.json(result.object);
  } catch (error: any) {
    console.error('Cost error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const parseRequirements = async (req: Request, res: Response) => {
  try {
    const { text, provider } = req.body;
    const model = getAIModel((provider as AIProvider) || 'gemini');

    const result = await generateObject({
      model,
      schema: z.object({
        plot: z.object({
          width: z.number().optional(),
          length: z.number().optional(),
          budget: z.string().optional()
        }).optional(),
        building: z.object({
          numberOfFloors: z.number().optional(),
          houseStyle: z.string().optional()
        }).optional(),
        rooms: z.object({
          bedrooms: z.number().optional(),
          bathrooms: z.number().optional(),
          office: z.number().optional()
        }).optional(),
        outdoor: z.object({
          parking: z.boolean().optional(),
          numberOfCars: z.number().optional(),
          garden: z.boolean().optional()
        }).optional()
      }),
      prompt: `Extract home design preferences from this text. Map them closely to numerical values and booleans. If a field isn't mentioned, omit it. Text: "${text}"`
    });

    res.json(result.object);
  } catch (error: any) {
    console.error('Parse error:', error);
    res.status(500).json({ error: error.message });
  }
};
