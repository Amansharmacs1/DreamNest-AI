import { z } from 'zod';
import { generateObject } from 'ai';
import { AnalysisResult } from '../shared/types';
import { getAIModel } from './ai/AiFactory';

const AnalysisExplanationSchema = z.object({
  explanation: z.string().describe("A professional architectural summary explaining the overall score and the strengths/weaknesses of the design."),
  recommendations: z.array(z.string()).describe("A list of 3-5 high-priority, actionable architectural recommendations based on the detected issues.")
});

export const explainAnalysisResult = async (deterministicResult: AnalysisResult): Promise<AnalysisResult> => {
  const model = getAIModel('gemini'); // Using Gemini specifically for Phase 5 explainer

  // Strip complex arrays to save tokens, only send the core metrics and issues
  const contextData = {
    overallScore: deterministicResult.overallScore,
    spaceEfficiency: deterministicResult.spaceEfficiency.status,
    naturalLighting: deterministicResult.naturalLighting.status,
    ventilation: deterministicResult.ventilation.status,
    circulation: deterministicResult.circulation.status,
    privacy: deterministicResult.privacy.status,
    issues: deterministicResult.issues
  };

  const prompt = `
  You are an expert Environmental Architect. Review the following deterministic analysis of a home design:
  ${JSON.stringify(contextData, null, 2)}
  
  TASK:
  1. Write a professional, client-friendly explanation (approx. 3 sentences) summarizing the design's environmental performance (lighting, ventilation, space).
  2. Provide 3-5 actionable recommendations based strictly on the "issues" array provided.
  
  CRITICAL: 
  - DO NOT invent new numerical scores or measurements.
  - DO NOT suggest structural redesigns, only practical architectural improvements (e.g. window placements, room usage).
  - EXPLAIN the provided data, do not hallucinate new data.
  `;

  try {
    const { object } = await generateObject({
      model,
      schema: AnalysisExplanationSchema,
      prompt,
    });

    // Merge Gemini explanation into deterministic result
    deterministicResult.explanation = object.explanation;
    
    // Merge Gemini recommendations with deterministic recommendations
    deterministicResult.recommendations = [
      ...deterministicResult.recommendations,
      ...object.recommendations
    ];

    return deterministicResult;
  } catch (error) {
    console.warn("Gemini explanation generation failed, falling back to deterministic-only result.", error);
    deterministicResult.explanation = "Analysis completed successfully. Review the generated issues for specific architectural insights.";
    return deterministicResult;
  }
};
