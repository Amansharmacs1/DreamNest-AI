export function calculateSunPosition(timeOfDay: string, facingDirection: string): [number, number, number] {
  let elevation = 0;
  let azimuth = 0;

  switch (timeOfDay) {
    case 'morning':
      elevation = Math.PI / 6; // 30 degrees
      azimuth = -Math.PI / 2; // East
      break;
    case 'afternoon':
      elevation = Math.PI / 2.5; // High up
      azimuth = 0; // South
      break;
    case 'evening':
      elevation = Math.PI / 6; // 30 degrees
      azimuth = Math.PI / 2; // West
      break;
    case 'night':
      elevation = -Math.PI / 4; // Below horizon
      azimuth = 0;
      break;
  }

  let directionOffset = 0;
  switch (facingDirection) {
    case 'North': directionOffset = 0; break;
    case 'East': directionOffset = Math.PI / 2; break;
    case 'South': directionOffset = Math.PI; break;
    case 'West': directionOffset = -Math.PI / 2; break;
    case 'North-East': directionOffset = Math.PI / 4; break;
    case 'North-West': directionOffset = -Math.PI / 4; break;
    case 'South-East': directionOffset = (3 * Math.PI) / 4; break;
    case 'South-West': directionOffset = -(3 * Math.PI) / 4; break;
  }

  const finalAzimuth = azimuth + directionOffset;
  const distance = 100;

  const y = distance * Math.sin(elevation);
  const x = distance * Math.cos(elevation) * Math.sin(finalAzimuth);
  const z = distance * Math.cos(elevation) * Math.cos(finalAzimuth);

  return [x, y, z];
}
