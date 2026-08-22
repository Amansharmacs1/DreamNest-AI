import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { CostEstimate } from './CostEstimationEngine';
import { MeasurementResult } from './MeasurementEngine';

export const analyzeConstructionBudget = async (
  layout: any, 
  measurements: MeasurementResult,
  estimate: CostEstimate,
  userBudget?: number
) => {
  const systemPrompt = `You are a Senior Construction Estimator and AI Architect.
You are given a structural measurement report, a Bill of Quantities (BOQ) cost estimate, and an optional user budget.
Your job is to analyze the costs and provide structured, intelligent recommendations for saving money or optimizing the budget without compromising structural integrity.

Important:
- Provide specific cost drivers.
- Provide actionable saving alternatives.
- You CANNOT modify the numerical calculations, you only explain them.
- All numbers are estimates.

Measurements Summary:
Built-up Area: ${measurements.builtUpArea} sqft
Wall Area: ${measurements.wallArea} sqft

Estimate Summary:
Subtotal: ${estimate.subtotal}
Total: ${estimate.total}
Categories: ${JSON.stringify(estimate.categoryBreakdown)}

User Budget: ${userBudget || 'Not specified'}`;

  try {
    const { object } = await generateObject({
      model: google('gemini-2.5-pro'),
      schema: z.object({
        costDrivers: z.array(z.string()),
        savingsRecommendations: z.array(z.object({
          category: z.string(),
          suggestion: z.string(),
          potentialImpact: z.string() // e.g. "Low", "Medium", "High"
        })),
        overallAssessment: z.string()
      }),
      system: systemPrompt,
      prompt: "Analyze the construction estimate."
    });

    return object;
  } catch (error) {
    console.error('AI Construction Critic Error:', error);
    throw new Error('Failed to analyze construction budget with AI');
  }
};
