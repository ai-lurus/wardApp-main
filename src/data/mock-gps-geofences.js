import { DEFAULT_STOP_THRESHOLD_MINUTES } from 'src/utils/gps-stops';
import { geofences as seedGeofences } from './mock-gps';

// In-memory store for geofences and the unauthorized-stop rule. Changes live until the page is reloaded.

const DEFAULT_ALERTS = { entry: true, exit: true, dwellMinutes: null };

let geofences = [
  ...seedGeofences.map((fence) => ({ ...fence, alerts: DEFAULT_ALERTS, createdBy: 'Mesa de control' })),
  {
    id: 'gf_rest_1',
    name: 'Paradero autorizado San Luis Potosí',
    type: 'rest',
    center: [22.95, -100.75],
    radiusKm: 4,
    alerts: { entry: true, exit: true, dwellMinutes: 120 },
    createdBy: 'Mesa de control',
  },
  {
    id: 'gf_restricted_1',
    name: 'Tramo Palmillas (no detenerse)',
    type: 'restricted',
    center: [20.38, -99.98],
    radiusKm: 6,
    alerts: { entry: true, exit: false, dwellMinutes: null },
    createdBy: 'Mesa de control',
  },
];

let stopRules = { thresholdMinutes: DEFAULT_STOP_THRESHOLD_MINUTES };

const validate = (values) => {
  if (!values.name?.trim()) throw new Error('Ponle un nombre a la geocerca.');
  if (!values.center || values.center.length !== 2) throw new Error('Marca el centro en el mapa.');
  if (!(values.radiusKm > 0)) throw new Error('El radio debe ser mayor a 0 km.');
};

export const getGeofences = () => geofences;

export const createGeofence = (values) => {
  validate(values);
  const fence = { alerts: DEFAULT_ALERTS, ...values, id: `gf_${Date.now()}`, createdBy: 'Tú (demo)' };
  geofences = [...geofences, fence];
  return fence;
};

export const updateGeofence = (id, values) => {
  const current = geofences.find((fence) => fence.id === id);
  if (!current) throw new Error('Geocerca no encontrada.');
  const updated = { ...current, ...values, id };
  validate(updated);
  geofences = geofences.map((fence) => (fence.id === id ? updated : fence));
  return updated;
};

export const deleteGeofence = (id) => {
  geofences = geofences.filter((fence) => fence.id !== id);
  return { id };
};

export const getStopRules = () => stopRules;

export const saveStopRules = (values) => {
  const thresholdMinutes = Number(values.thresholdMinutes);
  if (!Number.isFinite(thresholdMinutes) || thresholdMinutes < 1 || thresholdMinutes > 600) {
    throw new Error('Los minutos deben estar entre 1 y 600.');
  }
  stopRules = { thresholdMinutes };
  return stopRules;
};
