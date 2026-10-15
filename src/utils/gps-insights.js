// Geofence, hot-route, traffic and ETA helpers for the GPS demo module.
import { addMinutes } from 'date-fns';
import { haversineKm } from './gps-route';

export const TRAFFIC_LEVELS = {
  free: { label: 'Fluido', color: 'success', factor: 1 },
  moderate: { label: 'Moderado', color: 'warning', factor: 0.65 },
  heavy: { label: 'Denso', color: 'error', factor: 0.35 },
};

export const HOTSPOT_LEVELS = {
  high: { label: 'Riesgo alto', color: 'error' },
  medium: { label: 'Riesgo medio', color: 'warning' },
};

// `stopAllowed`: a unit may stop inside this zone without raising an unauthorized-stop alert.
export const GEOFENCE_TYPES = {
  yard: { label: 'Patio', color: 'primary', stopAllowed: true },
  port: { label: 'Puerto', color: 'info', stopAllowed: true },
  client: { label: 'Cliente', color: 'success', stopAllowed: true },
  customs: { label: 'Aduana', color: 'warning', stopAllowed: true },
  rest: { label: 'Zona de descanso', color: 'success', stopAllowed: true },
  restricted: { label: 'Prohibido detenerse', color: 'error', stopAllowed: false },
};

// Average speed dispatch uses when a trip is planned.
export const PLAN_AVG_KMH = 72;
// Cruise speed assumed for units that are not moving right now.
const DEFAULT_CRUISE_KMH = 80;
// Extra time assumed for a unit that is stopped on the road.
const STOP_HOLD_MINUTES = 25;

const inRange = (progress, segment) => progress >= segment.from && progress < segment.to;

export const trafficAt = (traffic, routeId, progress) =>
  traffic.find((segment) => segment.routeId === routeId && inRange(progress, segment))?.level || 'free';

// Distance from a point to a polyline, in km, using a local flat approximation (fine at corridor scale).
export const distanceToPolylineKm = (position, points) => {
  const kmPerDeg = 111.32;
  const kx = Math.cos((position[0] * Math.PI) / 180) * kmPerDeg;
  const toXY = ([lat, lng]) => [lng * kx, lat * kmPerDeg];
  const [px, py] = toXY(position);
  return points.slice(1).reduce((best, point, i) => {
    const [ax, ay] = toXY(points[i]);
    const [bx, by] = toXY(point);
    const dx = bx - ax;
    const dy = by - ay;
    const lengthSq = dx * dx + dy * dy || 1;
    const t = Math.min(1, Math.max(0, ((px - ax) * dx + (py - ay) * dy) / lengthSq));
    return Math.min(best, Math.hypot(px - (ax + t * dx), py - (ay + t * dy)));
  }, Infinity);
};

// How close a unit must be to a hand-drawn hot route to count as inside it.
export const MANUAL_HOTSPOT_BUFFER_KM = 6;

// Computed stretches match by route progress; hand-drawn ones match by distance to the drawn line.
export const hotspotAt = (hotspots, unit) =>
  hotspots.find((spot) =>
    spot.source === 'manual'
      ? unit.position && distanceToPolylineKm(unit.position, spot.points) <= MANUAL_HOTSPOT_BUFFER_KM
      : spot.routeId === unit.route.id && inRange(unit.progress, spot)
  ) || null;

export const geofenceAt = (geofences, position) =>
  (position && geofences.find((fence) => haversineKm(position, fence.center) <= fence.radiusKm)) || null;

// Driving time from `from` to the end of the route: free-flow minutes plus extra minutes lost to traffic.
export const remainingDriveMinutes = (route, from, traffic, cruiseKmh) => {
  const remainingKm = (1 - from) * route.distanceKm;
  const freeMinutes = (remainingKm / cruiseKmh) * 60;
  const trafficMinutes = traffic
    .filter((segment) => segment.routeId === route.id)
    .reduce((sum, segment) => {
      const km = Math.max(0, segment.to - Math.max(segment.from, from)) * route.distanceKm;
      const slowKmh = cruiseKmh * TRAFFIC_LEVELS[segment.level].factor;
      return sum + (km / slowKmh - km / cruiseKmh) * 60;
    }, 0);
  return { remainingKm, freeMinutes, trafficMinutes };
};

/**
 * Estimated arrival for a trip given where its unit is now and current traffic.
 * Compares against the planned arrival (departure + distance at PLAN_AVG_KMH).
 */
export const estimateArrival = ({ unit, trip, traffic = [], now = new Date() }) => {
  const departedAt = new Date(trip.departedAt);
  const cruiseKmh = unit.speedKmh || DEFAULT_CRUISE_KMH;
  const progress = trip.status === 'scheduled' ? 0 : unit.progress;
  const { remainingKm, freeMinutes, trafficMinutes } = remainingDriveMinutes(
    unit.route,
    progress,
    traffic,
    cruiseKmh
  );
  const holdMinutes = unit.status === 'stopped' ? STOP_HOLD_MINUTES : 0;
  const start = departedAt > now ? departedAt : now;
  const eta = addMinutes(start, Math.round(freeMinutes + trafficMinutes + holdMinutes));
  const plannedEta = addMinutes(departedAt, Math.round((unit.route.distanceKm / PLAN_AVG_KMH) * 60));

  return {
    eta: eta.toISOString(),
    plannedEta: plannedEta.toISOString(),
    delayMinutes: Math.round((eta - plannedEta) / 60000),
    trafficMinutes: Math.round(trafficMinutes),
    remainingKm: Math.round(remainingKm),
  };
};

export const formatDuration = (totalMinutes) => {
  const minutes = Math.round(Math.abs(totalMinutes));
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours ? `${hours} h ${rest} min` : `${rest} min`;
};

// Label and color for a delay against plan, with a 10-minute tolerance.
export const delayInfo = (delayMinutes) => {
  if (delayMinutes > 10) return { label: `+${formatDuration(delayMinutes)} vs plan`, color: 'error' };
  if (delayMinutes < -10) return { label: `${formatDuration(delayMinutes)} antes del plan`, color: 'success' };
  return { label: 'A tiempo', color: 'success' };
};
