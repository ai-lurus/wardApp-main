import { subDays } from 'date-fns';
import { imeiCheckDigit, isValidImei } from 'src/utils/gps-devices';
import { getGpsUnits } from './mock-gps';

// In-memory store for the GPS devices demo. Changes live until the page is reloaded.

const now = new Date();
const imei = (serial) => {
  const first14 = `352093${serial}`;
  return `${first14}${imeiCheckDigit(first14)}`;
};
const iccid = (serial) => `895201${serial}`;
const unitLabel = (unit) => `${unit.eco} · ${unit.plate}`;

const demoUnits = getGpsUnits();

// Fleet units that do not have a GPS yet (used when the real fleet module cannot be reached).
const unitsWithoutGps = [
  { id: 'fleet_133', eco: 'ECO-133', plate: '81-AT-5N', vehicle: 'Kenworth T680 2024' },
  { id: 'fleet_136', eco: 'ECO-136', plate: '29-AU-2C', vehicle: 'Freightliner Cascadia 2024' },
  { id: 'fleet_139', eco: 'ECO-139', plate: '63-AV-8J', vehicle: 'International LT 2022' },
];

let devices = [
  ...demoUnits.map((unit, index) => ({
    id: `dev_${index + 1}`,
    imei: imei(String(41870 + index * 137).padStart(8, '0')),
    model: index % 3 === 2 ? 'Queclink GV300' : 'Teltonika FMC130',
    iccid: iccid(String(1048800000000 + index * 7919)),
    carrier: index % 4 === 3 ? 'AT&T' : 'Telcel',
    status: unit.status === 'offline' ? 'silent' : 'active',
    lastSignal: unit.lastUpdate,
    unitId: unit.id,
    unitLabel: unitLabel(unit),
    assignedAt: subDays(now, 40 + index * 9).toISOString(),
  })),
  { id: 'dev_11', imei: imei('00052211'), model: 'Teltonika FMC130', iccid: iccid('1048899123401'), carrier: 'Telcel', status: 'stock', lastSignal: null, unitId: null, unitLabel: null, assignedAt: null },
  { id: 'dev_12', imei: imei('00052298'), model: 'Suntech ST4340', iccid: iccid('1048899123477'), carrier: 'AT&T', status: 'stock', lastSignal: subDays(now, 12).toISOString(), unitId: null, unitLabel: null, assignedAt: null },
  { id: 'dev_13', imei: imei('00049310'), model: 'Queclink GV300', iccid: iccid('1048899120055'), carrier: 'Telcel', status: 'fault', lastSignal: subDays(now, 3).toISOString(), unitId: null, unitLabel: null, assignedAt: null },
];

let history = devices
  .filter((device) => device.unitId)
  .map((device, index) => ({
    id: `asg_${index + 1}`,
    action: 'assigned',
    deviceId: device.id,
    imei: device.imei,
    unitId: device.unitId,
    unitLabel: device.unitLabel,
    note: 'Instalación inicial',
    by: 'Mesa de control',
    at: device.assignedAt,
  }));
history = [
  { id: 'asg_x1', action: 'unassigned', deviceId: 'dev_13', imei: devices[12].imei, unitId: null, unitLabel: 'ECO-099 · 12-AB-3C (dada de baja)', note: 'Falla de antena GNSS; enviado a garantía', by: 'Taller Monterrey', at: subDays(now, 3).toISOString() },
  ...history,
].sort((a, b) => new Date(b.at) - new Date(a.at));

const findDevice = (id) => devices.find((device) => device.id === id);
const replaceDevice = (updated) => {
  devices = devices.map((device) => (device.id === updated.id ? updated : device));
};
const logEvent = (event) => {
  history = [{ id: `asg_${Date.now()}_${history.length}`, at: new Date().toISOString(), by: 'Tú (demo)', ...event }, ...history];
};

export const getDemoFleetUnits = () => [
  ...demoUnits.map(({ id, eco, plate, vehicle }) => ({ id, label: unitLabel({ eco, plate }), vehicle })),
  ...unitsWithoutGps.map((unit) => ({ id: unit.id, label: unitLabel(unit), vehicle: unit.vehicle })),
];

export const getGpsDevices = () => devices;

export const getGpsDeviceHistory = () => history;

export const getGpsDeviceForUnit = (unitId) => devices.find((device) => device.unitId === unitId) || null;

export const findGpsDeviceByImei = (value) => devices.find((device) => device.imei === value) || null;

export const registerGpsDevice = ({ imei: value, model, iccid: sim, carrier }) => {
  if (!isValidImei(value)) throw new Error('El IMEI no es válido.');
  if (findGpsDeviceByImei(value)) throw new Error('Ese IMEI ya está registrado.');
  const device = {
    id: `dev_${Date.now()}`,
    imei: value,
    model,
    iccid: sim,
    carrier,
    status: 'stock',
    lastSignal: null,
    unitId: null,
    unitLabel: null,
    assignedAt: null,
  };
  devices = [...devices, device];
  logEvent({ action: 'registered', deviceId: device.id, imei: value, unitId: null, unitLabel: null, note: `${model} · SIM ${carrier}` });
  return device;
};

// Assigns a device to a unit. Any device the unit had before and any unit the device had before are released.
export const assignGpsDevice = ({ deviceId, unitId, unitLabel: label, note = '' }) => {
  const device = findDevice(deviceId);
  if (!device) throw new Error('Dispositivo no encontrado.');
  if (device.status === 'fault') throw new Error('El dispositivo tiene una falla reportada; no se puede asignar.');
  if (device.unitId === unitId) throw new Error('El dispositivo ya está asignado a esa unidad.');

  const previousOnUnit = getGpsDeviceForUnit(unitId);
  if (previousOnUnit) {
    replaceDevice({ ...previousOnUnit, unitId: null, unitLabel: null, assignedAt: null, status: 'stock' });
    logEvent({ action: 'unassigned', deviceId: previousOnUnit.id, imei: previousOnUnit.imei, unitId, unitLabel: label, note: 'Reemplazado por otro dispositivo' });
  }

  const action = device.unitId ? 'reassigned' : 'assigned';
  const fromLabel = device.unitLabel;
  const updated = {
    ...device,
    unitId,
    unitLabel: label,
    assignedAt: new Date().toISOString(),
    // A device that already lost signal stays flagged; otherwise it starts reporting once installed.
    status: device.status === 'silent' ? 'silent' : 'active',
    lastSignal: device.status === 'silent' ? device.lastSignal : new Date().toISOString(),
  };
  replaceDevice(updated);
  logEvent({
    action,
    deviceId,
    imei: device.imei,
    unitId,
    unitLabel: label,
    note: [action === 'reassigned' ? `Antes en ${fromLabel}` : null, note].filter(Boolean).join(' · '),
  });
  return updated;
};

export const unassignGpsDevice = ({ deviceId, note = '' }) => {
  const device = findDevice(deviceId);
  if (!device || !device.unitId) throw new Error('El dispositivo no está asignado.');
  replaceDevice({ ...device, unitId: null, unitLabel: null, assignedAt: null, status: device.status === 'fault' ? 'fault' : 'stock' });
  logEvent({ action: 'unassigned', deviceId, imei: device.imei, unitId: device.unitId, unitLabel: device.unitLabel, note });
  return findDevice(deviceId);
};
