import type { GeneratedLayout, AnalysisResult } from '../types';

// Simple helper to calculate sun position (azimuth and altitude)
export function getSunPosition(date: Date, latitude: number, _longitude: number, timeOfDayMinutes: number) {
  // This is a simplified calculation for simulation purposes.
  // Real solar calculations require complex astronomy algorithms (e.g., NOAA solar calculator).
  
  // Convert timeOfDayMinutes to hours
  const hours = timeOfDayMinutes / 60;
  
  // Declination of the sun (approximate)
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  const declination = 23.45 * Math.sin((360 / 365) * (dayOfYear - 81) * (Math.PI / 180));
  
  // Hour angle
  const solarTime = hours; // simplifying by ignoring equation of time and longitude corrections
  const hourAngle = 15 * (solarTime - 12);
  
  // Convert to radians
  const latRad = latitude * (Math.PI / 180);
  const decRad = declination * (Math.PI / 180);
  const haRad = hourAngle * (Math.PI / 180);
  
  // Altitude
  const sinAlt = Math.sin(latRad) * Math.sin(decRad) + Math.cos(latRad) * Math.cos(decRad) * Math.cos(haRad);
  const altitude = Math.asin(sinAlt);
  
  // Azimuth
  const cosAz = (Math.sin(decRad) - Math.sin(latRad) * Math.sin(altitude)) / (Math.cos(latRad) * Math.cos(altitude));
  let azimuth = Math.acos(Math.max(-1, Math.min(1, cosAz))); // clamp to [-1, 1] to avoid NaN
  
  if (hourAngle > 0) {
    azimuth = 2 * Math.PI - azimuth;
  }
  
  return {
    altitude: altitude, // radians
    azimuth: azimuth // radians
  };
}

export function analyzeLayout(layout: GeneratedLayout): AnalysisResult {
  // 1. Space Utilization
  const totalPlotArea = layout.plotDimensions.width * layout.plotDimensions.length;
  const builtUpArea = layout.rooms.reduce((sum, room) => sum + (room.width * room.length), 0);
  const circulationRooms = layout.rooms.filter(r => r.category === 'circulation');
  const circulationArea = circulationRooms.reduce((sum, room) => sum + (room.width * room.length), 0);
  const usableArea = builtUpArea - circulationArea;
  
  // Assuming anything not built up in the usable bounding box is wasted if it's too small to be a garden.
  // For simplicity, we'll define wasted as 5% of builtUp
  const wastedArea = builtUpArea * 0.05;

  // 2. Solar Potential
  // Estimate roof area as roughly equal to ground floor built-up area
  const groundFloorArea = layout.rooms
    .filter(r => (r.floor || 0) === 0)
    .reduce((sum, r) => sum + (r.width * r.length), 0);
  
  const panelCount = Math.floor(groundFloorArea * 0.3 / 20); // Assume 30% of roof is usable, each panel is 20 sq ft
  const estimatedMonthlyGeneration = panelCount * 30; // Approx 30 kWh per panel per month

  // 3. Ventilation & Sunlight (Simplified Mock Analysis based on windows)
  const ventilationRooms = layout.rooms.map(room => {
    const windowCount = room.windows?.length || 0;
    const doorCount = room.doors?.length || 0;
    
    // Check for opposite openings (basic check if window walls are opposite)
    let crossVentilation = false;
    if (windowCount > 1 || (windowCount > 0 && doorCount > 0)) {
       const wallsWithOpenings = new Set([
         ...(room.windows?.map(w => w.wall) || []),
         ...(room.doors?.map(d => d.wall) || [])
       ]);
       if ((wallsWithOpenings.has('top') && wallsWithOpenings.has('bottom')) ||
           (wallsWithOpenings.has('left') && wallsWithOpenings.has('right'))) {
         crossVentilation = true;
       }
    }
    
    return {
      roomId: room.id,
      crossVentilation,
      score: crossVentilation ? 95 : (windowCount > 0 ? 60 : 20)
    };
  });
  
  const avgVentilationScore = ventilationRooms.reduce((sum, r) => sum + r.score, 0) / (ventilationRooms.length || 1);

  const sunlightRooms = layout.rooms.map(room => {
    const windowCount = room.windows?.length || 0;
    // Mock score based on window count
    const score = Math.min(100, windowCount * 40);
    return {
      roomId: room.id,
      sunlightHours: windowCount * 3,
      score
    };
  });
  
  const avgSunlightScore = sunlightRooms.reduce((sum, r) => sum + r.score, 0) / (sunlightRooms.length || 1);

  // 4. Accessibility
  const accessibilityIssues: any[] = [];
  layout.rooms.forEach(room => {
    room.doors?.forEach(door => {
      if (door.width < 3) {
        accessibilityIssues.push({
          roomId: room.id,
          issue: `Door width (${door.width}ft) is narrow.`,
          severity: 'medium'
        });
      }
    });
    if (room.category === 'circulation' && Math.min(room.width, room.length) < 3.5) {
      accessibilityIssues.push({
        roomId: room.id,
        issue: `Corridor is too narrow for wheelchair access.`,
        severity: 'high'
      });
    }
  });

  const accessibilityScore = Math.max(0, 100 - (accessibilityIssues.length * 10));

  const energyScore = Math.round((avgVentilationScore + avgSunlightScore) / 2);

  return {
    spaceUtilization: {
      totalPlotArea,
      builtUpArea,
      usableArea,
      circulationArea,
      wastedArea
    },
    energy: {
      score: energyScore,
      solarPotential: {
        roofArea: groundFloorArea,
        panelCount,
        estimatedMonthlyGeneration
      }
    },
    ventilation: {
      score: Math.round(avgVentilationScore),
      rooms: ventilationRooms
    },
    sunlight: {
      score: Math.round(avgSunlightScore),
      rooms: sunlightRooms
    },
    accessibility: {
      score: accessibilityScore,
      issues: accessibilityIssues
    },
    aiSuggestions: [],
    overallScore: Math.round((energyScore + accessibilityScore + (usableArea/builtUpArea * 100)) / 3)
  };
}
