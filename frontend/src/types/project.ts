import type { HomePreferences, GeneratedLayout, AnalysisResult } from '../types';

export interface ProjectVersion {
  id: string;
  name: string; // e.g., "Version 1", "AI Iteration"
  timestamp: number;
  layout: GeneratedLayout | null;
  // Interior data and other specifics could be added here later if we want full deep versioning,
  // but for lightweight history we just store the layout state.
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  
  // Data payloads
  preferences: HomePreferences | null;
  layout: GeneratedLayout | null;
  interior: any | null; // We can strongly type interior if we want, currently loosely typed
  analysis: AnalysisResult | null;
  
  // Metadata & History
  versions: ProjectVersion[];
  thumbnail?: string; // Data URL for 2D floorplan capture
  
  // Sharing
  shareId?: string; // If this project has been shared publicly, we cache the share ID
}
