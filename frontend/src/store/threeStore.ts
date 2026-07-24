import { create } from 'zustand';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';
export type CameraMode = 'orbit' | 'first-person';
export type InteriorTheme = 'modern' | 'minimal' | 'luxury' | 'industrial' | 'scandinavian' | 'japandi' | 'traditional';

export interface ThreeState {
  showRoof: boolean;
  showLabels: boolean;
  showShadows: boolean;
  transparentWalls: boolean;
  wireframe: boolean;
  timeOfDay: TimeOfDay;
  cameraMode: CameraMode;
  theme: InteriorTheme;
  
  // Toggles
  toggleRoof: () => void;
  toggleLabels: () => void;
  toggleShadows: () => void;
  toggleTransparentWalls: () => void;
  toggleWireframe: () => void;
  
  // Setters
  setTimeOfDay: (time: TimeOfDay) => void;
  setCameraMode: (mode: CameraMode) => void;
  setTheme: (theme: InteriorTheme) => void;
}

export const useThreeStore = create<ThreeState>((set) => ({
  showRoof: true,
  showLabels: true,
  showShadows: true,
  transparentWalls: false,
  wireframe: false,
  timeOfDay: 'afternoon',
  cameraMode: 'orbit',
  theme: 'modern',
  
  toggleRoof: () => set((state) => ({ showRoof: !state.showRoof })),
  toggleLabels: () => set((state) => ({ showLabels: !state.showLabels })),
  toggleShadows: () => set((state) => ({ showShadows: !state.showShadows })),
  toggleTransparentWalls: () => set((state) => ({ transparentWalls: !state.transparentWalls })),
  toggleWireframe: () => set((state) => ({ wireframe: !state.wireframe })),
  
  setTimeOfDay: (timeOfDay) => set({ timeOfDay }),
  setCameraMode: (cameraMode) => set({ cameraMode }),
  setTheme: (theme) => set({ theme }),
}));
