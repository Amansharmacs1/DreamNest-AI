import { MeasurementResult } from './MeasurementEngine';
import { defaultMaterialLibrary, Material } from './MaterialLibrary';

export interface BOQItem {
  id: string;
  category: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
  wastagePercent: number;
  notes?: string;
}

export interface CostEstimate {
  items: BOQItem[];
  subtotal: number;
  contingency: number;
  total: number;
  categoryBreakdown: Record<string, number>;
}

export function generateCostEstimate(measurements: MeasurementResult): CostEstimate {
  const items: BOQItem[] = [];

  const addItems = (materialId: string, quantity: number, description: string) => {
    const mat = defaultMaterialLibrary.find(m => m.id === materialId);
    if (!mat || quantity <= 0) return;

    const totalQty = quantity * (1 + (mat.wastagePercent / 100));
    const amount = totalQty * mat.basePrice;

    items.push({
      id: `${mat.id}_${Date.now()}_${Math.random()}`,
      category: mat.category,
      description,
      unit: mat.unit,
      quantity: parseFloat(totalQty.toFixed(2)),
      rate: mat.basePrice,
      amount: parseFloat(amount.toFixed(2)),
      wastagePercent: mat.wastagePercent
    });
  };

  // 1. Civil Work (Approximation)
  // Wall construction
  addItems('mat_civil_brick', measurements.wallArea, 'Brick masonry for internal and external walls');
  addItems('mat_civil_plaster', measurements.wallArea * 2, 'Cement plastering for walls (both sides)');
  
  // Foundation & Slabs (approx built up area)
  addItems('mat_civil_concrete', measurements.builtUpArea * 1.5, 'RCC for foundation, columns, and slabs');

  // 2. Room by Room Processing
  Object.values(measurements.roomMeasurements).forEach(room => {
    // Flooring
    let floorMat = 'mat_floor_vitrified'; // default
    if (room.name.toLowerCase().includes('master') || room.name.toLowerCase().includes('living')) {
      floorMat = 'mat_floor_marble';
    } else if (room.name.toLowerCase().includes('bed')) {
      floorMat = 'mat_floor_wood';
    }
    addItems(floorMat, room.area, `Flooring for ${room.name}`);

    // Ceiling
    addItems('mat_ceil_gypsum', room.area, `False ceiling for ${room.name}`);

    // Paint
    addItems('mat_paint_interior', room.paintArea, `Interior emulsion for ${room.name}`);
  });

  // Exterior Paint
  addItems('mat_paint_exterior', measurements.totalExternalWallLength * 10, 'Exterior weatherproof paint');

  // Doors & Windows
  measurements.schedules.doors.forEach((door: any, i: number) => {
    const isMain = door.room.toLowerCase().includes('living') || door.room.toLowerCase().includes('entrance');
    addItems(isMain ? 'mat_door_main' : 'mat_door_internal', 1, `${door.type} for ${door.room}`);
  });

  measurements.schedules.windows.forEach((win: any) => {
    addItems('mat_window_upvc', 1, `${win.type} for ${win.room}`);
  });

  // Conceptual Electrical & Plumbing (heuristics based on room count)
  const roomCount = Object.keys(measurements.roomMeasurements).length;
  // Assume ~6 points per room
  addItems('mat_elec_point', roomCount * 6, 'Electrical points (switches, sockets, lights)');
  // Assume ~3 plumbing points per bathroom/kitchen
  const wetRooms = Object.values(measurements.roomMeasurements).filter(r => 
    r.name.toLowerCase().includes('bath') || r.name.toLowerCase().includes('kitchen')
  ).length;
  addItems('mat_plumb_point', wetRooms * 3, 'Plumbing points (taps, drains)');


  // Calculation
  let subtotal = 0;
  const categoryBreakdown: Record<string, number> = {};

  items.forEach(item => {
    subtotal += item.amount;
    categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + item.amount;
  });

  const contingency = subtotal * 0.10; // 10% contingency
  const total = subtotal + contingency;

  return {
    items,
    subtotal,
    contingency,
    total,
    categoryBreakdown
  };
}
