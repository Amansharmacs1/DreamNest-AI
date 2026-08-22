import { generateDeterministicLayout } from '../backend/src/algorithms/layoutEngine';

const preferences = {
  building: { numberOfFloors: 1 },
  plot: { width: 50, length: 100, unit: 'Feet' },
  rooms: {
    kitchen: 1,
    livingRooms: 1,
    bedrooms: 2,
    bathrooms: 2,
    studyRoom: 0,
    office: 0,
    prayerRoom: 0,
    storeRoom: 0,
    laundry: 0,
    balcony: 0
  },
  stairs: { stairType: 'Auto' },
  budget: { maxBudget: 100000 },
  vastu: { enabled: true }
};

try {
  const layout = generateDeterministicLayout(preferences as any);
  console.log("Success:", layout.rooms.length, "rooms generated");
} catch (e) {
  console.error("Error generating layout:", e);
}
