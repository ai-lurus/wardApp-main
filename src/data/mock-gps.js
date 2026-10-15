import { addMinutes, subMinutes } from 'date-fns';
import { haversineKm, progressAtIndex, routeLengthKm } from 'src/utils/gps-route';
import { estimateArrival } from 'src/utils/gps-insights';

// Demo data for the GPS module. Everything here is fictitious: companies,
// drivers and plates are invented; cities and highways are real so the map reads true.

const now = new Date();

export const cities = {
  MTY: { name: 'Monterrey, N.L.', position: [25.6866, -100.3161] },
  NLD: { name: 'Nuevo Laredo, Tamps.', position: [27.4763, -99.5164] },
  SLT: { name: 'Saltillo, Coah.', position: [25.4232, -101.0053] },
  SLP: { name: 'San Luis Potosí, S.L.P.', position: [22.1565, -100.9855] },
  QRO: { name: 'Querétaro, Qro.', position: [20.5888, -100.3899] },
  CDMX: { name: 'Ciudad de México', position: [19.4326, -99.1332] },
  GDL: { name: 'Guadalajara, Jal.', position: [20.6597, -103.3496] },
  ZLO: { name: 'Manzanillo, Col.', position: [19.1138, -104.3385] },
  VER: { name: 'Veracruz, Ver.', position: [19.1738, -96.1342] },
  PUE: { name: 'Puebla, Pue.', position: [19.0414, -98.2063] },
  LEO: { name: 'León, Gto.', position: [21.125, -101.686] },
  AGS: { name: 'Aguascalientes, Ags.', position: [21.8853, -102.2916] },
  TRC: { name: 'Torreón, Coah.', position: [25.5428, -103.4068] },
  CUU: { name: 'Chihuahua, Chih.', position: [28.632, -106.0691] },
  MZT: { name: 'Mazatlán, Sin.', position: [23.2494, -106.4111] },
};

// Highway corridors as [lat, lng] waypoints, close enough to the real roads at map scale.
const routeDefs = [
  {
    id: 'rt_1',
    name: 'Monterrey – Nuevo Laredo (Méx 85D)',
    origin: 'MTY',
    destination: 'NLD',
    points: [
      [25.6866, -100.3161], [25.79, -100.27], [26.0, -100.2], [26.5072, -100.1781],
      [26.85, -99.95], [27.12, -99.75], [27.4763, -99.5164],
    ],
  },
  {
    id: 'rt_2',
    name: 'Monterrey – CDMX (Méx 57)',
    origin: 'MTY',
    destination: 'CDMX',
    points: [
      [25.6866, -100.3161], [25.4232, -101.0053], [24.9, -100.95], [24.25, -100.78],
      [23.6471, -100.644], [22.95, -100.75], [22.1565, -100.9855], [21.55, -100.62],
      [20.5888, -100.3899], [20.38, -99.98], [19.95, -99.55], [19.6, -99.2],
      [19.4326, -99.1332],
    ],
  },
  {
    id: 'rt_3',
    name: 'Manzanillo – Guadalajara (Méx 54D)',
    origin: 'ZLO',
    destination: 'GDL',
    points: [
      [19.1138, -104.3385], [19.13, -104.05], [19.2433, -103.725], [19.48, -103.55],
      [19.7047, -103.4617], [20.15, -103.48], [20.45, -103.42], [20.6597, -103.3496],
    ],
  },
  {
    id: 'rt_4',
    name: 'Guadalajara – CDMX (Méx 15D)',
    origin: 'GDL',
    destination: 'CDMX',
    points: [
      [20.6597, -103.3496], [20.6235, -103.069], [20.35, -102.75], [20.16, -102.2],
      [19.95, -101.65], [19.706, -101.195], [19.8917, -100.4439], [19.7976, -99.874],
      [19.2826, -99.6557], [19.37, -99.35], [19.4326, -99.1332],
    ],
  },
  {
    id: 'rt_5',
    name: 'Veracruz – CDMX (Méx 150D)',
    origin: 'VER',
    destination: 'CDMX',
    points: [
      [19.1738, -96.1342], [19.0, -96.55], [18.8842, -96.9256], [18.85, -97.1],
      [18.95, -97.6], [19.0414, -98.2063], [19.25, -98.6], [19.36, -98.95],
      [19.4326, -99.1332],
    ],
  },
  {
    id: 'rt_6',
    name: 'Querétaro – Aguascalientes (Méx 45D)',
    origin: 'QRO',
    destination: 'AGS',
    points: [
      [20.5888, -100.3899], [20.5235, -100.8157], [20.68, -101.35], [21.125, -101.686],
      [21.35, -101.93], [21.6, -102.15], [21.8853, -102.2916],
    ],
  },
  {
    id: 'rt_7',
    name: 'Saltillo – Chihuahua (Méx 40D / 45)',
    origin: 'SLT',
    destination: 'CUU',
    points: [
      [25.4232, -101.0053], [25.5, -101.9], [25.5428, -103.4068], [26.3, -104.1],
      [27.13, -104.92], [27.68, -105.17], [28.19, -105.47], [28.632, -106.0691],
    ],
  },
  {
    id: 'rt_8',
    name: 'Guadalajara – Mazatlán (Méx 15D)',
    origin: 'GDL',
    destination: 'MZT',
    points: [
      [20.6597, -103.3496], [20.85, -103.85], [21.05, -104.35], [21.5, -104.89],
      [22.0, -105.2], [22.55, -105.6], [23.2494, -106.4111],
    ],
  },
];

export const routes = routeDefs.map((route) => ({
  ...route,
  originName: cities[route.origin].name,
  destinationName: cities[route.destination].name,
  distanceKm: Math.round(routeLengthKm(route.points)),
}));

const routeById = (id) => routes.find((route) => route.id === id);

// Stretch of a route between two vertex indexes, with its progress range (0..1).
const routeStretch = (routeId, fromIndex, toIndex) => {
  const { points } = routeById(routeId);
  return {
    routeId,
    from: progressAtIndex(points, fromIndex),
    to: progressAtIndex(points, toIndex),
    points: points.slice(fromIndex, toIndex + 1),
  };
};

// Geofences: circular zones around yards, ports, customs and client sites.
export const geofences = [
  { id: 'gf_1', name: 'Patio Monterrey', type: 'yard', center: cities.MTY.position, radiusKm: 12 },
  { id: 'gf_2', name: 'Aduana Nuevo Laredo', type: 'customs', center: cities.NLD.position, radiusKm: 10 },
  { id: 'gf_3', name: 'Planta Derramadero, Saltillo', type: 'client', center: cities.SLT.position, radiusKm: 10 },
  { id: 'gf_4', name: 'Parque Industrial Querétaro', type: 'client', center: cities.QRO.position, radiusKm: 12 },
  { id: 'gf_5', name: 'CEDIS Vallejo, CDMX', type: 'client', center: cities.CDMX.position, radiusKm: 12 },
  { id: 'gf_6', name: 'Patio Guadalajara', type: 'yard', center: cities.GDL.position, radiusKm: 12 },
  { id: 'gf_7', name: 'Puerto de Manzanillo', type: 'port', center: cities.ZLO.position, radiusKm: 12 },
  { id: 'gf_8', name: 'Puerto de Veracruz', type: 'port', center: cities.VER.position, radiusKm: 10 },
  { id: 'gf_9', name: 'Planta Puebla', type: 'client', center: cities.PUE.position, radiusKm: 10 },
  { id: 'gf_10', name: 'Puerto de Mazatlán', type: 'port', center: cities.MZT.position, radiusKm: 8 },
];

// Hot route stretches: higher incidence of theft, unauthorized stops or speeding (last 90 days).
const computedHotspots = [
  { id: 'hs_1', name: 'San Luis Potosí – Querétaro', level: 'high', reason: 'Robo a transporte', incidents: 14, ...routeStretch('rt_2', 6, 8) },
  { id: 'hs_2', name: 'Cumbres de Maltrata', level: 'high', reason: 'Robo a transporte y bloqueos', incidents: 18, ...routeStretch('rt_5', 2, 5) },
  { id: 'hs_3', name: 'Atlacomulco – Toluca', level: 'medium', reason: 'Asaltos nocturnos', incidents: 7, ...routeStretch('rt_4', 6, 8) },
  { id: 'hs_4', name: 'Celaya – León', level: 'medium', reason: 'Excesos de velocidad frecuentes', incidents: 9, ...routeStretch('rt_6', 1, 3) },
  { id: 'hs_5', name: 'Sabinas Hidalgo – Nuevo Laredo', level: 'medium', reason: 'Paradas no autorizadas', incidents: 6, ...routeStretch('rt_1', 3, 5) },
  { id: 'hs_6', name: 'Torreón – Jiménez', level: 'medium', reason: 'Zona sin cobertura celular', incidents: 5, ...routeStretch('rt_7', 3, 5) },
];

export const hotspots = computedHotspots.map((spot) => ({ ...spot, source: 'computed' }));

// Current traffic by stretch. Anything not listed flows freely.
export const traffic = [
  { id: 'tf_1', name: 'Monterrey – Saltillo', level: 'moderate', ...routeStretch('rt_2', 0, 1) },
  { id: 'tf_2', name: 'Autopista México – Querétaro (entrada CDMX)', level: 'heavy', ...routeStretch('rt_2', 10, 12) },
  { id: 'tf_3', name: 'Salida de Guadalajara', level: 'moderate', ...routeStretch('rt_4', 0, 1) },
  { id: 'tf_4', name: 'Toluca – CDMX', level: 'heavy', ...routeStretch('rt_4', 8, 10) },
  { id: 'tf_5', name: 'Esperanza – Puebla', level: 'moderate', ...routeStretch('rt_5', 4, 5) },
  { id: 'tf_6', name: 'Puebla – CDMX (Chalco)', level: 'heavy', ...routeStretch('rt_5', 6, 8) },
  { id: 'tf_7', name: 'Acceso Puerto de Manzanillo', level: 'moderate', ...routeStretch('rt_3', 0, 1) },
  { id: 'tf_8', name: 'Entrada a Guadalajara', level: 'moderate', ...routeStretch('rt_3', 6, 7) },
  { id: 'tf_9', name: 'Libramiento León', level: 'moderate', ...routeStretch('rt_6', 2, 3) },
];

export const drivers = [
  { id: 'drv_1', name: 'José Luis Garza Treviño', phone: '81 1234 5678', license: 'Federal tipo B' },
  { id: 'drv_2', name: 'Miguel Ángel Ramírez Soto', phone: '81 2345 6789', license: 'Federal tipo E' },
  { id: 'drv_3', name: 'Juan Carlos Mendoza Ruiz', phone: '314 112 4589', license: 'Federal tipo B' },
  { id: 'drv_4', name: 'Francisco Javier López Ortega', phone: '33 3456 7812', license: 'Federal tipo E' },
  { id: 'drv_5', name: 'Ricardo Hernández Cruz', phone: '229 145 7720', license: 'Federal tipo B' },
  { id: 'drv_6', name: 'Alejandro Torres Villarreal', phone: '442 318 9054', license: 'Federal tipo B' },
  { id: 'drv_7', name: 'Héctor Manuel Flores Ibarra', phone: '844 221 6633', license: 'Federal tipo E' },
  { id: 'drv_8', name: 'Roberto Salinas Medina', phone: '33 1987 4410', license: 'Federal tipo B' },
  { id: 'drv_9', name: 'Fernando Castillo Rangel', phone: '81 4567 1290', license: 'Federal tipo B' },
  { id: 'drv_10', name: 'Arturo Domínguez Peña', phone: '55 6123 8845', license: 'Federal tipo E' },
];

// status: moving | stopped | idle (en base) | offline (sin señal)
// progress: 0..1 along the route at load time. speedKmh: cruise speed used by the simulation.
const unitDefs = [
  { id: 'gps_1', eco: 'ECO-101', plate: '47-AK-3T', vehicle: 'Freightliner Cascadia 2022', trailer: 'Caja seca 53\'', driverId: 'drv_1', routeId: 'rt_1', status: 'moving', progress: 0.42, speedKmh: 88, fuel: 64, odometer: 412870 },
  { id: 'gps_2', eco: 'ECO-104', plate: '52-AL-8M', vehicle: 'Kenworth T680 2023', trailer: 'Refrigerado 53\'', driverId: 'drv_2', routeId: 'rt_2', status: 'moving', progress: 0.31, speedKmh: 86, fuel: 71, odometer: 268450 },
  { id: 'gps_3', eco: 'ECO-107', plate: '33-AJ-5P', vehicle: 'International LT 2021', trailer: 'Contenedor 40\'', driverId: 'drv_3', routeId: 'rt_3', status: 'moving', progress: 0.58, speedKmh: 74, fuel: 48, odometer: 501230 },
  { id: 'gps_4', eco: 'ECO-112', plate: '61-AN-2R', vehicle: 'Volvo VNL 760 2022', trailer: 'Caja seca 53\'', driverId: 'drv_4', routeId: 'rt_4', status: 'stopped', progress: 0.47, speedKmh: 0, fuel: 35, odometer: 339120, stopReason: 'Parada de descanso', stoppedMinutes: 22 },
  { id: 'gps_5', eco: 'ECO-115', plate: '28-AH-9K', vehicle: 'Kenworth T680 2021', trailer: 'Tolva granelera', driverId: 'drv_5', routeId: 'rt_5', status: 'moving', progress: 0.22, speedKmh: 81, fuel: 82, odometer: 455780 },
  { id: 'gps_6', eco: 'ECO-118', plate: '74-AP-6D', vehicle: 'Freightliner Cascadia 2020', trailer: 'Plataforma 48\'', driverId: 'drv_6', routeId: 'rt_6', status: 'moving', progress: 0.66, speedKmh: 86, fuel: 57, odometer: 612340 },
  { id: 'gps_7', eco: 'ECO-121', plate: '39-AM-4F', vehicle: 'International LT 2023', trailer: 'Caja seca 53\'', driverId: 'drv_7', routeId: 'rt_7', status: 'moving', progress: 0.12, speedKmh: 90, fuel: 91, odometer: 98720 },
  { id: 'gps_8', eco: 'ECO-124', plate: '56-AK-1W', vehicle: 'Volvo VNL 760 2021', trailer: 'Refrigerado 53\'', driverId: 'drv_8', routeId: 'rt_8', status: 'offline', progress: 0.38, speedKmh: 0, fuel: 44, odometer: 287650 },
  { id: 'gps_9', eco: 'ECO-127', plate: '45-AR-7B', vehicle: 'Kenworth T880 2022', trailer: 'Full (doble caja)', driverId: 'drv_9', routeId: 'rt_2', status: 'idle', progress: 0, speedKmh: 0, fuel: 100, odometer: 154300 },
  { id: 'gps_10', eco: 'ECO-130', plate: '68-AS-3H', vehicle: 'Freightliner Cascadia 2023', trailer: 'Caja seca 53\'', driverId: 'drv_10', routeId: 'rt_4', status: 'moving', progress: 0.83, speedKmh: 85, fuel: 29, odometer: 76540 },
];

const tripDefs = [
  { id: 'VJ-2610-041', unitId: 'gps_1', client: 'Aceros del Norte S.A. de C.V.', cargo: 'Rollos de acero laminado', weightTon: 24, status: 'in_transit', departedHoursAgo: 1.8 },
  { id: 'VJ-2610-042', unitId: 'gps_2', client: 'Lácteos La Huasteca', cargo: 'Lácteos refrigerados (4 °C)', weightTon: 18, status: 'in_transit', departedHoursAgo: 3.6 },
  { id: 'VJ-2610-043', unitId: 'gps_3', client: 'Importadora Pacífico Logística', cargo: 'Electrónica en contenedor', weightTon: 21, status: 'in_transit', departedHoursAgo: 2.4 },
  { id: 'VJ-2610-044', unitId: 'gps_4', client: 'Autopartes del Bajío', cargo: 'Autopartes y refacciones', weightTon: 16, status: 'delayed', departedHoursAgo: 4.9 },
  { id: 'VJ-2610-045', unitId: 'gps_5', client: 'Granos y Semillas del Golfo', cargo: 'Maíz amarillo a granel', weightTon: 30, status: 'in_transit', departedHoursAgo: 1.1 },
  { id: 'VJ-2610-046', unitId: 'gps_6', client: 'Cementos Altiplano', cargo: 'Varilla corrugada', weightTon: 27, status: 'in_transit', departedHoursAgo: 2.9 },
  { id: 'VJ-2610-047', unitId: 'gps_7', client: 'Maquiladora Norteña', cargo: 'Componentes de exportación', weightTon: 12, status: 'in_transit', departedHoursAgo: 1.2 },
  { id: 'VJ-2610-048', unitId: 'gps_8', client: 'Mariscos Sinaloa Export', cargo: 'Producto congelado (-18 °C)', weightTon: 19, status: 'delayed', departedHoursAgo: 3.3 },
  { id: 'VJ-2610-049', unitId: 'gps_9', client: 'Distribuidora Regiomontana', cargo: 'Abarrotes paletizados', weightTon: 22, status: 'scheduled', departsInHours: 2.5 },
  { id: 'VJ-2610-050', unitId: 'gps_10', client: 'Tequilera Los Altos', cargo: 'Bebidas embotelladas', weightTon: 20, status: 'in_transit', departedHoursAgo: 6.2 },
  { id: 'VJ-2610-038', unitId: 'gps_3', client: 'Importadora Pacífico Logística', cargo: 'Línea blanca', weightTon: 18, status: 'delivered', departedHoursAgo: 30, deliveredHoursAgo: 25 },
  { id: 'VJ-2610-036', unitId: 'gps_1', client: 'Aceros del Norte S.A. de C.V.', cargo: 'Perfiles estructurales', weightTon: 25, status: 'delivered', departedHoursAgo: 28, deliveredHoursAgo: 24.5 },
  { id: 'VJ-2610-034', unitId: 'gps_6', client: 'Cementos Altiplano', cargo: 'Cemento en sacos', weightTon: 28, status: 'delivered', departedHoursAgo: 52, deliveredHoursAgo: 47 },
];

const findById = (list, id) => list.find((item) => item.id === id);

const buildUnit = (def) => {
  const route = findById(routes, def.routeId);
  const driver = findById(drivers, def.driverId);
  const lastUpdate = def.status === 'offline' ? subMinutes(now, 47) : subMinutes(now, 0.5);
  return { ...def, route, driver, lastUpdate: lastUpdate.toISOString() };
};

const units = unitDefs.map(buildUnit);

const buildTrip = (def) => {
  const unit = findById(units, def.unitId);
  const route = unit.route;
  const departedAt = def.departsInHours
    ? addMinutes(now, def.departsInHours * 60)
    : subMinutes(now, def.departedHoursAgo * 60);
  const isCurrent = ['in_transit', 'delayed'].includes(def.status);
  const estimate = def.deliveredHoursAgo
    ? null
    : estimateArrival({ unit, trip: { ...def, departedAt: departedAt.toISOString() }, traffic, now });

  return {
    ...def,
    unitEco: unit.eco,
    unitPlate: unit.plate,
    driverName: unit.driver.name,
    routeId: route.id,
    routeName: route.name,
    origin: route.originName,
    destination: route.destinationName,
    distanceKm: route.distanceKm,
    departedAt: departedAt.toISOString(),
    eta: estimate ? estimate.eta : subMinutes(now, def.deliveredHoursAgo * 60).toISOString(),
    plannedEta: estimate ? estimate.plannedEta : null,
    delayMinutes: estimate ? estimate.delayMinutes : 0,
    trafficMinutes: estimate ? estimate.trafficMinutes : 0,
    progress: def.status === 'delivered' ? 1 : isCurrent ? unit.progress : 0,
  };
};

const trips = tripDefs.map(buildTrip);

// Recent events per unit, newest first.
const eventTemplates = {
  moving: [
    { type: 'position', label: 'Posición reportada en ruta', minutesAgo: 1 },
    { type: 'toll', label: 'Cruce de caseta de peaje', minutesAgo: 38 },
    { type: 'speeding', label: 'Exceso de velocidad: 104 km/h (límite 95)', minutesAgo: 71 },
    { type: 'fuel', label: 'Carga de combustible: 380 L diésel', minutesAgo: 115 },
  ],
  stopped: [
    { type: 'stop', label: 'Unidad detenida: parada de descanso', minutesAgo: 22 },
    { type: 'toll', label: 'Cruce de caseta de peaje', minutesAgo: 64 },
    { type: 'harsh', label: 'Frenado brusco detectado', minutesAgo: 103 },
    { type: 'fuel', label: 'Carga de combustible: 410 L diésel', minutesAgo: 190 },
  ],
  offline: [
    { type: 'signal', label: 'Pérdida de señal GPS', minutesAgo: 47 },
    { type: 'position', label: 'Última posición reportada', minutesAgo: 48 },
    { type: 'toll', label: 'Cruce de caseta de peaje', minutesAgo: 96 },
  ],
  idle: [
    { type: 'maintenance', label: 'Revisión pre-viaje completada', minutesAgo: 80 },
    { type: 'ignition', label: 'Apagado de motor', minutesAgo: 610 },
  ],
};

// Average speed used to place past route events in time.
const EVENT_AVG_KMH = 75;
// Minutes a unit has not moved, so older route events shift back by this much.
const idleOffset = { stopped: 22, offline: 47 };

const minutesAgoAt = (unit, progress) =>
  Math.round(((unit.progress - progress) * unit.route.distanceKm * 60) / EVENT_AVG_KMH) +
  (idleOffset[unit.status] || 0);

// Entry/exit events for every geofence the unit's route crosses up to its current position.
const buildGeofenceEvents = (unit) =>
  geofences.flatMap((fence) => {
    const index = unit.route.points.findIndex((point) => haversineKm(point, fence.center) <= fence.radiusKm);
    if (index === -1) return [];
    if (unit.status === 'idle') {
      return index === 0
        ? [{ type: 'geofence', label: `Entrada a geocerca: ${fence.name}`, minutesAgo: 35 }]
        : [];
    }
    const at = progressAtIndex(unit.route.points, index);
    const margin = fence.radiusKm / unit.route.distanceKm;
    const events = [];
    if (at - margin > 0 && at - margin <= unit.progress) {
      events.push({ type: 'geofence', label: `Entrada a geocerca: ${fence.name}`, minutesAgo: minutesAgoAt(unit, at - margin) });
    }
    if (at + margin <= unit.progress) {
      events.push({ type: 'geofence', label: `Salida de geocerca: ${fence.name}`, minutesAgo: minutesAgoAt(unit, at + margin) });
    }
    return events;
  });

const buildHotspotEvents = (unit) =>
  hotspots
    .filter((spot) => spot.routeId === unit.route.id && unit.status !== 'idle' && spot.from <= unit.progress)
    .map((spot) => ({
      type: 'hotspot',
      label: `Ingreso a ruta caliente: ${spot.name} (${spot.reason.toLowerCase()})`,
      minutesAgo: minutesAgoAt(unit, spot.from),
    }));

const buildEvents = (unit) =>
  [...eventTemplates[unit.status], ...buildGeofenceEvents(unit), ...buildHotspotEvents(unit)]
    .sort((a, b) => a.minutesAgo - b.minutesAgo)
    .map((event, index) => ({
      id: `${unit.id}_evt_${index}`,
      ...event,
      at: subMinutes(now, event.minutesAgo).toISOString(),
    }));

// Speed samples for the last 6 hours, every 15 minutes.
const buildSpeedHistory = (unit) => {
  const samples = [];
  const seed = (Number(unit.id.replace(/\D/g, '')) || 1);
  for (let i = 24; i >= 0; i -= 1) {
    const at = subMinutes(now, i * 15);
    let speed = 0;
    if (unit.status !== 'idle') {
      const wave = Math.sin((i + seed) / 2.2) * 9 + Math.cos((i * seed) / 5) * 5;
      speed = Math.max(0, Math.round(84 + wave));
      if ((i + seed) % 9 === 0) speed = 0;
      if (unit.status === 'stopped' && i < 2) speed = 0;
      if (unit.status === 'offline' && i < 4) speed = null;
    }
    samples.push({ at: at.toISOString(), speed });
  }
  return samples;
};

export const getGpsUnits = () => units;

// Full detail for a unit: current trip, recent events, speed history and trip history.
export const describeUnit = (unit) => {
  const currentTrip = trips.find((trip) => trip.unitId === unit.id && trip.status !== 'delivered');
  return {
    ...unit,
    currentTrip: currentTrip || null,
    events: buildEvents(unit),
    speedHistory: buildSpeedHistory(unit),
    tripHistory: trips.filter((trip) => trip.unitId === unit.id),
  };
};

export const getGpsUnit = (id) => {
  const unit = findById(units, id);
  return unit ? describeUnit(unit) : null;
};

export const getGpsTrips = () => trips;

export const getGpsRoutes = () => routes;

export const getGpsCities = () => cities;

export const getGpsOverlays = () => ({ geofences, hotspots, traffic });
