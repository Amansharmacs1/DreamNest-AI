import { create } from 'zustand';
import { ProjectStorageService } from '../services/projectStorage';
import type { Project } from '../types/project';

export type SyncStatus = 'idle' | 'saving' | 'saved' | 'error';

interface ProjectState {
  currentProjectId: string | null;
  currentProjectName: string;
  syncStatus: SyncStatus;
  lastSavedAt: Date | null;
  
  setCurrentProjectId: (id: string | null) => void;
  setCurrentProjectName: (name: string) => void;
  setSyncStatus: (status: SyncStatus) => void;
  setLastSavedAt: (date: Date) => void;
  
  // High-level operations
  saveCurrentProject: (data: Partial<Project>) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  currentProjectId: null,
  currentProjectName: 'Untitled Design',
  syncStatus: 'idle',
  lastSavedAt: null,
  
  setCurrentProjectId: (id) => set({ currentProjectId: id }),
  setCurrentProjectName: (name) => set({ currentProjectName: name }),
  setSyncStatus: (status) => set({ syncStatus: status }),
  setLastSavedAt: (date) => set({ lastSavedAt: date }),
  
  saveCurrentProject: async (data) => {
    const { currentProjectId, currentProjectName } = get();
    set({ syncStatus: 'saving' });
    
    try {
      if (currentProjectId) {
        // Update existing
        const existing = await ProjectStorageService.loadProject(currentProjectId);
        if (existing) {
          const updated: Project = { ...existing, ...data, updatedAt: Date.now() };
          await ProjectStorageService.saveProject(updated);
        }
      } else {
        // Create new
        const newId = crypto.randomUUID();
        const newProject: Project = {
          id: newId,
          name: currentProjectName,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          preferences: data.preferences || null,
          layout: data.layout || null,
          interior: data.interior || null,
          analysis: data.analysis || null,
          versions: [],
        };
        await ProjectStorageService.saveProject(newProject);
        set({ currentProjectId: newId });
      }
      
      set({ syncStatus: 'saved', lastSavedAt: new Date() });
      setTimeout(() => set({ syncStatus: 'idle' }), 2000);
    } catch (error) {
      console.error('Failed to save project to IndexedDB:', error);
      set({ syncStatus: 'error' });
    }
  },
}));
