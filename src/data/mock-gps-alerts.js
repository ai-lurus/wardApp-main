import { subMinutes } from 'date-fns';
import { pointAlongRoute } from 'src/utils/gps-route';
import { withUnauthorizedStops } from 'src/utils/gps-stops';
import { describeUnit, getGpsUnits } from './mock-gps';
import { getGeofences, getStopRules } from './mock-gps-geofences';

// Alerts for the GPS alert center: derived from the demo units' recent events and the
// unauthorized-stop rule, plus some older history. Status changes persist in localStorage.

const STORAGE_KEY = 'ward.gps.alerts.v1';
const now = new Date();

const EVENT_ALERTS = {
  speeding: { type: 'speeding', severity: 'medium' },
  harsh: { type: 'harsh_braking', severity: 'medium' },
  hotspot: { type: 'hotspot', severity: 'high' },
  signal: { type: 'no_signal', severity: 'high' },
};

const eventToAlert = (unit, event) => {
  if (event.type === 'geofence') {
    const entry = event.label.startsWith('Entrada');
    return { type: entry ? 'geofence_entry' : 'geofence_exit', severity: 'low' };
  }
  return EVENT_ALERTS[event.type] || null;
};

// Recent alerts start pending; a few are already being handled; older ones are resolved.
const initialStatus = (minutesAgo, index) => {
  if (minutesAgo > 180) return 'resolved';
  return index % 4 === 1 ? 'in_progress' : 'pending';
};

const unitFields = (unit) => ({
  unitId: unit.id,
  unitEco: unit.eco,
  unitPlate: unit.plate,
  driverName: unit.driver?.name || '',
});

const fromEvents = () =>
  getGpsUnits().flatMap((unit) =>
    describeUnit(unit).events
      .map((event) => ({ event, alert: eventToAlert(unit, event) }))
      .filter(({ alert }) => alert)
      .map(({ event, alert }, index) => {
        const minutesAgo = Math.round((now - new Date(event.at)) / 60000);
        return {
          id: `evt_${event.id}`,
          ...alert,
          ...unitFields(unit),
          title: event.label,
          at: event.at,
          status: initialStatus(minutesAgo, index),
        };
      })
  );

const HISTORY = [
  { unitId: 'gps_7', type: 'route_deviation', severity: 'high', title: 'Desvío de 4.2 km de la ruta Méx 40D', minutesAgo: 95, status: 'pending' },
  { unitId: 'gps_3', type: 'geofence_dwell', severity: 'medium', title: 'Permanencia de 3 h 10 min en Puerto de Manzanillo', minutesAgo: 60 * 26, status: 'resolved' },
  { unitId: 'gps_1', type: 'route_deviation', severity: 'high', title: 'Desvío de 2.8 km hacia carretera libre', minutesAgo: 60 * 50, status: 'resolved' },
  { unitId: 'gps_6', type: 'speeding', severity: 'medium', title: 'Exceso de velocidad: 112 km/h (límite 95)', minutesAgo: 60 * 75, status: 'resolved' },
  { unitId: 'gps_2', type: 'unauthorized_stop', severity: 'high', title: 'Parada no autorizada: 41 min en acotamiento cerca de Matehuala', minutesAgo: 60 * 98, status: 'resolved' },
  { unitId: 'gps_10', type: 'hotspot', severity: 'high', title: 'Ingreso a ruta caliente: Atlacomulco – Toluca (asaltos nocturnos)', minutesAgo: 60 * 122, status: 'resolved' },
  { unitId: 'gps_5', type: 'no_signal', severity: 'high', title: 'Pérdida de señal GPS por 25 min', minutesAgo: 60 * 140, status: 'resolved' },
];

const fromHistory = () => {
  const units = getGpsUnits();
  return HISTORY.map((item, index) => {
    const unit = units.find((u) => u.id === item.unitId);
    return {
      id: `hist_${index + 1}`,
      type: item.type,
      severity: item.severity,
      ...unitFields(unit),
      title: item.title,
      at: subMinutes(now, item.minutesAgo).toISOString(),
      status: item.status,
    };
  });
};

// Unauthorized stops under the current rule and geofences.
const fromStops = () => {
  const units = getGpsUnits().map((unit) => ({ ...unit, position: pointAlongRoute(unit.route.points, unit.progress).position }));
  return withUnauthorizedStops(units, getGeofences(), getStopRules().thresholdMinutes)
    .filter((unit) => unit.unauthorizedStop)
    .map((unit) => ({
      id: `stop_${unit.id}`,
      type: 'unauthorized_stop',
      severity: 'high',
      ...unitFields(unit),
      title: `Parada no autorizada: ${unit.unauthorizedStop.reason}`,
      at: subMinutes(now, unit.unauthorizedStop.minutes).toISOString(),
      status: 'pending',
    }));
};

const readOverrides = () => {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
  } catch (err) {
    return {};
  }
};

const writeOverrides = (overrides) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  } catch (err) {
    console.warn('Could not save alert status:', err.message);
  }
};

const listeners = new Set();

export const subscribeGpsAlerts = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getGpsAlerts = () => {
  const overrides = readOverrides();
  return [...fromStops(), ...fromEvents(), ...fromHistory()]
    .map((alert) => ({ history: [], ...alert, ...(overrides[alert.id] || {}) }))
    .sort((a, b) => new Date(b.at) - new Date(a.at));
};

export const updateGpsAlertStatus = (id, status, note = '') => {
  const alert = getGpsAlerts().find((item) => item.id === id);
  if (!alert) throw new Error('Alerta no encontrada.');
  const overrides = readOverrides();
  const entry = { status, note: note.trim(), at: new Date().toISOString(), by: 'Tú (demo)' };
  writeOverrides({ ...overrides, [id]: { status, history: [...alert.history, entry] } });
  listeners.forEach((listener) => listener());
  return { ...alert, status, history: [...alert.history, entry] };
};
