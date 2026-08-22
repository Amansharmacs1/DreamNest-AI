const testAPI = async () => {
  try {
    const preferences = {
      building: { numberOfFloors: 1 },
      plot: { width: 100, length: 100, unit: 'Feet' },
      rooms: {
        kitchen: 1,
        livingRooms: 1,
        bedrooms: 2,
        bathrooms: 1,
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
    
    console.log("Sending request to http://localhost:5001/api/layout/generate");
    const response = await fetch('http://localhost:5001/api/layout/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preferences)
    });
    
    const data = await response.json();
    console.log("Response status:", response.status);
    if (!response.ok) {
      console.log("Error data:", data);
    } else {
      console.log("Rooms:", data.rooms?.length);
    }
  } catch (error: any) {
    console.error("Fetch Error:", error.message);
  }
};

testAPI();
