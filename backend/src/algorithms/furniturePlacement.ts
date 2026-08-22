import { RoomDimensions, Furniture, LightFixture, Decoration } from '../shared/types';

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Deterministically places furniture inside a room to avoid overlap.
 * Uses a simple packing along walls and in the center.
 */
export function placeFurniture(room: RoomDimensions, furnitureItems: any[]): Furniture[] {
  const placed: Furniture[] = [];
  
  // Basic layout zones inside the room (relative coordinates 0 to room.width, 0 to room.length)
  // Let's place large items along the walls, and central items in the middle.
  
  const centerX = room.width / 2;
  const centerY = room.length / 2;

  // X tracks along top/bottom wall, Y tracks along left/right wall
  let wallOffsetTopX = 1;
  let wallOffsetBottomX = 1;
  let wallOffsetLeftY = 1;
  let wallOffsetRightY = 1;

  for (const item of furnitureItems) {
    let x = centerX;
    let y = centerY;
    let rotation = 0;

    const lowerType = item.type.toLowerCase();

    if (lowerType.includes('bed') || lowerType.includes('sofa') || lowerType.includes('tv') || lowerType.includes('wardrobe') || lowerType.includes('cabinet') || lowerType.includes('counter')) {
      // Place against a wall
      if (wallOffsetTopX + item.width < room.width) {
        // Top Wall (Y = 0)
        x = wallOffsetTopX + (item.width / 2);
        y = 0.5 + (item.length / 2);
        rotation = 0;
        wallOffsetTopX += item.width + 1;
      } else if (wallOffsetLeftY + item.width < room.length) {
        // Left Wall (X = 0), rotated -90 degrees
        x = 0.5 + (item.length / 2);
        y = wallOffsetLeftY + (item.width / 2);
        rotation = -Math.PI / 2;
        wallOffsetLeftY += item.width + 1;
      } else if (wallOffsetRightY + item.width < room.length) {
        // Right Wall (X = room.width), rotated 90 degrees
        x = room.width - 0.5 - (item.length / 2);
        y = wallOffsetRightY + (item.width / 2);
        rotation = Math.PI / 2;
        wallOffsetRightY += item.width + 1;
      } else if (wallOffsetBottomX + item.width < room.width) {
        // Bottom Wall (Y = room.length), rotated 180 degrees
        x = wallOffsetBottomX + (item.width / 2);
        y = room.length - 0.5 - (item.length / 2);
        rotation = Math.PI;
        wallOffsetBottomX += item.width + 1;
      } else {
        // Fallback to center
        x = centerX;
        y = centerY;
      }
    } else {
      // Center items like coffee tables, dining tables, rugs
      x = centerX + (Math.random() * 2 - 1);
      y = centerY + (Math.random() * 2 - 1);
    }

    placed.push({
      id: generateId(),
      type: item.type,
      width: item.width,
      length: item.length,
      height: item.height,
      style: item.style,
      color: item.color,
      x,
      y,
      z: 0, // Z is height from floor
      rotation
    });
  }

  return placed;
}

export function placeLighting(room: RoomDimensions, lights: any[]): LightFixture[] {
  return lights.map((light, index) => {
    let x = room.width / 2;
    let y = room.length / 2;
    let z = 9; // Ceiling height approx 10

    if (light.type === 'wall') {
      x = 0.5;
      z = 6;
    } else if (light.type === 'table') {
      x = 2;
      y = 2;
      z = 3;
    }

    // Distribute ceiling lights if multiple
    if (light.type === 'ceiling' && lights.length > 1) {
      x = (room.width / (lights.length + 1)) * (index + 1);
    }

    return {
      id: generateId(),
      type: light.type,
      intensity: light.intensity,
      color: light.color,
      x,
      y,
      z
    };
  });
}

export function placeDecorations(room: RoomDimensions, decorations: any[]): Decoration[] {
  return decorations.map((dec, index) => {
    let x = room.width - 2;
    let y = room.length - 2;
    let z = 0;

    if (dec.type.toLowerCase().includes('painting') || dec.type.toLowerCase().includes('mirror')) {
      z = 5;
      x = 0.1; // On wall
    } else if (dec.type.toLowerCase().includes('carpet') || dec.type.toLowerCase().includes('rug')) {
      x = room.width / 2;
      y = room.length / 2;
      z = 0.01; // Slightly above floor
    } else {
      // Plants, etc. Corners
      x = (index % 2 === 0) ? 1 : room.width - 1;
      y = (index < 2) ? 1 : room.length - 1;
    }

    return {
      id: generateId(),
      type: dec.type,
      scale: dec.scale,
      x,
      y,
      z
    };
  });
}
