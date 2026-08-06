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

  let wallOffsetTop = 1;
  let wallOffsetBottom = room.length - 1;
  let wallOffsetLeft = 1;
  let wallOffsetRight = room.width - 1;

  for (const item of furnitureItems) {
    let x = centerX;
    let y = centerY;
    let rotation = 0;

    const lowerType = item.type.toLowerCase();

    if (lowerType.includes('bed') || lowerType.includes('sofa') || lowerType.includes('tv') || lowerType.includes('wardrobe')) {
      // Place against a wall
      if (wallOffsetTop < room.length / 2) {
        x = centerX;
        y = wallOffsetTop + (item.length / 2);
        rotation = 0;
        wallOffsetTop += item.length + 1; // space for next
      } else if (wallOffsetBottom > room.length / 2) {
        x = centerX;
        y = wallOffsetBottom - (item.length / 2);
        rotation = Math.PI; // Face opposite
        wallOffsetBottom -= item.length + 1;
      } else if (wallOffsetLeft < room.width / 2) {
        x = wallOffsetLeft + (item.width / 2);
        y = centerY;
        rotation = -Math.PI / 2;
        wallOffsetLeft += item.width + 1;
      } else {
        // Fallback to center
        x = centerX;
        y = centerY;
      }
    } else {
      // Center items like coffee tables, dining tables, rugs
      x = centerX + (Math.random() * 2 - 1); // slight jitter to avoid exact overlap if multiple
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
