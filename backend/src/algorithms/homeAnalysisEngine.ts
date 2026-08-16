import { GeneratedLayout, AnalysisResult, AnalysisIssue, MetricCategory, RoomDimensions } from '../shared/types';

export function runDeterministicAnalysis(layout: GeneratedLayout): AnalysisResult {
  const issues: AnalysisIssue[] = [];
  const recommendations: string[] = [];

  // 1. Space Utilization
  const plotW = layout.plotDimensions.width;
  const plotL = layout.plotDimensions.length;
  const totalPlotArea = plotW * plotL;
  
  let builtUpArea = 0;
  let circulationArea = 0;
  let gardenArea = 0;
  let parkingArea = 0;

  layout.rooms.forEach(room => {
    const area = room.width * room.length;
    if (room.floor === 0 && room.category !== 'outdoor') builtUpArea += area;
    if (room.category === 'circulation') circulationArea += area;
    if (room.category === 'outdoor' && room.name.toLowerCase().includes('garden')) gardenArea += area;
    if (room.category === 'outdoor' && room.name.toLowerCase().includes('parking')) parkingArea += area;
  });

  const coverageRatio = builtUpArea / totalPlotArea;
  let spaceScore = 80;
  let spaceStatus: 'excellent' | 'good' | 'moderate' | 'needs_attention' = 'good';
  
  if (coverageRatio > 0.8) {
    spaceScore -= 20;
    spaceStatus = 'needs_attention';
    issues.push({ severity: 'Medium', category: 'Space', description: 'Very high ground coverage limits outdoor space.', recommendation: 'Consider adding a floor to reduce ground footprint.' });
  } else if (coverageRatio < 0.3) {
    spaceScore -= 10;
    spaceStatus = 'moderate';
  } else {
    spaceScore = 95;
    spaceStatus = 'excellent';
  }

  const spaceEfficiency: MetricCategory = {
    score: spaceScore,
    status: spaceStatus,
    metrics: { totalPlotArea, builtUpArea, circulationArea, coverageRatio: (coverageRatio * 100).toFixed(1) + '%' }
  };

  // 2. Room Size & Aspect Ratio
  layout.rooms.forEach(room => {
    const ratio = Math.max(room.width, room.length) / Math.min(room.width, room.length);
    if (ratio > 3) {
      issues.push({
        severity: 'Medium',
        category: 'Space',
        description: `${room.name} is very narrow (aspect ratio > 3:1).`,
        recommendation: `Widen ${room.name} to improve usability.`
      });
    }
    if (room.width < 5 || room.length < 5) {
      issues.push({
        severity: 'High',
        category: 'Space',
        description: `${room.name} dimensions are extremely tight.`,
        recommendation: `Increase ${room.name} dimensions beyond 5ft.`
      });
    }
  });

  // 3. Natural Lighting & Ventilation (Edge Detection)
  let lightingScore = 0;
  let ventilationScore = 0;
  const lightingRooms: any[] = [];
  const ventilationRooms: any[] = [];

  const minX = layout.usableArea.startX;
  const minY = layout.usableArea.startY;
  const maxX = minX + layout.usableArea.width;
  const maxY = minY + layout.usableArea.length;

  layout.rooms.forEach(room => {
    if (room.category === 'outdoor') return;

    let exposedEdges = 0;
    let oppositeExposed = false;

    const onLeft = Math.abs(room.x - minX) <= 2;
    const onRight = Math.abs((room.x + room.width) - maxX) <= 2;
    const onTop = Math.abs(room.y - minY) <= 2;
    const onBottom = Math.abs((room.y + room.length) - maxY) <= 2;

    if (onLeft) exposedEdges++;
    if (onRight) exposedEdges++;
    if (onTop) exposedEdges++;
    if (onBottom) exposedEdges++;

    if ((onLeft && onRight) || (onTop && onBottom)) {
      oppositeExposed = true;
    }

    const lightRating = exposedEdges > 1 ? 95 : (exposedEdges === 1 ? 75 : 40);
    const ventRating = oppositeExposed ? 95 : (exposedEdges > 0 ? 70 : 30);

    lightingScore += lightRating;
    ventilationScore += ventRating;

    lightingRooms.push({ roomId: room.id, name: room.name, score: lightRating, exposedEdges });
    ventilationRooms.push({ roomId: room.id, name: room.name, score: ventRating, crossVentilation: oppositeExposed });

    if (exposedEdges === 0 && room.category === 'living') {
      issues.push({ severity: 'High', category: 'Lighting', description: `${room.name} has no exterior walls for natural light.`, recommendation: 'Relocate to the boundary of the plot.' });
    }
  });

  const avgLighting = layout.rooms.filter(r => r.category !== 'outdoor').length > 0 ? Math.round(lightingScore / layout.rooms.filter(r => r.category !== 'outdoor').length) : 85;
  const avgVentilation = layout.rooms.filter(r => r.category !== 'outdoor').length > 0 ? Math.round(ventilationScore / layout.rooms.filter(r => r.category !== 'outdoor').length) : 80;

  const naturalLighting: MetricCategory = {
    score: avgLighting,
    status: avgLighting > 80 ? 'excellent' : avgLighting > 60 ? 'good' : 'moderate',
    rooms: lightingRooms
  };

  const ventilation: MetricCategory = {
    score: avgVentilation,
    status: avgVentilation > 80 ? 'excellent' : avgVentilation > 60 ? 'good' : 'moderate',
    rooms: ventilationRooms
  };

  // 4. Privacy
  let privacyScore = 85;
  const entrance = layout.rooms.find(r => r.name.toLowerCase().includes('entrance') || r.name.toLowerCase().includes('porch'));
  layout.rooms.forEach(room => {
    if (room.category === 'sleeping' && entrance) {
      // Basic distance check
      const dist = Math.sqrt(Math.pow(room.x - entrance.x, 2) + Math.pow(room.y - entrance.y, 2));
      if (dist < 10) {
        privacyScore -= 10;
        issues.push({ severity: 'Medium', category: 'Privacy', description: `${room.name} is too close to the main entrance.`, recommendation: 'Move bedroom deeper into the house for acoustic and visual privacy.' });
      }
    }
  });

  const privacy: MetricCategory = { score: Math.max(0, privacyScore), status: privacyScore > 80 ? 'excellent' : 'moderate' };

  // 5. Circulation
  let circulationScore = 90;
  if (circulationArea / builtUpArea > 0.3) {
    circulationScore = 70;
    issues.push({ severity: 'Low', category: 'Circulation', description: 'High percentage of circulation area.', recommendation: 'Reduce corridor lengths to increase usable room space.' });
  }

  const circulation: MetricCategory = { score: circulationScore, status: circulationScore > 80 ? 'good' : 'moderate' };

  // 6. Staircase
  let stairScore = 100;
  const stairs = layout.rooms.filter(r => r.name.toLowerCase().includes('stair'));
  if (layout.floors && layout.floors.length > 1 && stairs.length < 2) {
    stairScore = 0;
    issues.push({ severity: 'High', category: 'Circulation', description: 'Multi-story building lacks stacked staircases.', recommendation: 'Ensure staircase is present on all floors.' });
  }
  const staircase: MetricCategory = { score: stairScore, status: stairScore === 100 ? 'good' : 'needs_attention' };

  // 7. Parking & Outdoor
  let parkingScore = parkingArea > 0 ? 100 : 50;
  const parking: MetricCategory = { score: parkingScore, status: parkingArea > 0 ? 'good' : 'limited' };
  
  let outdoorScore = gardenArea > 0 ? 100 : (coverageRatio < 0.9 ? 70 : 40);
  const outdoorSpace: MetricCategory = { score: outdoorScore, status: outdoorScore > 80 ? 'good' : 'limited' };

  // 8. Energy & Accessibility (Mocked deterministically based on previous metrics)
  const energyScore = Math.round((avgLighting + avgVentilation) / 2);
  const energyEfficiency: MetricCategory = { score: energyScore, status: energyScore > 80 ? 'excellent' : 'good' };
  
  const accessibility: MetricCategory = { score: 85, status: 'good' }; // Without door widths, assume good default

  // Overall
  const overallScore = Math.round((spaceEfficiency.score + naturalLighting.score + ventilation.score + privacy.score + circulation.score) / 5);

  if (overallScore > 85) recommendations.push('The current layout is highly efficient and architecturally sound.');
  else recommendations.push('Review the highlighted issues to improve the practical livability of the design.');

  return {
    overallScore,
    spaceEfficiency,
    naturalLighting,
    ventilation,
    circulation,
    privacy,
    accessibility,
    energyEfficiency,
    parking,
    outdoorSpace,
    staircase,
    issues,
    recommendations
  };
}
