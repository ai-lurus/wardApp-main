import { subMinutes } from 'date-fns';
import { routeLengthKm } from 'src/utils/gps-route';
import { cities, describeUnit, drivers } from './mock-gps';

// Load-test data: 100 units doing local deliveries around Monterrey, to try clustering and zoom.

const STRESS_UNIT_COUNT = 100;
const KM_PER_DEG_LAT = 111.32;
const DEPOT = [25.7208, -100.2963];
const STATUS_CYCLE = ['moving', 'moving', 'moving', 'moving', 'moving', 'moving', 'stopped', 'idle', 'idle', 'offline'];
const PLATE_LETTERS = 'ABCDEFGHJKLMNPRSTUVWXYZ';

// Offset a [lat, lng] point by km north and east.
const offset = ([lat, lng], northKm, eastKm) => [
  lat + northKm / KM_PER_DEG_LAT,
  lng + eastKm / (KM_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180)),
];

const buildStressUnit = (index) => {
  // Golden-angle spread so destinations cover the metro area evenly.
  const angle = index * 2.39996;
  const radiusKm = 4 + (index % 9) * 2;
  const destination = offset(DEPOT, Math.sin(angle) * radiusKm, Math.cos(angle) * radiusKm);
  const bend = offset(DEPOT, Math.sin(angle + 0.5) * radiusKm * 0.5, Math.cos(angle + 0.5) * radiusKm * 0.5);
  const points = [DEPOT, bend, destination];
  const status = STATUS_CYCLE[index % STATUS_CYCLE.length];
  const id = `stress_${index + 1}`;
  const eco = `ECO-${500 + index}`;

  return {
    id,
    eco,
    plate: `${10 + (index % 89)}-${PLATE_LETTERS[index % PLATE_LETTERS.length]}${PLATE_LETTERS[(index * 7) % PLATE_LETTERS.length]}-${(index % 9) + 1}R`,
    vehicle: index % 2 ? 'Isuzu ELF 600 2023' : 'Hino 300 2022',
    trailer: 'Caja seca 20\'',
    driver: drivers[index % drivers.length],
    status,
    progress: status === 'idle' ? 0 : ((index * 0.37) % 0.9) + 0.05,
    speedKmh: status === 'moving' ? 35 + (index % 5) * 6 : 0,
    fuel: 30 + ((index * 13) % 70),
    odometer: 40000 + index * 1733,
    stopReason: status === 'stopped' ? 'Entrega en cliente' : undefined,
    stoppedMinutes: status === 'stopped' ? 8 + (index % 5) * 9 : undefined,
    lastUpdate: (status === 'offline' ? subMinutes(new Date(), 30 + (index % 40)) : new Date()).toISOString(),
    route: {
      id: `rt_mty_local_${index + 1}`,
      name: 'Reparto local Monterrey',
      origin: 'MTY',
      destination: 'MTY',
      originName: 'CEDIS Monterrey',
      destinationName: `Cliente ${cities.MTY.name.split(',')[0]} #${index + 1}`,
      points,
      distanceKm: Math.max(1, Math.round(routeLengthKm(points))),
    },
  };
};

let cache = null;

export const getStressUnits = () => {
  cache = cache || Array.from({ length: STRESS_UNIT_COUNT }, (_, index) => buildStressUnit(index));
  return cache;
};

export const getStressUnit = (id) => {
  const unit = getStressUnits().find((item) => item.id === id);
  return unit ? describeUnit(unit) : null;
};
