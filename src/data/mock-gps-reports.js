import { format, startOfDay, subDays } from 'date-fns';
import { getGpsUnits } from './mock-gps';

// Daily operation stats per demo unit for the last 30 days, deterministic so reports
// match between visits. Today is partial and follows each unit's current progress.

const DAYS = 30;
const PLAN_KMH = 72;
const KM_PER_LITER = 2.6;
const SPEEDING_DRIVERS = new Set(['drv_1', 'drv_6']);

// FNV-1a with a final mix, so similar keys (consecutive dates) still spread evenly in [0, 1).
const rand = (seed) => {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 15;
  h = Math.imul(h, 2246822507);
  h ^= h >>> 13;
  return (h >>> 0) / 4294967296;
};

const dayStats = (unit, dayIndex) => {
  const date = startOfDay(subDays(new Date(), dayIndex));
  const key = `${unit.id}:${format(date, 'yyyy-MM-dd')}`;
  const r = rand(key);
  const isToday = dayIndex === 0;
  // Idle units work fewer days; everyone rests about one day a week.
  const resting = !isToday && (r < (unit.status === 'idle' ? 0.45 : 0.14));
  const plannedKm = resting ? 0 : unit.route.distanceKm;
  const km = resting
    ? 0
    : Math.round(isToday ? unit.progress * unit.route.distanceKm : plannedKm * (0.92 + rand(`${key}:km`) * 0.12));
  const movingMinutes = Math.round((km / (PLAN_KMH + 8)) * 60);
  const stops = km ? 1 + Math.floor(rand(`${key}:stops`) * 4) : 0;
  const unauthorizedStops = (isToday && unit.id === 'gps_4') || (km && rand(`${key}:ua`) > 0.9) ? 1 : 0;
  const speeding = km ? Math.floor(rand(`${key}:sp`) * (SPEEDING_DRIVERS.has(unit.driverId) ? 5 : 2)) : 0;
  const deviationKm = km ? Math.round(rand(`${key}:dev`) * 9 * 10) / 10 : 0;
  const delayMinutes = km ? Math.round(-15 + rand(`${key}:delay`) * 70 + unauthorizedStops * 35) : 0;

  return {
    date: format(date, 'yyyy-MM-dd'),
    unitId: unit.id,
    unitEco: unit.eco,
    unitPlate: unit.plate,
    driverName: unit.driver?.name || '',
    km,
    plannedKm: isToday ? Math.round(unit.progress * plannedKm) : plannedKm,
    movingMinutes,
    stoppedMinutes: km ? stops * 18 + unauthorizedStops * 40 : 0,
    stops,
    unauthorizedStops,
    speeding,
    dieselLiters: Math.round(km / KM_PER_LITER),
    deviationKm,
    delayMinutes,
  };
};

let cache = null;

export const getGpsDailyStats = () => {
  cache =
    cache ||
    getGpsUnits().flatMap((unit) => Array.from({ length: DAYS }, (_, dayIndex) => dayStats(unit, dayIndex)));
  return cache;
};
