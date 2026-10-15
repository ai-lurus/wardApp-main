import { addDays } from 'date-fns';

// In-memory store for hot routes marked by hand. Changes live until the page is reloaded.

let manualHotspots = [
  {
    id: 'mh_1',
    source: 'manual',
    name: 'Libramiento Saltillo (obra)',
    level: 'medium',
    reason: 'Obra en carretera con paradas forzadas',
    note: 'Reportado por operadores de la ruta Saltillo – Chihuahua',
    validUntil: addDays(new Date(), 21).toISOString(),
    createdBy: 'Mesa de control',
    points: [[25.4232, -101.0053], [25.47, -101.45], [25.5, -101.9]],
  },
];

const nextId = () => `mh_${Date.now()}`;

export const isHotspotActive = (spot, now = new Date()) => !spot.validUntil || new Date(spot.validUntil) > now;

export const getManualHotspots = () => manualHotspots;

const validate = (values) => {
  if (!values.points || values.points.length < 2) throw new Error('Marca al menos dos puntos en el mapa.');
  if (!values.name?.trim()) throw new Error('Ponle un nombre al tramo.');
};

export const createManualHotspot = (values) => {
  validate(values);
  const spot = { ...values, id: nextId(), source: 'manual', createdBy: 'Tú (demo)' };
  manualHotspots = [...manualHotspots, spot];
  return spot;
};

export const updateManualHotspot = (id, values) => {
  const current = manualHotspots.find((spot) => spot.id === id);
  if (!current) throw new Error('Tramo no encontrado.');
  const updated = { ...current, ...values, id, source: 'manual' };
  validate(updated);
  manualHotspots = manualHotspots.map((spot) => (spot.id === id ? updated : spot));
  return updated;
};

export const deleteManualHotspot = (id) => {
  manualHotspots = manualHotspots.filter((spot) => spot.id !== id);
  return { id };
};
