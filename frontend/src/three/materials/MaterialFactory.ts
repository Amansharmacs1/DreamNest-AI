import * as THREE from 'three';
import type { InteriorTheme } from '@/store/threeStore';

// Cache for materials to avoid recompiling shaders for every mesh
const materialCache: Record<string, THREE.Material> = {};

export type MaterialType = 'wall' | 'floor_living' | 'floor_sleeping' | 'floor_service' | 'floor_outdoor' | 'roof' | 'door' | 'glass' | 'grass' | 'concrete' | 'boundary' | 'road' | 'wood' | 'metal';

export const getMaterial = (type: MaterialType, transparent = false, theme: InteriorTheme = 'modern'): THREE.Material => {
  const cacheKey = `${type}_${transparent}_${theme}`;
  
  if (materialCache[cacheKey]) {
    return materialCache[cacheKey];
  }

  let material: THREE.Material;

  const baseConfig: THREE.MeshStandardMaterialParameters = {
    roughness: 0.8,
    metalness: 0.1,
    transparent: transparent,
    opacity: transparent ? 0.3 : 1.0,
    side: THREE.DoubleSide,
  };

  switch (type) {
    case 'wall':
      material = new THREE.MeshStandardMaterial({
        ...baseConfig,
        color: getThemeColor(theme, 'wall'),
        roughness: theme === 'luxury' ? 0.4 : 0.9, // Luxury walls have a slight sheen
      });
      break;
    case 'floor_living':
      material = new THREE.MeshStandardMaterial({
        ...baseConfig,
        color: getThemeColor(theme, 'floor_living'),
        roughness: theme === 'luxury' ? 0.1 : 0.4, // Luxury has glossy floors (marble-like)
        metalness: theme === 'luxury' ? 0.3 : 0.1,
      });
      break;
    case 'floor_sleeping':
      material = new THREE.MeshStandardMaterial({
        ...baseConfig,
        color: getThemeColor(theme, 'floor_sleeping'),
        roughness: 0.9, // Carpet-like
      });
      break;
    case 'floor_service':
      material = new THREE.MeshStandardMaterial({
        ...baseConfig,
        color: getThemeColor(theme, 'floor_service'),
        roughness: 0.2, // Tile-like
      });
      break;
    case 'floor_outdoor':
    case 'concrete':
      material = new THREE.MeshStandardMaterial({
        ...baseConfig,
        color: '#94a3b8', // Concrete gray
        roughness: 0.9,
      });
      break;
    case 'boundary':
      material = new THREE.MeshStandardMaterial({
        ...baseConfig,
        color: '#cbd5e1', // Light concrete wall
        roughness: 1.0,
      });
      break;
    case 'road':
      material = new THREE.MeshStandardMaterial({
        ...baseConfig,
        color: '#334155', // Dark asphalt
        roughness: 0.9,
      });
      break;
    case 'roof':
      material = new THREE.MeshStandardMaterial({
        ...baseConfig,
        color: '#475569', // Dark Slate
        roughness: 0.8,
      });
      break;
    case 'door':
      material = new THREE.MeshStandardMaterial({
        ...baseConfig,
        color: theme === 'scandinavian' ? '#fcd34d' : '#78350f', // Light vs Dark wood
        roughness: 0.6,
      });
      break;
    case 'glass':
      material = new THREE.MeshPhysicalMaterial({
        ...baseConfig,
        color: '#bae6fd',
        metalness: 0.1,
        roughness: 0.1,
        transmission: 0.9, // glass effect
        thickness: 0.1,
        transparent: true,
        opacity: 1,
      });
      break;
    case 'grass':
      material = new THREE.MeshStandardMaterial({
        ...baseConfig,
        color: '#4ade80',
        roughness: 1.0,
      });
      break;
    case 'wood':
      material = new THREE.MeshStandardMaterial({
        ...baseConfig,
        color: '#8b5a2b', // Wood brown
        roughness: 0.7,
      });
      break;
    case 'metal':
      material = new THREE.MeshStandardMaterial({
        ...baseConfig,
        color: '#9ca3af', // Metallic gray
        metalness: 0.8,
        roughness: 0.2,
      });
      break;
    default:
      material = new THREE.MeshStandardMaterial(baseConfig);
  }

  materialCache[cacheKey] = material;
  return material;
};

function getThemeColor(theme: InteriorTheme, materialType: string): string {
  const palettes: Record<InteriorTheme, Record<string, string>> = {
    modern: {
      wall: '#f8fafc',
      floor_living: '#d1bfae', // Standard wood
      floor_sleeping: '#e5e7eb', // Light gray carpet
      floor_service: '#9ca3af', // Gray tile
    },
    minimal: {
      wall: '#ffffff', // Pure white
      floor_living: '#e2e8f0', // Very light wood/concrete
      floor_sleeping: '#f1f5f9', // White carpet
      floor_service: '#cbd5e1', // Light gray tile
    },
    luxury: {
      wall: '#fdfbf7', // Warm off-white
      floor_living: '#1e293b', // Dark glossy marble
      floor_sleeping: '#334155', // Plush dark carpet
      floor_service: '#0f172a', // Black marble
    },
    industrial: {
      wall: '#94a3b8', // Concrete walls
      floor_living: '#475569', // Dark concrete floor
      floor_sleeping: '#64748b', // Gray carpet
      floor_service: '#334155', // Dark industrial tile
    },
    scandinavian: {
      wall: '#ffffff',
      floor_living: '#fef3c7', // Very light ash wood
      floor_sleeping: '#f8fafc', // White wool carpet
      floor_service: '#e2e8f0', // Light slate
    },
    japandi: {
      wall: '#fdf6e3', // Warm beige
      floor_living: '#d4a373', // Warm bamboo/wood
      floor_sleeping: '#faedcd', // Warm sand carpet
      floor_service: '#ccd5ae', // Earthy green/gray tile
    },
    traditional: {
      wall: '#fef08a', // Pale yellow/cream
      floor_living: '#78350f', // Dark rich oak
      floor_sleeping: '#b45309', // Warm brown carpet
      floor_service: '#f59e0b', // Terracotta tile
    }
  };

  return palettes[theme]?.[materialType] || '#cccccc';
}
