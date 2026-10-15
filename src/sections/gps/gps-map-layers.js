import PropTypes from 'prop-types';
import { alpha, useTheme } from '@mui/material/styles';
import { toSvgPath } from 'src/utils/gps-route';
import { GEOFENCE_TYPES, HOTSPOT_LEVELS, TRAFFIC_LEVELS } from 'src/utils/gps-insights';

const KM_PER_DEGREE_LAT = 111.32;
const MIN_GEOFENCE_RADIUS = 7;

// Strokes keep their on-screen width while the map zooms.
const lineProps = { fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round', vectorEffect: 'non-scaling-stroke' };

// Highway corridors colored by congestion. Corridors start green and congested stretches are drawn on top.
export const TrafficLayer = ({ routes, traffic, project }) => {
  const theme = useTheme();
  return (
    <g>
      {routes.map((route) => (
        <path
          key={route.id}
          d={toSvgPath(route.points, project)}
          stroke={alpha(theme.palette.success.main, 0.75)}
          strokeWidth={4}
          {...lineProps}
        />
      ))}
      {traffic
        .filter((segment) => segment.level !== 'free')
        .map((segment) => {
          const level = TRAFFIC_LEVELS[segment.level];
          return (
            <path
              key={segment.id}
              d={toSvgPath(segment.points, project)}
              stroke={theme.palette[level.color].main}
              strokeWidth={5}
              {...lineProps}
            >
              <title>{`Tráfico ${level.label.toLowerCase()}: ${segment.name}`}</title>
            </path>
          );
        })}
    </g>
  );
};

// Wide translucent bands under the corridors where incidents concentrate.
export const HotspotLayer = ({ hotspots, project }) => {
  const theme = useTheme();
  return (
    <g>
      {hotspots.map((spot) => {
        const isManual = spot.source === 'manual';
        const color = theme.palette[HOTSPOT_LEVELS[spot.level].color].main;
        const detail = isManual ? '' : ` · ${spot.incidents} incidentes en 90 días`;
        return (
          <path
            key={spot.id}
            d={toSvgPath(spot.points, project)}
            // Hand-drawn stretches are dashed so they read apart from the computed ones.
            stroke={alpha(color, isManual ? 0.6 : spot.level === 'high' ? 0.4 : 0.28)}
            strokeWidth={isManual ? 10 : 16}
            strokeDasharray={isManual ? '14 8' : undefined}
            {...lineProps}
          >
            <title>{`Ruta caliente: ${spot.name} · ${spot.reason}${detail}`}</title>
          </path>
        );
      })}
    </g>
  );
};

export const GeofenceLayer = ({ geofences, project, scale, zoom = 1 }) => {
  const theme = useTheme();
  return (
    <g>
      {geofences.map((fence) => {
        const [x, y] = project(fence.center);
        const color = theme.palette[GEOFENCE_TYPES[fence.type].color].main;
        // Real size on the map, but never smaller than a few pixels on screen.
        const radius = Math.max(MIN_GEOFENCE_RADIUS / zoom, (fence.radiusKm / KM_PER_DEGREE_LAT) * scale);
        return (
          <circle
            key={fence.id}
            cx={x}
            cy={y}
            r={radius}
            fill={alpha(color, 0.14)}
            stroke={color}
            strokeWidth={1.5}
            strokeDasharray="4 3"
            vectorEffect="non-scaling-stroke"
          >
            <title>{`Geocerca · ${GEOFENCE_TYPES[fence.type].label}: ${fence.name} (${fence.radiusKm} km)`}</title>
          </circle>
        );
      })}
    </g>
  );
};

TrafficLayer.propTypes = { routes: PropTypes.array, traffic: PropTypes.array, project: PropTypes.func };
HotspotLayer.propTypes = { hotspots: PropTypes.array, project: PropTypes.func };
GeofenceLayer.propTypes = {
  geofences: PropTypes.array,
  project: PropTypes.func,
  scale: PropTypes.number,
  zoom: PropTypes.number,
};
