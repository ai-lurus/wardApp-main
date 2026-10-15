import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { Chip, Stack, Typography } from '@mui/material';
import { HOTSPOT_LEVELS, TRAFFIC_LEVELS, delayInfo } from 'src/utils/gps-insights';

// Alert chips for a live unit, most urgent first: unauthorized stop, hot route, traffic, geofence.
export const unitAlertChips = (unit) =>
  [
    unit.unauthorizedStop && { key: 'stop', label: 'Parada no autorizada', color: 'error', variant: 'filled' },
    unit.hotspot && {
      key: 'hotspot',
      label: `Ruta caliente: ${unit.hotspot.reason}`,
      color: HOTSPOT_LEVELS[unit.hotspot.level].color,
    },
    unit.trafficLevel && unit.trafficLevel !== 'free' && {
      key: 'traffic',
      label: `Tráfico ${TRAFFIC_LEVELS[unit.trafficLevel].label.toLowerCase()}`,
      color: TRAFFIC_LEVELS[unit.trafficLevel].color,
    },
    unit.geofence && { key: 'geofence', label: unit.geofence.name, color: 'info' },
  ].filter(Boolean);

export const UnitAlerts = ({ unit }) => {
  const chips = unitAlertChips(unit);
  if (!chips.length) return null;
  return (
    <Stack direction="row"
sx={{ flexWrap: 'wrap', gap: 0.5 }}>
      {chips.map(({ key, label, color, variant = 'outlined' }) => (
        <Chip key={key}
label={label}
color={color}
size="small"
variant={variant}
sx={{ maxWidth: '100%' }} />
      ))}
    </Stack>
  );
};

UnitAlerts.propTypes = { unit: PropTypes.object };

export const UnitEta = ({ estimate }) => {
  if (!estimate) return null;
  const delay = delayInfo(estimate.delayMinutes);
  return (
    <Typography variant="caption">
      ETA {format(new Date(estimate.eta), 'dd/MM HH:mm')} ·{' '}
      <Typography component="span"
variant="caption"
color={`${delay.color}.main`}>
        {delay.label}
      </Typography>
    </Typography>
  );
};

UnitEta.propTypes = { estimate: PropTypes.object };
