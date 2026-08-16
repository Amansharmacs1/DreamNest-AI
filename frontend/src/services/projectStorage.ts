import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { Project, ProjectVersion } from '../types/project';

const DB_NAME = 'nivasa-projects-db';
const STORE_NAME = 'projects';
const DB_VERSION = 1;

interface NivasaDB extends DBSchema {
  projects: {
    key: string;
    value: Project;
    indexes: {
      'by-updatedAt': number;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<NivasaDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<NivasaDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('by-updatedAt', 'updatedAt');
        }
      },
    });
  }
  return dbPromise;
}

export const ProjectStorageService = {
  async saveProject(project: Project): Promise<void> {
    const db = await getDB();
    project.updatedAt = Date.now();
    await db.put(STORE_NAME, project);
  },

  async loadProject(id: string): Promise<Project | undefined> {
    const db = await getDB();
    return db.get(STORE_NAME, id);
  },

  async listProjects(): Promise<Project[]> {
    const db = await getDB();
    // Get all and sort by updatedAt descending
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('by-updatedAt');
    let cursor = await index.openCursor(null, 'prev');
    const projects: Project[] = [];
    
    while (cursor) {
      projects.push(cursor.value);
      cursor = await cursor.continue();
    }
    
    return projects;
  },

  async deleteProject(id: string): Promise<void> {
    const db = await getDB();
    await db.delete(STORE_NAME, id);
  },

  async duplicateProject(id: string): Promise<Project | undefined> {
    const db = await getDB();
    const original = await this.loadProject(id);
    if (!original) return undefined;

    const newId = crypto.randomUUID();
    const duplicate: Project = {
      ...original,
      id: newId,
      name: `${original.name} - Copy`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      shareId: undefined, // Do not duplicate public share status
      versions: [] // Reset versions or copy them? Let's reset for a clean start
    };

    await db.put(STORE_NAME, duplicate);
    return duplicate;
  },
  
  async saveVersion(projectId: string, versionName: string): Promise<Project | undefined> {
    const project = await this.loadProject(projectId);
    if (!project) return undefined;
    
    const newVersion: ProjectVersion = {
      id: crypto.randomUUID(),
      name: versionName,
      timestamp: Date.now(),
      layout: project.layout ? JSON.parse(JSON.stringify(project.layout)) : null,
    };
    
    project.versions = [...(project.versions || []), newVersion];
    await this.saveProject(project);
    return project;
  }
};
