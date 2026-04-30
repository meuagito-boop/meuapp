type Coordinates = {
  latitude: number;
  longitude: number;
};

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

export function buildBoundingBox(origin: Coordinates, distanceKm: number) {
  const safeDistance = Math.max(distanceKm, 0.1);
  const latitudeDelta = safeDistance / 111;
  const cosine = Math.cos(toRadians(origin.latitude));
  const longitudeDelta = safeDistance / (111 * Math.max(Math.abs(cosine), 0.1));

  return {
    latitude: {
      gte: origin.latitude - latitudeDelta,
      lte: origin.latitude + latitudeDelta,
    },
    longitude: {
      gte: origin.longitude - longitudeDelta,
      lte: origin.longitude + longitudeDelta,
    },
  };
}

export function calculateDistanceKm(origin: Coordinates, target: Coordinates): number {
  const earthRadiusKm = 6371;
  const deltaLatitude = toRadians(target.latitude - origin.latitude);
  const deltaLongitude = toRadians(target.longitude - origin.longitude);
  const latitudeA = toRadians(origin.latitude);
  const latitudeB = toRadians(target.latitude);

  const haversine =
    Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2) +
    Math.cos(latitudeA) *
      Math.cos(latitudeB) *
      Math.sin(deltaLongitude / 2) *
      Math.sin(deltaLongitude / 2);

  const arc = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
  return earthRadiusKm * arc;
}

export function roundDistanceKm(distanceKm: number): number {
  return Math.round(distanceKm * 100) / 100;
}

export function hasCoordinates(
  value: { latitude?: number | null; longitude?: number | null } | null | undefined
): value is Coordinates {
  return (
    value != null &&
    typeof value.latitude === 'number' &&
    Number.isFinite(value.latitude) &&
    typeof value.longitude === 'number' &&
    Number.isFinite(value.longitude)
  );
}
