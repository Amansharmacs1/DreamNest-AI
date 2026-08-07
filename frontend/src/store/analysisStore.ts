import { create } from 'zustand';
import type { AnalysisResult } from '../types';

export type HeatmapType = 'none' | 'sunlight' | 'ventilation' | 'energy' | 'accessibility';

export interface AnalysisState {
  // Environmental Variables
  latitude: number;
  longitude: number;
  date: Date;
  timeOfDayMinutes: number; // minutes from midnight, e.g. 720 = 12:00 PM
  plotOrientation: number; // degrees from North

  // Toggles & Modes
  isAnalysisModeActive: boolean;
  activeHeatmap: HeatmapType;
  showVentilationArrows: boolean;

  // Analysis Data
  analysisResult: AnalysisResult | null;
  isAnalyzing: boolean;

  // Actions
  setEnvironment: (env: Partial<{ latitude: number; longitude: number; date: Date; timeOfDayMinutes: number; plotOrientation: number }>) => void;
  setAnalysisMode: (active: boolean) => void;
  setActiveHeatmap: (type: HeatmapType) => void;
  toggleVentilationArrows: () => void;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  setIsAnalyzing: (analyzing: boolean) => void;
  resetAnalysis: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  latitude: 28.6139, // Default to New Delhi
  longitude: 77.2090,
  date: new Date(),
  timeOfDayMinutes: 720, // 12:00 PM
  plotOrientation: 0,
  
  isAnalysisModeActive: false,
  activeHeatmap: 'none',
  showVentilationArrows: false,
  
  analysisResult: null,
  isAnalyzing: false,

  setEnvironment: (env) => set((state) => ({ ...state, ...env })),
  setAnalysisMode: (active) => set({ isAnalysisModeActive: active }),
  setActiveHeatmap: (type) => set({ activeHeatmap: type }),
  toggleVentilationArrows: () => set((state) => ({ showVentilationArrows: !state.showVentilationArrows })),
  setAnalysisResult: (result) => set({ analysisResult: result }),
  setIsAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
  resetAnalysis: () => set({
    isAnalysisModeActive: false,
    activeHeatmap: 'none',
    showVentilationArrows: false,
    analysisResult: null,
    isAnalyzing: false
  })
}));
