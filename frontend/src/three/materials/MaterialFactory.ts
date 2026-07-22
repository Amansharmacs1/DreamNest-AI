import * as THREE from 'three';

// Cache for materials to avoid recompiling shaders for every mesh
const materialCache: Record<string, THREE.Material> = {};

export type MaterialType = 'wall' | 'floor_living' | 'floor_sleeping' | 'floor_service' | 'floor_outdoor' | 'roof' | 'door' | 'glass' | 'grass' | 'concrete';

export const getMaterial = (type: MaterialType, transparent = false): THREE.Material => {
  const cacheKey = `${type}_${transparent}`;
  
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
        color: '#f8fafc',
        roughness: 0.9,
      });
      break;
    case 'floor_living':
      material = new THREE.MeshStandardMaterial({
        ...baseConfig,
        color: '#d1bfae', // Wood-like
        roughness: 0.4,
      });
      break;
    case 'floor_sleeping':
      material = new THREE.MeshStandardMaterial({
        ...baseConfig,
        color: '#e5e7eb', // Carpet-like
        roughness: 0.9,
      });
      break;
    case 'floor_service':
      material = new THREE.MeshStandardMaterial({
        ...baseConfig,
        color: '#9ca3af', // Tile-like
        roughness: 0.2,
      });
      break;
    case 'floor_outdoor':
    case 'concrete':
      material = new THREE.MeshStandardMaterial({
        ...baseConfig,
        color: '#cbd5e1', // Concrete
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
        color: '#78350f', // Dark wood
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
    default:
      material = new THREE.MeshStandardMaterial(baseConfig);
  }

  materialCache[cacheKey] = material;
  return material;
};
