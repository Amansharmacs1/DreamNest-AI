import { create } from 'zustand';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';
export type CameraMode = 'orbit' | 'first-person';
export type InteriorTheme = 'modern' | 'minimal' | 'luxury' | 'industrial' | 'scandinavian' | 'japandi' | 'traditional';
export type QualityPreset = 'low' | 'medium' | 'high';

export interface ThreeState {
  showRoof: boolean;
  showLabels: boolean;
  showShadows: boolean;
  transparentWalls: boolean;
  wireframe: boolean;
  timeOfDay: TimeOfDay;
  cameraMode: CameraMode;
  theme: InteriorTheme;
  quality: QualityPreset;
  presentationMode: boolean;
  cinematicMode: boolean;
  targetCameraPosition: [number, number, number] | null;
  exportTrigger: number;
  screenshotTrigger: number;
  
  // Toggles
  toggleRoof: () => void;
  toggleLabels: () => void;
  toggleShadows: () => void;
  toggleTransparentWalls: () => void;
  toggleWireframe: () => void;
  togglePresentationMode: () => void;
  toggleCinematicMode: () => void;
  
  // Setters
  setTimeOfDay: (time: TimeOfDay) => void;
  setCameraMode: (mode: CameraMode) => void;
  setTheme: (theme: InteriorTheme) => void;
  setQuality: (quality: QualityPreset) => void;
  setTargetCameraPosition: (pos: [number, number, number] | null) => void;
  triggerExportGLTF: () => void;
  triggerScreenshot: () => void;
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
  quality: 'medium',
  presentationMode: false,
  cinematicMode: false,
  targetCameraPosition: null,
  exportTrigger: 0,
  screenshotTrigger: 0,
  
  toggleRoof: () => set((state) => ({ showRoof: !state.showRoof })),
  toggleLabels: () => set((state) => ({ showLabels: !state.showLabels })),
  toggleShadows: () => set((state) => ({ showShadows: !state.showShadows })),
  toggleTransparentWalls: () => set((state) => ({ transparentWalls: !state.transparentWalls })),
  toggleWireframe: () => set((state) => ({ wireframe: !state.wireframe })),
  togglePresentationMode: () => set((state) => ({ presentationMode: !state.presentationMode })),
  toggleCinematicMode: () => set((state) => ({ cinematicMode: !state.cinematicMode })),
  
  setTimeOfDay: (timeOfDay) => set({ timeOfDay }),
  setCameraMode: (cameraMode) => set({ cameraMode }),
  setTheme: (theme) => set({ theme }),
  setQuality: (quality) => set({ quality }),
  setTargetCameraPosition: (targetCameraPosition) => set({ targetCameraPosition }),
  triggerExportGLTF: () => set((state) => ({ exportTrigger: state.exportTrigger + 1 })),
  triggerScreenshot: () => set((state) => ({ screenshotTrigger: state.screenshotTrigger + 1 })),
}));
