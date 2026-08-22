import * as THREE from 'three';
import type { InteriorTheme } from '@/store/threeStore';
import { createProceduralTexture } from './TextureGenerator';

// Cache for materials to avoid recompiling shaders for every mesh
const materialCache: Record<string, THREE.Material> = {};

export type MaterialType = 'wall' | 'floor_living' | 'floor_sleeping' | 'floor_service' | 'floor_outdoor' | 'roof' | 'door' | 'glass' | 'grass' | 'concrete' | 'boundary' | 'road' | 'wood' | 'metal' | 'pool_water' | 'pool_tile' | 'solar_pv' | 'solar_frame' | 'fabric';

export const getMaterial = (type: MaterialType, transparent = false, wireframe = false, theme: InteriorTheme = 'modern'): THREE.Material => {
  const cacheKey = `${type}_${transparent}_${wireframe}_${theme}`;
  
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
    wireframe: wireframe,
  };

  switch (type) {
    case 'wall':
      material = new THREE.MeshStandardMaterial({
        ...baseConfig,
        color: getThemeColor(theme, 'wall'),
        roughness: theme === 'luxury' ? 0.3 : 0.95, // Luxury walls have a slight sheen
        map: theme !== 'luxury' ? createProceduralTexture('concrete', getThemeColor(theme, 'wall')) : null,
      });
      break;
    case 'floor_living':
      const isWood = theme === 'modern' || theme === 'scandinavian' || theme === 'japandi' || theme === 'traditional';
      material = new THREE.MeshStandardMaterial({
        ...baseConfig,
        color: getThemeColor(theme, 'floor_living'),
        roughness: theme === 'luxury' ? 0.05 : 0.3, // Luxury has glossy floors
        metalness: theme === 'luxury' ? 0.4 : 0.1,
        map: isWood ? createProceduralTexture('wood', getThemeColor(theme, 'floor_living')) : createProceduralTexture('concrete', getThemeColor(theme, 'floor_living')),
      });
      break;
    case 'floor_sleeping':
      material = new THREE.MeshStandardMaterial({
        ...baseConfig,
        color: getThemeColor(theme, 'floor_sleeping'),
        roughness: 0.95, // Carpet-like
        map: createProceduralTexture('fabric', getThemeColor(theme, 'floor_sleeping')),
      });
      break;
    case 'floor_service':
      material = new THREE.MeshStandardMaterial({
        ...baseConfig,
        color: getThemeColor(theme, 'floor_service'),
        roughness: 0.15, // Tile-like glossy
        metalness: 0.1,
        map: createProceduralTexture('tile', getThemeColor(theme, 'floor_service')),
      });
      break;
    case 'floor_outdoor':
    case 'concrete':
      material = new THREE.MeshStandardMaterial({
        ...baseConfig,
        color: '#94a3b8',
        roughness: 0.9,
        map: createProceduralTexture('concrete', '#94a3b8'),
      });
      break;
    case 'boundary':
      material = new THREE.MeshStandardMaterial({
        ...baseConfig,
        color: '#cbd5e1',
        roughness: 1.0,
        map: createProceduralTexture('concrete', '#cbd5e1'),
      });
      break;
    case 'road':
      material = new THREE.MeshStandardMaterial({
        ...baseConfig,
        color: '#1f2937',
        roughness: 0.9,
        map: createProceduralTexture('concrete', '#1f2937'),
      });
      break;
    case 'roof':
      material = new THREE.MeshStandardMaterial({
        ...baseConfig,
        color: '#475569',
        roughness: 0.8,
        map: createProceduralTexture('concrete', '#475569'),
      });
      break;
    case 'door':
      const doorColor = theme === 'scandinavian' ? '#fcd34d' : '#78350f';
      material = new THREE.MeshStandardMaterial({
        ...baseConfig,
        color: doorColor,
        roughness: 0.5,
        map: createProceduralTexture('wood', doorColor),
      });
      break;
    case 'wood':
      const woodColor = '#8b5a2b';
      material = new THREE.MeshStandardMaterial({
        ...baseConfig,
        color: woodColor,
        roughness: 0.6,
        map: createProceduralTexture('wood', woodColor),
      });
      break;
    case 'fabric':
      const fabricColor = '#cbd5e1';
      material = new THREE.MeshStandardMaterial({
        ...baseConfig,
        color: fabricColor,
        roughness: 0.9,
        map: createProceduralTexture('fabric', fabricColor),
      });
      break;
    case 'glass':
      material = new THREE.MeshPhysicalMaterial({
        ...baseConfig,
        color: '#e0f2fe',
        metalness: 0.2,
        roughness: 0.0,
        transmission: 0.95, // Realistic glass effect
        thickness: 0.05,
        transparent: true,
        opacity: 1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
      });
      break;
    case 'grass':
      material = new THREE.MeshStandardMaterial({
        ...baseConfig,
        color: '#4ade80',
        roughness: 1.0,
        map: createProceduralTexture('grass', '#4ade80'),
      });
      break;
    case 'metal':
      material = new THREE.MeshStandardMaterial({
        ...baseConfig,
        color: '#9ca3af',
        metalness: 0.9,
        roughness: 0.2,
      });
      break;
    case 'pool_water':
      material = new THREE.MeshPhysicalMaterial({
        ...baseConfig,
        color: '#38bdf8',
        metalness: 0.1,
        roughness: 0.0,
        transmission: 0.8,
        transparent: true,
        opacity: 0.8,
        clearcoat: 1.0,
        clearcoatRoughness: 0.0,
      });
      break;
    case 'pool_tile':
      material = new THREE.MeshStandardMaterial({
        ...baseConfig,
        color: '#0284c7',
        roughness: 0.2,
        map: createProceduralTexture('tile', '#0284c7'),
      });
      break;
    case 'solar_pv':
      material = new THREE.MeshStandardMaterial({
        ...baseConfig,
        color: '#1e3a8a',
        metalness: 0.95,
        roughness: 0.1,
      });
      break;
    case 'solar_frame':
      material = new THREE.MeshStandardMaterial({
        ...baseConfig,
        color: '#475569',
        metalness: 0.8,
        roughness: 0.3,
      });
      break;
    default:
      material = new THREE.MeshStandardMaterial(baseConfig);
  }

  materialCache[cacheKey] = material;
  return material;
};

export const createCustomFabricMaterial = (color: string, wireframe = false): THREE.Material => {
  return new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.9,
    wireframe,
    map: createProceduralTexture('fabric', color),
  });
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
