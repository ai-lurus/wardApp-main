import { describeUnit, getGpsTrips, getGpsUnits } from './mock-gps';
import { maskPlate } from 'src/utils/gps-tracking';

// Public tracking view of a trip: only what a customer needs, nothing sensitive.
export const getPublicTracking = ({ tripId, showDriver }) => {
  const trip = getGpsTrips().find((item) => item.id === tripId);
  if (!trip) return null;
  const unit = getGpsUnits().find((item) => item.id === trip.unitId);
  const detail = describeUnit(unit);
  return {
    trip: {
      id: trip.id,
      status: trip.status,
      client: trip.client,
      cargo: trip.cargo,
      origin: trip.origin,
      destination: trip.destination,
      departedAt: trip.departedAt,
      plannedEta: trip.plannedEta,
      deliveredAt: trip.status === 'delivered' ? trip.eta : null,
    },
    unit: {
      id: unit.id,
      eco: unit.eco,
      plate: maskPlate(unit.plate),
      vehicle: unit.vehicle,
      status: unit.status,
      progress: unit.progress,
      speedKmh: unit.speedKmh,
      stoppedMinutes: unit.stoppedMinutes,
      lastUpdate: unit.lastUpdate,
      route: unit.route,
      driver: showDriver ? { name: unit.driver.name.split(' ')[0] } : null,
    },
    events: detail.events.filter((event) => event.type === 'geofence').slice(0, 4),
  };
};
