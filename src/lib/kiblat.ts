/**
 * Coordinates of the Kaaba in Mecca
 */
const KAABA_COORDS = {
  lat: 21.422487,
  lon: 39.826206,
};

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Convert radians to degrees
 */
function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Calculate the Qibla direction using the Great Circle formula.
 * This uses spherical trigonometry to find the initial bearing from
 * the observer's location to the Kaaba.
 *
 * @param lat - Observer's latitude in degrees
 * @param lon - Observer's longitude in degrees
 * @returns Qibla direction in degrees (0-360, clockwise from North)
 */
export function calculateQiblaDirection(lat: number, lon: number): number {
  const φ1 = toRadians(lat);
  const φ2 = toRadians(KAABA_COORDS.lat);
  const Δλ = toRadians(KAABA_COORDS.lon - lon);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  const θ = Math.atan2(y, x);
  const bearing = toDegrees(θ);

  // Normalize to 0-360 range
  return (bearing + 360) % 360;
}

/**
 * Calculate the great circle distance between two points using the Haversine formula.
 *
 * @param lat1 - First point latitude in degrees
 * @param lon1 - First point longitude in degrees
 * @param lat2 - Second point latitude in degrees
 * @param lon2 - Second point longitude in degrees
 * @returns Distance in kilometers
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers

  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2 - lat1);
  const Δλ = toRadians(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Get the distance to the Kaaba from the observer's location.
 *
 * @param lat - Observer's latitude in degrees
 * @param lon - Observer's longitude in degrees
 * @returns Distance to Kaaba in kilometers
 */
export function getDistanceToKaaba(lat: number, lon: number): number {
  return calculateDistance(lat, lon, KAABA_COORDS.lat, KAABA_COORDS.lon);
}
