import { create } from 'zustand';

interface OptimizationState {
  lockedRooms: string[];
  toggleRoomLock: (roomId: string) => void;
  isRoomLocked: (roomId: string) => boolean;
}

export const useOptimizationStore = create<OptimizationState>((set, get) => ({
  lockedRooms: [],
  toggleRoomLock: (roomId) => {
    const locked = get().lockedRooms;
    if (locked.includes(roomId)) {
      set({ lockedRooms: locked.filter(id => id !== roomId) });
    } else {
      set({ lockedRooms: [...locked, roomId] });
    }
  },
  isRoomLocked: (roomId) => get().lockedRooms.includes(roomId)
}));
