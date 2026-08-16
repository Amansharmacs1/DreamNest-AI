import { GeneratedLayout, RoomDimensions, HomePreferences } from '../shared/types';

/**
 * Attempts to deterministically repair a Gemini-generated layout.
 * If the layout is fundamentally flawed, throws an Error so it can be regenerated.
 */
export function repairLayout(layout: GeneratedLayout, preferences: HomePreferences): GeneratedLayout {
  const { startX, startY, width: usableW, length: usableL } = layout.usableArea;
  const endX = startX + usableW;
  const endY = startY + usableL;

  // 1. Ensure basic fields and IDs
  layout.rooms.forEach((room: RoomDimensions, index: number) => {
    if (!room.id) room.id = `room-${index}-${Date.now()}`;
    room.x = Math.round(room.x);
    room.y = Math.round(room.y);
    room.width = Math.round(room.width);
    room.length = Math.round(room.length);

    // Enforce Minimum Dimensions (e.g., a room can't be 1x1)
    if (room.width < 3) room.width = 3;
    if (room.length < 3) room.length = 3;
  });

  // 2. Resolve Overlaps (Relaxation)
  const iterations = 15;
  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < layout.rooms.length; i++) {
      for (let j = i + 1; j < layout.rooms.length; j++) {
        const r1 = layout.rooms[i];
        const r2 = layout.rooms[j];
        
        // Only check same floor
        if (r1.floor !== r2.floor) continue;

        const overlapX = Math.max(0, Math.min(r1.x + r1.width, r2.x + r2.width) - Math.max(r1.x, r2.x));
        const overlapY = Math.max(0, Math.min(r1.y + r1.length, r2.y + r2.length) - Math.max(r1.y, r2.y));

        if (overlapX > 0 && overlapY > 0) {
          const r1IsStair = r1.name.toLowerCase().includes('stair');
          const r2IsStair = r2.name.toLowerCase().includes('stair');
          
          if (r1IsStair && r2IsStair) continue;
          
          const shiftX = Math.ceil(overlapX / 2);
          const shiftY = Math.ceil(overlapY / 2);

          if (overlapX < overlapY) {
            // Push horizontally
            if (!r1IsStair && !r2IsStair) {
              if (r1.x < r2.x) { r1.x -= shiftX; r2.x += shiftX; }
              else { r1.x += shiftX; r2.x -= shiftX; }
            } else if (r1IsStair) {
              if (r1.x < r2.x) r2.x += overlapX; else r2.x -= overlapX;
            } else {
              if (r2.x < r1.x) r1.x += overlapX; else r1.x -= overlapX;
            }
          } else {
            // Push vertically
            if (!r1IsStair && !r2IsStair) {
              if (r1.y < r2.y) { r1.y -= shiftY; r2.y += shiftY; }
              else { r1.y += shiftY; r2.y -= shiftY; }
            } else if (r1IsStair) {
              if (r1.y < r2.y) r2.y += overlapY; else r2.y -= overlapY;
            } else {
              if (r2.y < r1.y) r1.y += overlapY; else r1.y -= overlapY;
            }
          }
        }
      }
    }
  }

  // 3. Enforce Boundaries (Snap inside plot)
  layout.rooms.forEach((room: RoomDimensions) => {
    if (room.x < startX) room.x = startX;
    if (room.y < startY) room.y = startY;
    
    if (room.x + room.width > endX) {
      if (room.width > usableW) room.width = usableW; // Clamp size
      room.x = endX - room.width;
    }
    
    if (room.y + room.length > endY) {
      if (room.length > usableL) room.length = usableL; // Clamp size
      room.y = endY - room.length;
    }
  });
  
  // 4. Final Overlap Check (Reject if still overlapping)
  for (let i = 0; i < layout.rooms.length; i++) {
    for (let j = i + 1; j < layout.rooms.length; j++) {
      const r1 = layout.rooms[i];
      const r2 = layout.rooms[j];
      if (r1.floor !== r2.floor) continue;
      
      const overlapX = Math.max(0, Math.min(r1.x + r1.width, r2.x + r2.width) - Math.max(r1.x, r2.x));
      const overlapY = Math.max(0, Math.min(r1.y + r1.length, r2.y + r2.length) - Math.max(r1.y, r2.y));
      
      if (overlapX > 0 && overlapY > 0) {
        throw new Error(`Irreparable overlap detected between ${r1.name} and ${r2.name}`);
      }
    }
  }

  // 5. Build Floors Array for Phase 3 standard
  const numFloors = Math.max(1, preferences.building.numberOfFloors);
  layout.floors = [];
  for (let f = 0; f <= numFloors; f++) {
    const floorRooms = layout.rooms.filter(r => r.floor === f);
    if (floorRooms.length > 0 || f < numFloors) {
      layout.floors.push({
        floor: f,
        rooms: floorRooms
      });
    }
  }

  return layout;
}
