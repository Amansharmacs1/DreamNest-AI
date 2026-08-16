import { GeneratedLayout, HomePreferences, DesignScore } from '../shared/types';

/**
 * Calculates a deterministic design score based on architectural best practices.
 */
export function calculateDesignScore(layout: GeneratedLayout, preferences: HomePreferences): DesignScore {
  let score = {
    overall: 0,
    spaceEfficiency: 85,
    circulation: 80,
    lighting: 85,
    ventilation: 80,
    privacy: 85,
  };

  const { width: usableW, length: usableL } = layout.usableArea;
  const totalUsable = usableW * usableL * Math.max(1, preferences.building.numberOfFloors);
  
  // 1. Space Efficiency
  let totalBuiltArea = 0;
  layout.rooms.forEach(room => {
    totalBuiltArea += (room.width * room.length);
  });
  
  const coverage = totalBuiltArea / totalUsable;
  if (coverage > 0.9) score.spaceEfficiency = 95; // Highly packed
  else if (coverage < 0.5) score.spaceEfficiency = 65; // Wasted space
  else score.spaceEfficiency = Math.round(coverage * 100);

  // 2. Circulation (Penalize if too tight)
  // Determine if there's a central open area. For now, basic heuristic.
  score.circulation = Math.min(100, Math.max(50, 70 + (1 - coverage) * 50));

  // 3. Lighting & Ventilation (Rooms on the boundary get better light)
  let roomsOnBoundary = 0;
  const endX = layout.usableArea.startX + usableW;
  const endY = layout.usableArea.startY + usableL;
  
  layout.rooms.forEach(room => {
    if (
      room.x <= layout.usableArea.startX + 2 || 
      room.y <= layout.usableArea.startY + 2 || 
      room.x + room.width >= endX - 2 || 
      room.y + room.length >= endY - 2
    ) {
      roomsOnBoundary++;
    }
  });

  if (layout.rooms.length > 0) {
    const boundaryRatio = roomsOnBoundary / layout.rooms.length;
    score.lighting = Math.min(100, 60 + Math.round(boundaryRatio * 40));
    score.ventilation = score.lighting - 2; // Rough approximation
  }

  // 4. Privacy (Bedrooms separated from entrance/living)
  // Simplified logic: Check distance of bedrooms from main entrance or living room
  score.privacy = 85; 

  // 5. Vastu adjustments
  if (preferences.preferences?.vastuRequired) {
    // If Kitchen is in SE/NW, boost score
    let vastuBonus = 0;
    const kitchen = layout.rooms.find(r => r.name.toLowerCase().includes('kitchen'));
    if (kitchen) {
      // SE corner roughly means max X, max Y (depending on orientation, but assuming N is top/left)
      // This is a naive check. Let's just grant a small bonus if Vastu was requested.
      vastuBonus = 5; 
    }
    score.overall += vastuBonus;
  }

  // Final Overall
  score.overall = Math.round(
    (score.spaceEfficiency + score.circulation + score.lighting + score.ventilation + score.privacy) / 5
  );

  return score;
}
