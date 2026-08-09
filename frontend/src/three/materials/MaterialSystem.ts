import * as THREE from 'three';

// Procedural PBR Material Factory
// We reuse materials to reduce draw calls and memory overhead.

const createMaterial = (
  color: number | string,
  roughness: number,
  metalness: number,
  transparent = false,
  opacity = 1.0
) => {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness,
    metalness,
    transparent,
    opacity,
  });
};

const createPhysicalMaterial = (
  color: number | string,
  roughness: number,
  metalness: number,
  transmission: number,
  ior: number,
  thickness: number
) => {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    roughness,
    metalness,
    transmission,
    ior,
    thickness,
    transparent: true,
  });
};

export const Materials = {
  // Walls
  InteriorWallWhite: createMaterial(0xfdfdfd, 0.9, 0.0),
  InteriorWallWarm: createMaterial(0xfaf5eb, 0.9, 0.0),
  ExteriorWallPlaster: createMaterial(0xe8e6e1, 0.8, 0.1),
  ExteriorBrick: createMaterial(0x8a4b38, 0.9, 0.0),
  
  // Floors
  FloorWoodLight: createMaterial(0xc3a373, 0.4, 0.05),
  FloorWoodDark: createMaterial(0x5c4033, 0.3, 0.1),
  FloorTiles: createMaterial(0xe2e2e2, 0.1, 0.05),
  FloorMarble: createMaterial(0xf5f5f5, 0.05, 0.1),
  FloorConcrete: createMaterial(0x8c8c8c, 0.7, 0.1),
  
  // Outdoors
  Grass: createMaterial(0x4a7c36, 0.8, 0.0),
  Asphalt: createMaterial(0x333333, 0.8, 0.1),
  ConcretePath: createMaterial(0xa0a0a0, 0.7, 0.0),
  
  // Wood & Furniture
  WoodDark: createMaterial(0x3e2723, 0.6, 0.0),
  WoodLight: createMaterial(0xd7ccc8, 0.5, 0.0),
  FabricGray: createMaterial(0x757575, 0.9, 0.0),
  LeatherDark: createMaterial(0x212121, 0.3, 0.1),
  
  // Metals
  MetalDark: createMaterial(0x2c2c2c, 0.4, 0.8),
  MetalChrome: createMaterial(0xdddddd, 0.1, 0.9),
  AluminiumFrame: createMaterial(0x8a8d8f, 0.3, 0.7),
  
  // Glass (Using Physical Material for realistic refraction/transmission if supported, fallback to transparent)
  GlassWindow: createPhysicalMaterial(0xffffff, 0.0, 0.1, 0.95, 1.5, 0.05),
  GlassFrosted: createPhysicalMaterial(0xffffff, 0.4, 0.1, 0.8, 1.5, 0.1),
  
  // Roof
  RoofTiles: createMaterial(0x4a4a4a, 0.8, 0.0),
  RoofConcrete: createMaterial(0x777777, 0.9, 0.0),
};

// Helper to assign materials based on room type
export const getRoomFloorMaterial = (roomName: string) => {
  const name = roomName.toLowerCase();
  if (name.includes('bath') || name.includes('kitchen') || name.includes('utility')) return Materials.FloorTiles;
  if (name.includes('living') || name.includes('dining')) return Materials.FloorMarble;
  if (name.includes('bed')) return Materials.FloorWoodLight;
  if (name.includes('garage') || name.includes('parking')) return Materials.FloorConcrete;
  return Materials.FloorWoodLight;
};

export const getRoomWallMaterial = (roomName: string) => {
  const name = roomName.toLowerCase();
  if (name.includes('bath')) return Materials.FloorTiles; // Tiled walls
  if (name.includes('living') || name.includes('master')) return Materials.InteriorWallWarm;
  return Materials.InteriorWallWhite;
};
