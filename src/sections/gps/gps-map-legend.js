import PropTypes from 'prop-types';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { GEOFENCE_TYPES, HOTSPOT_LEVELS, TRAFFIC_LEVELS } from 'src/utils/gps-insights';
import { unitStatusMap } from './gps-status';

const Swatch = ({ color, shape = 'dot' }) => (
  <Box
    sx={{
      width: shape === 'line' ? 16 : 10,
      height: shape === 'line' ? 4 : 10,
      borderRadius: shape === 'line' ? 2 : '50%',
      backgroundColor: `${color}.main`,
      flexShrink: 0,
    }}
  />
);

Swatch.propTypes = { color: PropTypes.string, shape: PropTypes.string };

const LegendRow = ({ items, shape }) => (
  <Stack direction="row"
sx={{ flexWrap: 'wrap', columnGap: 2, rowGap: 0.5 }}>
    {items.map(({ key, label, color }) => (
      <Stack key={key}
direction="row"
spacing={0.75}
alignItems="center">
        <Swatch color={color}
shape={shape} />
        <Typography variant="caption">{label}</Typography>
      </Stack>
    ))}
  </Stack>
);

LegendRow.propTypes = { items: PropTypes.array, shape: PropTypes.string };

const toItems = (map) => Object.entries(map).map(([key, config]) => ({ key, ...config }));

export const GpsMapLegend = ({ layers }) => {
  const theme = useTheme();
  return (
    <Stack
      spacing={0.5}
      sx={{
        position: 'absolute',
        left: 12,
        bottom: 12,
        maxWidth: 'calc(100% - 80px)',
        px: 1.5,
        py: 1,
        borderRadius: 1,
        backgroundColor: alpha(theme.palette.background.paper, 0.9),
        boxShadow: 1,
      }}
    >
      <LegendRow items={toItems(unitStatusMap)} />
      {layers.traffic && <LegendRow items={toItems(TRAFFIC_LEVELS)}
shape="line" />}
      {layers.hotspots && (
        <LegendRow
          items={toItems(HOTSPOT_LEVELS)}
          shape="line"
        />
      )}
      {layers.geofences && (
        <LegendRow items={toItems(GEOFENCE_TYPES).map((item) => ({ ...item, label: `Geocerca ${item.label.toLowerCase()}` }))} />
      )}
    </Stack>
  );
};

GpsMapLegend.propTypes = { layers: PropTypes.object };

// Live counters for the active layers, shown in the top-right corner of the map.
export const GpsMapCounters = ({ units, layers }) => {
  const unauthorized = units.filter((u) => u.unauthorizedStop).length;
  const counters = [
    unauthorized > 0 && { key: 'stop', label: 'en parada no autorizada', color: 'error', count: unauthorized },
    layers.geofences && { key: 'geofence', label: 'en geocerca', color: 'info', count: units.filter((u) => u.geofence).length },
    layers.hotspots && { key: 'hotspot', label: 'en ruta caliente', color: 'error', count: units.filter((u) => u.hotspot).length },
    layers.traffic && { key: 'traffic', label: 'en tráfico denso', color: 'warning', count: units.filter((u) => u.trafficLevel === 'heavy').length },
  ].filter(Boolean);

  if (!counters.length) return null;

  return (
    <Stack spacing={0.75}
alignItems="flex-end"
sx={{ position: 'absolute', top: { xs: 60, md: 12 }, right: 12 }}>
      {counters.map(({ key, label, color, count }) => (
        <Chip
          key={key}
          size="small"
          color={count ? color : 'default'}
          label={`${count} ${count === 1 ? 'unidad' : 'unidades'} ${label}`}
          sx={{ boxShadow: 1, backgroundColor: count ? undefined : 'background.paper' }}
        />
      ))}
    </Stack>
  );
};

GpsMapCounters.propTypes = { units: PropTypes.array, layers: PropTypes.object };
