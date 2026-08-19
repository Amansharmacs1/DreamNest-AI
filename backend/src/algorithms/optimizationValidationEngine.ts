import { RoomConstraint } from '../optimization/geminiDesignCriticService';

export function validateOptimizationCandidate(
  baseLayout: any,
  candidateLayout: any,
  constraints: RoomConstraint[]
): { valid: boolean; reason?: string } {
  const lockedRoomIds = constraints.filter(c => c.locked).map(c => c.id);

  // 1. Check if any locked room was modified
  for (const roomId of lockedRoomIds) {
    const baseRoom = baseLayout.rooms.find((r: any) => r.id === roomId);
    const candRoom = candidateLayout.rooms.find((r: any) => r.id === roomId);

    if (!baseRoom) continue; // Should not happen, but safeguard

    if (!candRoom) {
      return { valid: false, reason: `Locked room ${roomId} was deleted.` };
    }

    // Geometry check
    if (
      baseRoom.x !== candRoom.x ||
      baseRoom.y !== candRoom.y ||
      baseRoom.width !== candRoom.width ||
      baseRoom.length !== candRoom.length
    ) {
      return { 
        valid: false, 
        reason: `Locked room ${baseRoom.name} was moved or resized during legalization.` 
      };
    }
  }

  // 2. Check for missing rooms
  if (baseLayout.rooms.length !== candidateLayout.rooms.length) {
    return { valid: false, reason: 'Mismatch in total room count.' };
  }

  // 3. Check for unresolved overlaps
  for (let i = 0; i < candidateLayout.rooms.length; i++) {
    for (let j = i + 1; j < candidateLayout.rooms.length; j++) {
      const r1 = candidateLayout.rooms[i];
      const r2 = candidateLayout.rooms[j];

      if (r1.floor !== r2.floor) continue;

      const overlapX = Math.max(0, Math.min(r1.x + r1.width, r2.x + r2.width) - Math.max(r1.x, r2.x));
      const overlapY = Math.max(0, Math.min(r1.y + r1.length, r2.y + r2.length) - Math.max(r1.y, r2.y));

      if (overlapX > 0 && overlapY > 0) {
        return { 
          valid: false, 
          reason: `Irreparable overlap detected between ${r1.name} and ${r2.name}.` 
        };
      }
    }
  }

  return { valid: true };
}
