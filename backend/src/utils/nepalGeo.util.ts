export const NEPAL_BOUNDS = Object.freeze({
  south: 26.0,
  west: 79.8,
  north: 30.7,
  east: 88.4,
});

export function isWithinNepalCoordinates(
  latitude: number,
  longitude: number,
): boolean {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= NEPAL_BOUNDS.south &&
    latitude <= NEPAL_BOUNDS.north &&
    longitude >= NEPAL_BOUNDS.west &&
    longitude <= NEPAL_BOUNDS.east
  );
}
