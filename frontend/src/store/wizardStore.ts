import { create } from 'zustand';

export interface WizardState {
  step: number;
  preferences: {
    plot: {
      width: number;
      length: number;
      unit: string;
      facingDirection: string;
      cornerPlot: boolean;
      budget: string;
    };
    building: {
      numberOfFloors: number;
      houseStyle: string;
    };
    rooms: {
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
    };
    outdoor: {
      parking: boolean;
      numberOfCars: number;
      garden: boolean;
      backyard: boolean;
      swimmingPool: boolean;
      kidsArea: boolean;
      outdoorSeating: boolean;
      solarPanels: boolean;
      rainwaterHarvesting: boolean;
    };
    preferences: {
      vastuRequired: boolean;
      wheelchairFriendly: boolean;
      petFriendly: boolean;
      naturalLightingPriority: boolean;
      crossVentilationPriority: boolean;
      futureExpansion: boolean;
      smartHomeReady: boolean;
      additionalNotes: string;
    };
  };
  setStep: (step: number) => void;
  updatePreferences: (stepKey: string, data: any) => void;
}

const defaultPreferences = {
  plot: { width: 40, length: 60, unit: 'Feet', facingDirection: 'North', cornerPlot: false, budget: 'Medium' },
  building: { numberOfFloors: 1, houseStyle: 'Modern' },
  rooms: { bedrooms: 2, bathrooms: 2, livingRooms: 1, kitchen: 1, diningRoom: 1, studyRoom: 0, office: 0, prayerRoom: 0, storeRoom: 1, laundry: 0, balcony: 0, terrace: 0 },
  outdoor: { parking: true, numberOfCars: 1, garden: false, backyard: false, swimmingPool: false, kidsArea: false, outdoorSeating: false, solarPanels: false, rainwaterHarvesting: false },
  preferences: { vastuRequired: false, wheelchairFriendly: false, petFriendly: false, naturalLightingPriority: false, crossVentilationPriority: false, futureExpansion: false, smartHomeReady: false, additionalNotes: '' },
};

export const useWizardStore = create<WizardState>((set) => ({
  step: 1,
  preferences: defaultPreferences,
  setStep: (step) => set({ step }),
  updatePreferences: (stepKey, data) => set((state) => ({
    preferences: {
      ...state.preferences,
      [stepKey]: {
        ...state.preferences[stepKey as keyof typeof state.preferences],
        ...data
      }
    }
  })),
}));
