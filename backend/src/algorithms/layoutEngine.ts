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
  
  // Basic layout state
  let currentX = usableStartX;
  let currentY = usableStartY;
  let rowMaxHeight = 0;

  // Helper to place a room
  const placeRoom = (name: string, category: RoomDimensions['category'], width: number, length: number) => {
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
      x: currentX,
      y: currentY,
      width,
      length
    });

    currentX += width;
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
