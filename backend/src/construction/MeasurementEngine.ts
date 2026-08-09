export interface MeasurementResult {
  plotArea: number;
  builtUpArea: number;
  carpetArea: number;
  usableArea: number;
  circulationArea: number;
  wallArea: number;
  floorArea: number;
  roofArea: number;
  wallVolume: number;
  totalExternalWallLength: number;
  totalInternalWallLength: number;
  roomMeasurements: Record<string, RoomMeasurement>;
  schedules: {
    doors: any[];
    windows: any[];
  }
}

export interface RoomMeasurement {
  id: string;
  name: string;
  floor: number;
  length: number;
  width: number;
  area: number;
  perimeter: number;
  flooringRequired: number;
  ceilingRequired: number;
  paintArea: number;
  windows: any[];
  doors: any[];
}

export function generateMeasurements(layout: any): MeasurementResult {
  const CEILING_HEIGHT = 10; // 10 ft
  const EXTERNAL_WALL_THICKNESS = 0.75; // 9 inches = 0.75 ft
  const INTERNAL_WALL_THICKNESS = 0.33; // 4 inches = 0.33 ft

  let builtUpArea = 0;
  let carpetArea = 0;
  let circulationArea = 0;
  
  let totalExternalWallLength = 0;
  let totalInternalWallLength = 0;
  
  const roomMeasurements: Record<string, RoomMeasurement> = {};
  const doorSchedule: any[] = [];
  const windowSchedule: any[] = [];

  // Plot Area
  const plotArea = (layout.plotDimensions?.width || 0) * (layout.plotDimensions?.length || 0);
  const usableArea = (layout.usableArea?.width || 0) * (layout.usableArea?.length || 0);

  layout.rooms.forEach((room: any, index: number) => {
    const rArea = room.width * room.length;
    const rPerimeter = 2 * (room.width + room.length);
    
    builtUpArea += rArea; // Approximation (should include walls in real-world, but simple here)
    if (room.category === 'circulation' || room.name.toLowerCase().includes('corridor') || room.name.toLowerCase().includes('stair')) {
      circulationArea += rArea;
    } else {
      carpetArea += rArea;
    }

    // Windows & Doors mock logic if not provided by layout
    // In DreamNest AI, we procedurally generate these in the 3D engine, but here we can heuristically assume them based on room position
    const hasExternalWall = 
      room.x <= (layout.usableArea?.startX || 0) + 2 ||
      room.y <= (layout.usableArea?.startY || 0) + 2 ||
      room.x + room.width >= (layout.usableArea?.startX || 0) + (layout.usableArea?.width || 0) - 2 ||
      room.y + room.length >= (layout.usableArea?.startY || 0) + (layout.usableArea?.length || 0) - 2;

    const windows = [];
    if (hasExternalWall && room.category !== 'circulation') {
      const windowWidth = 4;
      const windowHeight = 4;
      windows.push({ id: `W${index+1}`, type: 'Standard Window', room: room.name, width: windowWidth, height: windowHeight, orientation: 'External' });
      windowSchedule.push(windows[0]);
    }

    const doors = [];
    const doorWidth = 3;
    const doorHeight = 7;
    doors.push({ id: `D${index+1}`, type: 'Standard Door', room: room.name, width: doorWidth, height: doorHeight });
    doorSchedule.push(doors[0]);

    // Wall deductions
    const doorArea = doors.reduce((acc, d) => acc + (d.width * d.height), 0);
    const windowArea = windows.reduce((acc, w) => acc + (w.width * w.height), 0);
    const paintArea = (rPerimeter * CEILING_HEIGHT) - doorArea - windowArea;

    // Approximate internal vs external walls for this room
    let extWall = 0;
    if (hasExternalWall) {
      extWall = room.width; // rough approx of 1 side exposed
      totalExternalWallLength += extWall;
      totalInternalWallLength += (rPerimeter - extWall) / 2; // dividing by 2 to prevent double counting shared walls
    } else {
      totalInternalWallLength += rPerimeter / 2;
    }

    // Flooring and Ceiling
    // Add 8% wastage
    const flooringRequired = rArea * 1.08;
    const ceilingRequired = rArea * 1.05;

    roomMeasurements[room.id] = {
      id: room.id,
      name: room.name,
      floor: room.floor,
      length: room.length,
      width: room.width,
      area: rArea,
      perimeter: rPerimeter,
      flooringRequired,
      ceilingRequired,
      paintArea,
      windows,
      doors
    };
  });

  const wallArea = (totalExternalWallLength * CEILING_HEIGHT) + (totalInternalWallLength * CEILING_HEIGHT);
  const wallVolume = (totalExternalWallLength * CEILING_HEIGHT * EXTERNAL_WALL_THICKNESS) + 
                     (totalInternalWallLength * CEILING_HEIGHT * INTERNAL_WALL_THICKNESS);

  return {
    plotArea,
    usableArea,
    builtUpArea,
    carpetArea,
    circulationArea,
    wallArea,
    floorArea: builtUpArea,
    roofArea: builtUpArea,
    wallVolume,
    totalExternalWallLength,
    totalInternalWallLength,
    roomMeasurements,
    schedules: {
      doors: doorSchedule,
      windows: windowSchedule
    }
  };
}
