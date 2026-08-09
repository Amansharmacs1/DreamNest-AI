import { create } from 'zustand';

export type SyncStatus = 'idle' | 'saving' | 'saved' | 'error';

interface CloudProjectState {
  currentProjectId: string | null;
  syncStatus: SyncStatus;
  lastSavedAt: Date | null;
  
  setCurrentProjectId: (id: string | null) => void;
  setSyncStatus: (status: SyncStatus) => void;
  setLastSavedAt: (date: Date) => void;
}

export const useCloudProjectStore = create<CloudProjectState>((set) => ({
  currentProjectId: null,
  syncStatus: 'idle',
  lastSavedAt: null,
  
  setCurrentProjectId: (id) => set({ currentProjectId: id }),
  setSyncStatus: (status) => set({ syncStatus: status }),
  setLastSavedAt: (date) => set({ lastSavedAt: date }),
}));
