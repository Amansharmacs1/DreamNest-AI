import { HomePreferences, GeneratedLayout, RoomDimensions } from '../shared/types';

// Constants
const GRID_SIZE = 1; // 1 unit grid (e.g., 1 foot)
const WALL_THICKNESS = 0.5;

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function convertToFeet(value: number, unit: string): number {
  switch (unit.toLowerCase()) {
    case 'meters': return value * 3.28084;
    case 'gaj': return value * 3; // Approx depending on region, usually sq yards. But let's assume linear is sqrt(gaj)*3
    default: return value; // Feet
  }
}

export const generateDeterministicLayout = (preferences: HomePreferences): GeneratedLayout => {
  const plotWidth = convertToFeet(preferences.plot.width, preferences.plot.unit);
  const plotLength = convertToFeet(preferences.plot.length, preferences.plot.unit);

  // Setbacks (usable area calculation)
  // Assuming 10% setback on all sides for simplicity
  const setbackX = plotWidth * 0.1;
  const setbackY = plotLength * 0.1;
  
  const usableStartX = setbackX;
  const usableStartY = setbackY;
  const usableWidth = plotWidth - (2 * setbackX);
  const usableLength = plotLength - (2 * setbackY);

  const rooms: RoomDimensions[] = [];
  
  // Calculate total area for rough floor distribution
  let totalRequiredArea = 0;
  const numFloors = Math.max(1, preferences.building.numberOfFloors);

  // Staircase dimensions
  const hasStairs = numFloors > 1;
  const stairWidth = hasStairs ? 6 : 0;
  const stairLength = hasStairs ? 12 : 0;
  
  // Basic layout state
  let currentFloor = 0;
  let currentX = usableStartX;
  let currentY = usableStartY;
  
  // Reserve top-left corner of the plot for stairs if multiple floors exist
  if (hasStairs) {
    currentX = usableStartX + stairWidth;
  }

  let rowMaxHeight = hasStairs ? stairLength : 0;
  let currentFloorArea = hasStairs ? (stairWidth * stairLength) : 0;

  const calcArea = (w: number, l: number, count: number = 1) => totalRequiredArea += (w * l * count);
  
  if (preferences.rooms.kitchen > 0) calcArea(10, 10);
  if (preferences.rooms.diningRoom > 0) calcArea(12, 12);
  calcArea(15, 18, preferences.rooms.livingRooms);
  calcArea(12, 14, preferences.rooms.bedrooms);
  calcArea(6, 8, preferences.rooms.bathrooms); // Rough estimate for both attached and common
  if (preferences.rooms.studyRoom > 0) calcArea(10, 12);
  if (preferences.rooms.office > 0) calcArea(10, 12);
  if (preferences.rooms.prayerRoom > 0) calcArea(6, 6);
  if (preferences.rooms.storeRoom > 0) calcArea(8, 8);
  if (preferences.rooms.laundry > 0) calcArea(6, 6);
  if (preferences.rooms.balcony > 0) calcArea(10, 5);

  const targetAreaPerFloor = totalRequiredArea / numFloors;

  // Add the initial staircase for Ground Floor
  if (hasStairs) {
    rooms.push({
      id: generateId(),
      name: 'Staircase',
      category: 'circulation',
      stairStyle: (preferences.stairs?.stairType !== 'Auto' ? preferences.stairs?.stairType : 'U Shape') as any,
      stairDirection: 'north',
      floor: 0,
      x: usableStartX,
      y: usableStartY,
      width: stairWidth,
      length: stairLength
    });
  }

  // Helper to place a room
  const placeRoom = (name: string, category: RoomDimensions['category'], width: number, length: number) => {
    const roomArea = width * length;

    if (
      currentFloor < numFloors - 1 &&
      currentFloorArea + roomArea > targetAreaPerFloor * 1.1 // 10% buffer to avoid stranding small rooms
    ) {
      currentFloor++;
      
      // Inject the staircase for the new floor at the exact same location
      if (hasStairs) {
        rooms.push({
          id: generateId(),
          name: 'Staircase',
          category: 'circulation',
          stairStyle: (preferences.stairs?.stairType !== 'Auto' ? preferences.stairs?.stairType : 'U Shape') as any,
          stairDirection: 'north',
          floor: currentFloor,
          x: usableStartX,
          y: usableStartY,
          width: stairWidth,
          length: stairLength
        });
        currentFloorArea = stairWidth * stairLength;
        currentX = usableStartX + stairWidth;
        currentY = usableStartY;
        rowMaxHeight = stairLength;
      } else {
        currentFloorArea = 0;
        currentX = usableStartX;
        currentY = usableStartY;
        rowMaxHeight = 0;
      }
    }

    // Check if we exceed usable width, move to next row
    if (currentX + width > usableStartX + usableWidth) {
      currentX = usableStartX;
      currentY += rowMaxHeight;
      rowMaxHeight = 0;
    }

    // Check if we exceed usable length (throw or ignore for now)
    if (currentY + length > usableStartY + usableLength) {
      console.warn(`Room ${name} exceeds usable length. Plot might be too small.`);
    }

    rooms.push({
      id: generateId(),
      name,
      category,
      floor: currentFloor,
      x: currentX,
      y: currentY,
      width,
      length
    });

    currentX += width;
    currentFloorArea += roomArea;
    if (length > rowMaxHeight) {
      rowMaxHeight = length;
    }
  };

  // 1. Place Kitchen & Dining (Near each other)
  if (preferences.rooms.kitchen > 0) {
    placeRoom('Kitchen', 'service', 10, 10);
  }
  if (preferences.rooms.diningRoom > 0) {
    placeRoom('Dining Room', 'living', 12, 12);
  }

  // 2. Place Living Room
  if (preferences.rooms.livingRooms > 0) {
    for (let i = 0; i < preferences.rooms.livingRooms; i++) {
      placeRoom(`Living Room ${i + 1}`, 'living', 15, 18);
    }
  }

  // 3. Place Bedrooms and Bathrooms
  for (let i = 0; i < preferences.rooms.bedrooms; i++) {
    placeRoom(`Bedroom ${i + 1}`, 'sleeping', 12, 14);
    // Attach a bathroom if available (simplistic approach: just place it next)
    if (preferences.rooms.bathrooms > i) {
      placeRoom(`Attached Bath ${i + 1}`, 'service', 6, 8);
    }
  }

  // Remaining Bathrooms
  for (let i = preferences.rooms.bedrooms; i < preferences.rooms.bathrooms; i++) {
    placeRoom(`Common Bath ${i - preferences.rooms.bedrooms + 1}`, 'service', 6, 8);
  }

  // 4. Other Rooms
  if (preferences.rooms.studyRoom > 0) placeRoom('Study Room', 'living', 10, 12);
  if (preferences.rooms.office > 0) placeRoom('Office', 'living', 10, 12);
  if (preferences.rooms.prayerRoom > 0) placeRoom('Prayer Room', 'living', 6, 6);
  if (preferences.rooms.storeRoom > 0) placeRoom('Store Room', 'service', 8, 8);
  if (preferences.rooms.laundry > 0) placeRoom('Laundry', 'service', 6, 6);

  // 5. Outdoor spaces inside usable area (like balconies/terraces for 2D plan approximation)
  if (preferences.rooms.balcony > 0) placeRoom('Balcony', 'outdoor', 10, 5);

  // 6. Outdoor Preferences (Swimming Pool, Solar Panels, Garden, Parking, etc.)
  if (preferences.outdoor) {
    if (preferences.outdoor.swimmingPool) {
      placeRoom('Swimming Pool', 'outdoor', 14, 22);
    }
    if (preferences.outdoor.garden) {
      placeRoom('Garden', 'outdoor', 15, 15);
    }
    if (preferences.outdoor.backyard) {
      placeRoom('Backyard', 'outdoor', 15, 10);
    }
    if (preferences.outdoor.parking) {
      const cars = Math.max(1, preferences.outdoor.numberOfCars || 1);
      placeRoom('Parking', 'outdoor', Math.min(usableWidth, 12 * cars), 18);
    }
    if (preferences.outdoor.kidsArea) {
      placeRoom('Kids Play Area', 'outdoor', 12, 12);
    }
    if (preferences.outdoor.outdoorSeating) {
      placeRoom('Outdoor Patio', 'outdoor', 12, 14);
    }
    if (preferences.outdoor.rainwaterHarvesting) {
      placeRoom('Rainwater Tank', 'outdoor', 8, 8);
    }

    // Solar Panels placed on top rooftop level
    if (preferences.outdoor.solarPanels) {
      const topFloor = Math.max(0, numFloors - 1);
      rooms.push({
        id: generateId(),
        name: 'Solar Panels',
        category: 'outdoor',
        floor: topFloor,
        x: usableStartX + 2,
        y: usableStartY + 2,
        width: 12,
        length: 16
      });
    }
  }

  return {
    plotDimensions: {
      width: plotWidth,
      length: plotLength,
      unit: 'Feet' // Normalized to feet
    },
    usableArea: {
      width: usableWidth,
      length: usableLength,
      startX: usableStartX,
      startY: usableStartY
    },
    rooms
  };
};
