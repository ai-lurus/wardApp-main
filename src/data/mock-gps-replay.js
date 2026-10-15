import { addMinutes, isSameDay, setHours, startOfDay } from 'date-fns';
import { pointAlongRoute } from 'src/utils/gps-route';
import { getGpsAlerts } from './mock-gps-alerts';

// Recorded track for "Reproducir recorrido": a day of GPS samples for a unit, built
// deterministically from its route so every replay of the same day looks the same.

const SAMPLE_MINUTES = 2;
const PLAN_KMH = 72;
const DAY_START_HOUR = 6;
const MAX_DRIVE_MINUTES = 13 * 60;
const FUEL_STOP_MINUTES = 15;
const REST_STOP_MINUTES = 30;
const SPEEDING_KMH = 104;

const hash = (text) => [...text].reduce((h, char) => (h * 31 + char.charCodeAt(0)) % 2147483647, 7) || 1;

// Drive and stop segments. Stops are placed at fixed fractions of the drive.
const buildSegments = (fromProgress, toProgress, driveMinutes) => {
  const stops = [
    driveMinutes > 120 && { at: 0.4, minutes: FUEL_STOP_MINUTES, type: 'fuel', label: 'Carga de diésel' },
    driveMinutes > 300 && { at: 0.7, minutes: REST_STOP_MINUTES, type: 'stop', label: 'Parada de descanso' },
  ].filter(Boolean);
  const cuts = [0, ...stops.map((stop) => stop.at), 1];
  return cuts.slice(1).flatMap((cut, index) => {
    const prev = cuts[index];
    const drive = {
      kind: 'drive',
      minutes: driveMinutes * (cut - prev),
      from: fromProgress + (toProgress - fromProgress) * prev,
      to: fromProgress + (toProgress - fromProgress) * cut,
    };
    const stop = stops[index];
    return stop ? [drive, { kind: 'stop', ...stop }] : [drive];
  });
};

const planForDay = (unit, day, now) => {
  const distance = unit.route.distanceKm;
  if (isSameDay(day, now)) {
    const end = unit.status === 'offline' ? new Date(unit.lastUpdate) : now;
    if (unit.status === 'idle') {
      return { start: setHours(startOfDay(day), DAY_START_HOUR), end, segments: [{ kind: 'stop', minutes: 0, type: 'geofence', label: `En patio: ${unit.route.originName}` }], idle: true };
    }
    const driveMinutes = Math.min(MAX_DRIVE_MINUTES, ((unit.progress * distance) / PLAN_KMH) * 60);
    const segments = buildSegments(0, unit.progress, driveMinutes);
    const trailing = unit.status === 'stopped' ? [{ kind: 'stop', minutes: unit.stoppedMinutes || 20, type: 'stop', label: unit.stopReason || 'Unidad detenida' }] : [];
    const total = [...segments, ...trailing].reduce((sum, seg) => sum + seg.minutes, 0);
    return { start: addMinutes(end, -total), end, segments: [...segments, ...trailing] };
  }
  const start = addMinutes(setHours(startOfDay(day), DAY_START_HOUR), hash(`${unit.id}${day.toDateString()}`) % 60);
  const fullMinutes = (distance / PLAN_KMH) * 60;
  const driveMinutes = Math.min(MAX_DRIVE_MINUTES, fullMinutes);
  const segments = [
    ...buildSegments(0, driveMinutes / fullMinutes, driveMinutes),
    { kind: 'stop', minutes: 30, type: 'geofence', label: `Llegada a ${unit.route.destinationName}` },
  ];
  const total = segments.reduce((sum, seg) => sum + seg.minutes, 0);
  return { start, end: addMinutes(start, total), segments };
};

// State at `minutesFromStart`: progress along the route and whether the unit is driving.
const stateAt = (segments, minutesFromStart) => {
  let elapsed = 0;
  let last = { progress: segments[0]?.from || 0, driving: false };
  for (const seg of segments) {
    if (minutesFromStart <= elapsed + seg.minutes) {
      if (seg.kind === 'stop') return { progress: last.progress, driving: false };
      const t = seg.minutes ? (minutesFromStart - elapsed) / seg.minutes : 1;
      return { progress: seg.from + (seg.to - seg.from) * t, driving: true, segment: seg };
    }
    elapsed += seg.minutes;
    last = { progress: seg.kind === 'drive' ? seg.to : last.progress, driving: false };
  }
  return last;
};

const buildSamples = (unit, plan) => {
  const totalMinutes = (plan.end - plan.start) / 60000;
  const seed = hash(unit.id);
  const samples = [];
  for (let m = 0; m <= totalMinutes; m += SAMPLE_MINUTES) {
    const { progress, driving, segment } = stateAt(plan.segments, m);
    const { position, heading } = pointAlongRoute(unit.route.points, Math.min(progress, 1));
    const cruise = segment ? ((segment.to - segment.from) * unit.route.distanceKm) / (segment.minutes / 60) : 0;
    const speed = driving ? Math.max(5, Math.round(cruise + Math.sin((m + seed) / 9) * 8)) : 0;
    samples.push({ t: addMinutes(plan.start, m).getTime(), position, heading, speed, progress });
  }
  return samples;
};

const buildEvents = (unit, plan, day) => {
  const events = [];
  let elapsed = 0;
  if (!plan.idle) events.push({ t: plan.start.getTime(), type: 'geofence', label: `Salida de ${unit.route.originName}` });
  plan.segments.forEach((seg, index) => {
    if (seg.kind === 'stop') events.push({ t: addMinutes(plan.start, elapsed).getTime(), type: seg.type, label: seg.label });
    // One speeding event in the middle of the first long drive.
    if (seg.kind === 'drive' && index === 0 && seg.minutes > 60) {
      events.push({ t: addMinutes(plan.start, elapsed + seg.minutes / 2).getTime(), type: 'speeding', label: `Exceso de velocidad: ${SPEEDING_KMH} km/h (límite 95)` });
    }
    elapsed += seg.minutes;
  });
  if (unit.status === 'offline' && isSameDay(day, new Date())) {
    events.push({ t: plan.end.getTime(), type: 'signal', label: 'Pérdida de señal GPS' });
  }
  // Alert center alerts for this unit and day, placed inside the recorded span.
  getGpsAlerts()
    .filter((alert) => alert.unitId === unit.id && isSameDay(new Date(alert.at), day))
    .forEach((alert) => {
      const t = Math.min(plan.end.getTime(), Math.max(plan.start.getTime(), new Date(alert.at).getTime()));
      events.push({ t, type: 'alert', label: alert.title, alertId: alert.id });
    });
  return events.sort((a, b) => a.t - b.t);
};

export const getUnitTrack = (unit, dayIso) => {
  const day = startOfDay(new Date(dayIso));
  const plan = planForDay(unit, day, new Date());
  return {
    day: day.toISOString(),
    start: plan.start.getTime(),
    end: plan.end.getTime(),
    samples: buildSamples(unit, plan),
    events: buildEvents(unit, plan, day),
  };
};
