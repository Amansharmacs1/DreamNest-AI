import { create } from 'zustand';

interface Room {
  id: string;
  name: string;
  category: string;
  floor: number;
  x: number;
  y: number;
  width: number;
  length: number;
  furniture?: any[];
  lighting?: any[];
  decorations?: any[];
  materials?: { floor: string; wall: string };
  designNotes?: string;
  costEstimate?: { furniture: number; materials: number; decorations: number; total: number; currency: string };
}

export interface LayoutState {
  layout: {
    plotDimensions: { width: number; length: number; unit: string };
    usableArea: { width: number; length: number; startX: number; startY: number };
    rooms: Room[];
  } | null;
  history: any[]; // For undo
  future: any[]; // For redo
  selectedRoomId: string | null;
  setLayout: (layout: any) => void;
  setSelectedRoom: (id: string | null) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  layout: null,
  history: [],
  future: [],
  selectedRoomId: null,
  setLayout: (layout) => set({ layout, history: [], future: [], selectedRoomId: null }),
  setSelectedRoom: (id) => set({ selectedRoomId: id }),
  updateRoom: (id, updates) => set((state) => {
    if (!state.layout) return state;
    
    // Save to history before mutating
    const newHistory = [...state.history, state.layout];
    
    const newRooms = state.layout.rooms.map(room => 
      room.id === id ? { ...room, ...updates } : room
    );
    
    return {
      layout: { ...state.layout, rooms: newRooms },
      history: newHistory,
      future: [] // clear redo stack on new action
    };
  }),
  undo: () => set((state) => {
    if (state.history.length === 0) return state;
    const prev = state.history[state.history.length - 1];
    const newHistory = state.history.slice(0, state.history.length - 1);
    return {
      layout: prev,
      history: newHistory,
      future: [state.layout, ...state.future]
    };
  }),
  redo: () => set((state) => {
    if (state.future.length === 0) return state;
    const next = state.future[0];
    const newFuture = state.future.slice(1);
    return {
      layout: next,
      history: [...state.history, state.layout],
      future: newFuture
    };
  }),
  reset: () => set({ layout: null, history: [], future: [] })
}));
