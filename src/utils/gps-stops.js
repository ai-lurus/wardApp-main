// Unauthorized stop rule for the GPS demo.
import { haversineKm } from './gps-route';
import { GEOFENCE_TYPES } from './gps-insights';

export const DEFAULT_STOP_THRESHOLD_MINUTES = 15;

const fencesAt = (geofences, position) =>
  geofences.filter((fence) => haversineKm(position, fence.center) <= fence.radiusKm);

/**
 * A stopped unit raises an unauthorized stop when:
 * - it is inside a zone where stopping is not allowed (any duration), or
 * - it has been stopped longer than `thresholdMinutes` outside every zone where stopping is allowed.
 * Returns { minutes, reason, fence } or null.
 */
export const unauthorizedStopFor = (unit, geofences, thresholdMinutes) => {
  if (unit.status !== 'stopped' || !unit.position) return null;
  const minutes = Math.round(unit.stoppedMinutes || 0);
  const fences = fencesAt(geofences, unit.position);
  const restricted = fences.find((fence) => !GEOFENCE_TYPES[fence.type]?.stopAllowed);
  if (restricted) {
    return { minutes, fence: restricted, reason: `Detenida en zona prohibida: ${restricted.name}` };
  }
  const allowed = fences.some((fence) => GEOFENCE_TYPES[fence.type]?.stopAllowed);
  if (!allowed && minutes > thresholdMinutes) {
    return { minutes, fence: null, reason: `Detenida ${minutes} min fuera de una zona autorizada` };
  }
  return null;
};

// Adds `unauthorizedStop` to each unit so the map, list and counters can flag it.
export const withUnauthorizedStops = (units, geofences, thresholdMinutes) =>
  units.map((unit) => ({ ...unit, unauthorizedStop: unauthorizedStopFor(unit, geofences, thresholdMinutes) }));
