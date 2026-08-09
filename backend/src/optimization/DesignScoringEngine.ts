export interface DesignScores {
  overall: number;
  spaceEfficiency: number;
  lighting: number;
  ventilation: number;
  privacy: number;
  accessibility: number;
  energy: number;
}

export interface OptimizationWeights {
  spaceEfficiency: number;
  lighting: number;
  privacy: number;
  ventilation: number;
  energy: number;
  accessibility: number;
  cost?: number; // Optional budget weight
}

export function scoreDesign(layout: any, weights: OptimizationWeights): DesignScores {
  // Compute Space Efficiency: Ratio of built-up area to circulation + dead space.
  // We'll approximate this by checking room coverage against plot dimensions.
  const plotArea = layout.plotDimensions.width * layout.plotDimensions.length;
  const builtUpArea = layout.rooms.reduce((acc: number, r: any) => acc + (r.width * r.length), 0);
  
  // Base scores (0-100)
  let spaceScore = Math.min(100, Math.max(0, (builtUpArea / plotArea) * 150)); 
  
  // Circulation (Corridors/Stairs)
  const circulationRooms = layout.rooms.filter((r: any) => r.category === 'circulation' || r.name.toLowerCase().includes('corridor'));
  const circArea = circulationRooms.reduce((acc: number, r: any) => acc + (r.width * r.length), 0);
  if (circArea > builtUpArea * 0.2) spaceScore -= 10; // Penalize excessive circulation

  // Lighting & Ventilation (Rough proxy: rooms near the edges of the plot get better light)
  // Real implementation would cast rays from sun azimuth, but for geometry we check perimeter access.
  let lightingScore = 50;
  let ventilationScore = 50;
  let privacyScore = 70;
  let accessibilityScore = 80;
  let energyScore = 60;

  let roomsOnEdge = 0;
  layout.rooms.forEach((r: any) => {
    // If room touches edge of usable area, it has window potential
    const touchesEdge = 
      r.x <= layout.usableArea.startX + 2 ||
      r.y <= layout.usableArea.startY + 2 ||
      r.x + r.width >= layout.usableArea.startX + layout.usableArea.width - 2 ||
      r.y + r.length >= layout.usableArea.startY + layout.usableArea.length - 2;

    if (touchesEdge && r.category !== 'circulation') {
      roomsOnEdge++;
    }

    // Privacy: Bedrooms should preferably not be adjacent to public living areas directly
    if (r.category === 'sleeping') {
      const adjacentLiving = layout.rooms.some((other: any) => 
        other.category === 'living' &&
        Math.abs((r.x + r.width/2) - (other.x + other.width/2)) < (r.width + other.width)/2 + 2 &&
        Math.abs((r.y + r.length/2) - (other.y + other.length/2)) < (r.length + other.length)/2 + 2
      );
      if (!adjacentLiving) privacyScore += 5; // Reward isolated bedrooms
    }
  });

  const edgeRatio = roomsOnEdge / Math.max(1, layout.rooms.filter((r:any) => r.category !== 'circulation').length);
  lightingScore = Math.min(100, 30 + (edgeRatio * 70));
  ventilationScore = lightingScore * 0.9; // Closely tied to window access

  // Normalize scores
  privacyScore = Math.min(100, privacyScore);
  
  // Calculate weighted overall score
  const totalWeight = weights.spaceEfficiency + weights.lighting + weights.privacy + weights.ventilation + weights.energy + weights.accessibility;
  
  let overall = 0;
  if (totalWeight > 0) {
    overall = (
      (spaceScore * weights.spaceEfficiency) +
      (lightingScore * weights.lighting) +
      (privacyScore * weights.privacy) +
      (ventilationScore * weights.ventilation) +
      (energyScore * weights.energy) +
      (accessibilityScore * weights.accessibility)
    ) / totalWeight;
  } else {
    // Fallback if weights are 0
    overall = (spaceScore + lightingScore + privacyScore + ventilationScore + energyScore + accessibilityScore) / 6;
  }

  return {
    overall: Math.round(overall),
    spaceEfficiency: Math.round(spaceScore),
    lighting: Math.round(lightingScore),
    ventilation: Math.round(ventilationScore),
    privacy: Math.round(privacyScore),
    accessibility: Math.round(accessibilityScore),
    energy: Math.round(energyScore)
  };
}
