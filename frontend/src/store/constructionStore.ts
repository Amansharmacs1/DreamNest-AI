import { create } from 'zustand';

interface ConstructionState {
  isConstructionModeActive: boolean;
  measurements: any | null;
  estimate: any | null;
  aiAnalysis: any | null;
  isLoading: boolean;
  setConstructionMode: (active: boolean) => void;
  fetchConstructionData: (layout: any, budget?: number) => Promise<void>;
}

export const useConstructionStore = create<ConstructionState>((set) => ({
  isConstructionModeActive: false,
  measurements: null,
  estimate: null,
  aiAnalysis: null,
  isLoading: false,
  
  setConstructionMode: (active) => set({ isConstructionModeActive: active }),
  
  fetchConstructionData: async (layout, budget) => {
    set({ isLoading: true });
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/construction/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layout, budget })
      });
      
      if (!response.ok) throw new Error('Failed to fetch construction data');
      
      const data = await response.json();
      set({
        measurements: data.measurements,
        estimate: data.estimate,
        aiAnalysis: data.aiAnalysis,
        isLoading: false
      });
    } catch (error) {
      console.error(error);
      set({ isLoading: false });
    }
  }
}));
