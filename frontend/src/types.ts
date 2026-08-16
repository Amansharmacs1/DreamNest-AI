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
  stairs?: any;
  rooms: RoomPreferences;
  outdoor: OutdoorPreferences;
  preferences: OtherPreferences;
}

export interface Furniture {
  id: string;
  type: string;
  x: number;
  y: number;
  z: number;
  rotation: number;
  width: number;
  length: number;
  height: number;
  style: string;
  color: string;
}

export interface LightFixture {
  id: string;
  type: 'ceiling' | 'wall' | 'table' | 'pendant';
  x: number;
  y: number;
  z: number;
  intensity: number;
  color: string;
}

export interface Decoration {
  id: string;
  type: 'plant' | 'painting' | 'mirror' | 'carpet' | 'shelf' | 'clock' | string;
  x: number;
  y: number;
  z: number;
  scale: number;
}

export interface RoomMaterials {
  floor: string;
  wall: string;
}

export interface CostEstimate {
  furniture: number;
  materials: number;
  decorations: number;
  total: number;
  currency: string;
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
  furniture?: Furniture[];
  lighting?: LightFixture[];
  decorations?: Decoration[];
  materials?: RoomMaterials;
  designNotes?: string;
  costEstimate?: CostEstimate;
}

export interface FloorPlan {
  floor: number;
  rooms: RoomDimensions[];
  stairs?: any[];
  doors?: any[];
  windows?: any[];
}

export interface DesignScore {
  overall: number;
  spaceEfficiency: number;
  circulation: number;
  lighting: number;
  ventilation: number;
  privacy: number;
}

export interface DesignMetadata {
  source: 'gemini' | 'deterministic';
  confidence: number;
  reasoning: string[];
  validated: boolean;
  score?: DesignScore;
  explanation?: string;
  variantName?: string;
}

export interface GeneratedLayout {
  plotDimensions: { width: number; length: number; unit: string };
  usableArea: { width: number; length: number; startX: number; startY: number };
  rooms: RoomDimensions[];
  floors?: FloorPlan[];
  metadata?: DesignMetadata;
}

export interface AnalysisIssue {
  severity: 'High' | 'Medium' | 'Low';
  category: 'Lighting' | 'Ventilation' | 'Circulation' | 'Privacy' | 'Accessibility' | 'Space' | 'Parking' | 'Energy' | 'Safety';
  description: string;
  recommendation: string;
}

export interface MetricCategory {
  score: number;
  status: 'excellent' | 'good' | 'moderate' | 'tight' | 'limited' | 'needs_attention';
  metrics?: any;
  rooms?: any[];
  issues?: AnalysisIssue[];
  recommendations?: string[];
}

export interface AnalysisResult {
  overallScore: number;
  spaceEfficiency: MetricCategory;
  naturalLighting: MetricCategory;
  ventilation: MetricCategory;
  circulation: MetricCategory;
  privacy: MetricCategory;
  accessibility: MetricCategory;
  energyEfficiency: MetricCategory;
  parking: MetricCategory;
  outdoorSpace: MetricCategory;
  staircase: MetricCategory;
  issues: AnalysisIssue[];
  recommendations: string[];
  explanation?: string; // Gemini explanation of the overall score
}
