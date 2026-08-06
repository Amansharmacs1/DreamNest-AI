export interface PlotPreferences {
  width: number;
  length: number;
  unit: 'Feet' | 'Meters' | 'Gaj';
  facingDirection: string;
  cornerPlot: boolean;
  budget: string;
}

export interface BuildingPreferences {
  numberOfFloors: number;
  houseStyle: string;
}

export interface RoomPreferences {
  bedrooms: number;
  bathrooms: number;
  livingRooms: number;
  kitchen: number;
  diningRoom: number;
  studyRoom: number;
  office: number;
  prayerRoom: number;
  storeRoom: number;
  laundry: number;
  balcony: number;
  terrace: number;
}

export interface OutdoorPreferences {
  parking: boolean;
  numberOfCars: number;
  garden: boolean;
  backyard: boolean;
  swimmingPool: boolean;
  kidsArea: boolean;
  outdoorSeating: boolean;
  solarPanels: boolean;
  rainwaterHarvesting: boolean;
}

export interface OtherPreferences {
  vastuRequired: boolean;
  wheelchairFriendly: boolean;
  petFriendly: boolean;
  naturalLightingPriority: boolean;
  crossVentilationPriority: boolean;
  futureExpansion: boolean;
  smartHomeReady: boolean;
  additionalNotes: string;
}

export interface HomePreferences {
  plot: PlotPreferences;
  building: BuildingPreferences;
  rooms: RoomPreferences;
  outdoor: OutdoorPreferences;
  preferences: OtherPreferences;
}

export interface WallOpening {
  id: string;
  type: 'door' | 'window';
  wall: 'top' | 'bottom' | 'left' | 'right';
  offset: number;
  width: number;
  height: number;
}

export interface RoomDimensions {
  id: string;
  name: string;
  category: 'living' | 'sleeping' | 'service' | 'outdoor' | 'circulation';
  floor?: number;
  stairStyle?: 'Straight' | 'L Shape' | 'U Shape';
  stairDirection?: 'north' | 'south' | 'east' | 'west';
  x: number;
  y: number;
  width: number;
  length: number;
  doors?: WallOpening[];
  windows?: WallOpening[];
}

export interface GeneratedLayout {
  plotDimensions: { width: number; length: number; unit: string };
  usableArea: { width: number; length: number; startX: number; startY: number };
  rooms: RoomDimensions[];
}
