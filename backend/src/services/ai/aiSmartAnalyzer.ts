import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export class AISmartAnalyzer {
  public static async generateImprovementSuggestions(layout: any, provider: string): Promise<any> {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `
You are an expert residential architect and AI design advisor. 
Analyze the provided 2D floor plan JSON and suggest practical layout improvements to enhance sunlight, ventilation, space utilization, and accessibility.
Do not hallucinate features. Only modify existing rooms, their sizes, or window/door placements. Ensure changes are structurally sound.

Input Layout:
${JSON.stringify(layout)}

Output a structured JSON object representing the improved layout. The output must strictly match the Input Layout schema, but with your modifications applied.
Also provide a list of "aiSuggestions" describing what you changed and why.

JSON Schema:
{
  "improvedLayout": { /* Same schema as Input Layout, with changes */ },
  "aiSuggestions": [
    {
      "id": "string",
      "description": "string (What you changed and why)",
      "type": "lighting|ventilation|space|general",
      "suggestedChanges": {} // optional metadata
    }
  ]
}
`;

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      return JSON.parse(responseText);
    } catch (e: any) {
      console.error('Error generating improvement suggestions', e);
      throw new Error('Failed to generate improvement suggestions from AI.');
    }
  }
}
