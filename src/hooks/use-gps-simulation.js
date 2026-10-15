import { useEffect, useMemo, useRef, useState } from 'react';
import { pointAlongRoute } from 'src/utils/gps-route';
import { TRAFFIC_LEVELS, geofenceAt, hotspotAt, trafficAt } from 'src/utils/gps-insights';

const TICK_MS = 2000;
// Simulated seconds that pass per real second, so movement is visible during a demo.
const TIME_SCALE = 90;
const EMPTY_OVERLAYS = { geofences: [], hotspots: [], traffic: [] };

const trafficFactor = (traffic, unit) =>
  TRAFFIC_LEVELS[trafficAt(traffic, unit.route.id, unit.progress)].factor;

const advance = (unit, elapsedSeconds, traffic) => {
  if (unit.status !== 'moving') return unit;
  // Units slow down on congested stretches, so traffic shows up in their ETA.
  const speedKmh = unit.speedKmh * trafficFactor(traffic, unit);
  const kmTravelled = (speedKmh / 3600) * elapsedSeconds * TIME_SCALE;
  let progress = unit.progress + kmTravelled / unit.route.distanceKm;
  // Loop back to the origin so the demo never runs out of road.
  if (progress >= 1) progress -= 1;
  return { ...unit, progress };
};

// Adds a little jitter so the speed readout feels live.
const liveSpeed = (unit, tick, traffic) => {
  if (unit.status !== 'moving') return 0;
  const seed = Number(unit.id.replace(/\D/g, '')) || 1;
  const cruise = unit.speedKmh * trafficFactor(traffic, unit);
  return Math.max(0, Math.round(cruise + Math.sin((tick + seed) / 1.7) * 6));
};

/**
 * Simulates live GPS positions for demo units.
 * Units with status "moving" advance along their route every tick (slower in traffic); the rest stay put.
 * Each unit is annotated with its traffic level, hot route stretch and geofence, plus the simulated clock.
 */
export const useGpsSimulation = (units = [], overlays = EMPTY_OVERLAYS) => {
  const [state, setState] = useState({ tick: 0, units, startedAt: Date.now() });
  const trafficRef = useRef(overlays.traffic);

  useEffect(() => {
    trafficRef.current = overlays.traffic;
  }, [overlays]);

  useEffect(() => {
    setState({ tick: 0, units, startedAt: Date.now() });
  }, [units]);

  useEffect(() => {
    const timer = setInterval(() => {
      setState((prev) => ({
        ...prev,
        tick: prev.tick + 1,
        units: prev.units.map((unit) => advance(unit, TICK_MS / 1000, trafficRef.current)),
      }));
    }, TICK_MS);
    return () => clearInterval(timer);
  }, []);

  return useMemo(() => {
    const simulatedAt = new Date(state.startedAt + state.tick * TICK_MS * TIME_SCALE).toISOString();
    return state.units.map((unit) => {
      const { position, heading } = pointAlongRoute(unit.route.points, unit.progress);
      const onRoad = unit.status !== 'idle';
      return {
        ...unit,
        position,
        heading,
        currentSpeed: liveSpeed(unit, state.tick, overlays.traffic),
        trafficLevel: unit.status === 'moving' ? trafficAt(overlays.traffic, unit.route.id, unit.progress) : null,
        hotspot: onRoad ? hotspotAt(overlays.hotspots, { ...unit, position }) : null,
        geofence: geofenceAt(overlays.geofences, position),
        simulatedAt,
        // Minutes stopped keep growing with the simulated clock.
        stoppedMinutes:
          unit.status === 'stopped' ? (unit.stoppedMinutes || 0) + (state.tick * TICK_MS * TIME_SCALE) / 60000 : null,
        lastUpdate: unit.status === 'offline' ? unit.lastUpdate : new Date().toISOString(),
      };
    });
  }, [state, overlays]);
};
