import { scoreDesign, OptimizationWeights } from './DesignScoringEngine';
import { analyzeDesignWithGemini, RoomConstraint } from './geminiDesignCriticService';
import { legalizeLayout } from '../algorithms/aiLayoutEngine';

export interface OptimizationCandidate {
  id: string;
  name: string;
  layout: any;
  score: number;
  scores: any;
  explanation: string;
}

export const runParetoOptimization = async (
  baseLayout: any,
  weights: OptimizationWeights,
  constraints: RoomConstraint[],
  prompt: string,
  onProgress?: (message: string) => void
): Promise<OptimizationCandidate[]> => {
  
  if (onProgress) onProgress('Analyzing current design baseline...');
  
  const baseScores = scoreDesign(baseLayout, weights);
  const candidates: OptimizationCandidate[] = [];
  
  // We'll generate 2 variants by tweaking weights to simulate Pareto frontiers
  // Variant A: Uses exactly the user's weights
  // Variant B: Prioritizes Space
  // Variant C: Prioritizes Light
  
  const variants = [
    { name: 'Balanced Optimized', w: weights },
    { name: 'Space Optimized', w: { ...weights, spaceEfficiency: 1.0, lighting: 0.1 } },
    { name: 'Light Optimized', w: { ...weights, spaceEfficiency: 0.1, lighting: 1.0 } }
  ];

  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i];
    if (onProgress) onProgress(`Consulting AI architect for ${variant.name}...`);
    
    try {
      const criticResponse = await analyzeDesignWithGemini(baseLayout, variant.w, constraints, prompt);
      
      if (onProgress) onProgress(`Applying modifications for ${variant.name}...`);
      
      // Clone layout to apply changes
      const candidateLayout = JSON.parse(JSON.stringify(baseLayout));
      
      // Apply operations
      criticResponse.operations.forEach(op => {
        const room = candidateLayout.rooms.find((r: any) => r.id === op.roomId);
        if (!room) return;
        
        // Skip locked rooms
        if (constraints.find(c => c.id === op.roomId && c.locked)) return;

        if (op.operation === 'resize_room') {
          if (op.width) room.width = op.width;
          if (op.length) room.length = op.length;
        } else if (op.operation === 'move_room') {
          if (op.x !== undefined) room.x = op.x;
          if (op.y !== undefined) room.y = op.y;
        }
      });

      if (onProgress) onProgress(`Validating geometry for ${variant.name}...`);
      
      // Deterministic validation: ensures no overlap, stays inside boundaries
      legalizeLayout(candidateLayout);

      const newScores = scoreDesign(candidateLayout, variant.w);

      const explanation = criticResponse.issues.map(i => i.description).join(' ') || 
        'Optimized room placements and dimensions to better fit the targeted constraints.';

      candidates.push({
        id: `opt_${Date.now()}_${i}`,
        name: variant.name,
        layout: candidateLayout,
        score: newScores.overall,
        scores: newScores,
        explanation
      });

    } catch (e) {
      console.warn(`Variant ${variant.name} generation failed`, e);
    }
  }

  if (onProgress) onProgress('Optimization complete.');
  
  return candidates;
};
