export interface Material {
  id: string;
  name: string;
  category: string;
  unit: string;
  basePrice: number;
  wastagePercent: number;
}

// Configurable baseline rates (e.g. in INR or generic currency units)
export const defaultMaterialLibrary: Material[] = [
  // Civil
  { id: 'mat_civil_brick', name: 'Red Bricks', category: 'Civil', unit: 'sqft', basePrice: 120, wastagePercent: 5 },
  { id: 'mat_civil_concrete', name: 'RCC Concrete', category: 'Civil', unit: 'cuft', basePrice: 200, wastagePercent: 5 },
  { id: 'mat_civil_plaster', name: 'Cement Plaster', category: 'Civil', unit: 'sqft', basePrice: 40, wastagePercent: 5 },
  
  // Flooring
  { id: 'mat_floor_vitrified', name: 'Vitrified Tiles', category: 'Flooring', unit: 'sqft', basePrice: 65, wastagePercent: 8 },
  { id: 'mat_floor_marble', name: 'Italian Marble', category: 'Flooring', unit: 'sqft', basePrice: 350, wastagePercent: 12 },
  { id: 'mat_floor_wood', name: 'Wooden Laminate', category: 'Flooring', unit: 'sqft', basePrice: 120, wastagePercent: 5 },
  
  // Paint
  { id: 'mat_paint_interior', name: 'Interior Emulsion Paint', category: 'Paint', unit: 'sqft', basePrice: 15, wastagePercent: 5 },
  { id: 'mat_paint_exterior', name: 'Exterior Weatherproof Paint', category: 'Paint', unit: 'sqft', basePrice: 25, wastagePercent: 5 },
  
  // Ceiling
  { id: 'mat_ceil_gypsum', name: 'Gypsum False Ceiling', category: 'Ceiling', unit: 'sqft', basePrice: 85, wastagePercent: 5 },
  { id: 'mat_ceil_plaster', name: 'Plaster of Paris (POP)', category: 'Ceiling', unit: 'sqft', basePrice: 60, wastagePercent: 5 },

  // Doors/Windows
  { id: 'mat_door_main', name: 'Teak Wood Main Door', category: 'Doors', unit: 'item', basePrice: 25000, wastagePercent: 0 },
  { id: 'mat_door_internal', name: 'Flush Door', category: 'Doors', unit: 'item', basePrice: 6000, wastagePercent: 0 },
  { id: 'mat_window_upvc', name: 'UPVC Sliding Window', category: 'Windows', unit: 'item', basePrice: 8000, wastagePercent: 0 },

  // Electrical & Plumbing (Lump sum or per point)
  { id: 'mat_elec_point', name: 'Electrical Wiring & Switch (per point)', category: 'Electrical', unit: 'item', basePrice: 800, wastagePercent: 0 },
  { id: 'mat_plumb_point', name: 'Plumbing Point (CPVC)', category: 'Plumbing', unit: 'item', basePrice: 2500, wastagePercent: 0 }
];

export function getMaterial(id: string): Material | undefined {
  return defaultMaterialLibrary.find(m => m.id === id);
}

export function getMaterialsByCategory(category: string): Material[] {
  return defaultMaterialLibrary.filter(m => m.category === category);
}
