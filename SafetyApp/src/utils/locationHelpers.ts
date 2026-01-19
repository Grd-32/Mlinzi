// Distance calculation helper
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Format distance nicely
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
};

// Get bearing between two points
export const getBearing = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const dLon = lon2 - lon1;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  const bearing = Math.atan2(y, x) * (180 / Math.PI);
  return (bearing + 360) % 360;
};

// Get direction string from bearing
export const getDirectionFromBearing = (bearing: number): string => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(bearing / 22.5) % 16;
  return directions[index];
};

// Check if point is within circle
export const isPointInCircle = (
  pointLat: number,
  pointLon: number,
  circleLat: number,
  circleLon: number,
  radiusKm: number
): boolean => {
  const distance = calculateDistance(pointLat, pointLon, circleLat, circleLon);
  return distance <= radiusKm;
};

// Get center point between multiple coordinates
export const getCenterCoordinate = (coordinates: Array<{ lat: number; lon: number }>) => {
  if (coordinates.length === 0) return { latitude: 0, longitude: 0 };

  const avgLat = coordinates.reduce((sum, c) => sum + c.lat, 0) / coordinates.length;
  const avgLon = coordinates.reduce((sum, c) => sum + c.lon, 0) / coordinates.length;

  return { latitude: avgLat, longitude: avgLon };
};
