import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { formatDistanceToNowStrict } from 'date-fns';
import es from 'date-fns/locale/es';
import { Divider, List, ListItemButton, Stack, Typography } from '@mui/material';
import { UnitAlerts, UnitEta } from './gps-unit-badges';
import { UnitStatusPill } from './gps-status';

const speedLabel = (unit) => {
  if (unit.status === 'moving') return `${unit.currentSpeed} km/h`;
  if (unit.status === 'stopped' && unit.stoppedMinutes) return `Detenida ${Math.round(unit.stoppedMinutes)} min`;
  return unit.stopReason || '0 km/h';
};

const lastSignal = (unit) =>
  unit.status === 'offline'
    ? `Sin señal hace ${formatDistanceToNowStrict(new Date(unit.lastUpdate), { locale: es })}`
    : 'Señal en vivo';

const UnitRow = ({ unit, selected, onSelect, estimate }) => {
  const ref = useRef(null);
  // Keep the selected unit visible when it is picked on the map.
  useEffect(() => {
    if (selected) ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selected]);

  return (
    <ListItemButton
      ref={ref}
      selected={selected}
      onClick={() => onSelect(unit.id)}
      aria-label={`${unit.eco}, ${unit.driver?.name}`}
      sx={{ alignItems: 'flex-start', py: 1.5, px: 2 }}
    >
      <Stack spacing={0.5}
sx={{ width: '100%', minWidth: 0 }}>
        <Stack direction="row"
justifyContent="space-between"
alignItems="center"
spacing={1}>
          <Typography variant="subtitle2"
noWrap
sx={{ minWidth: 0 }}>
            {unit.eco} · {unit.plate}
          </Typography>
          <UnitStatusPill status={unit.status} />
        </Stack>
        <Typography variant="body2"
color="text.secondary"
noWrap>
          {unit.driver?.name}
        </Typography>
        <Typography variant="caption"
color="text.secondary"
noWrap>
          {unit.status === 'idle'
            ? `En base: ${unit.route.originName}`
            : `${unit.route.originName} → ${unit.route.destinationName}`}
        </Typography>
        <Stack direction="row"
justifyContent="space-between"
spacing={1}>
          <Typography variant="caption">{speedLabel(unit)}</Typography>
          <Typography variant="caption"
color={unit.status === 'offline' ? 'error.main' : 'text.secondary'}>
            {lastSignal(unit)}
          </Typography>
        </Stack>
        <UnitEta estimate={estimate} />
        <UnitAlerts unit={unit} />
      </Stack>
    </ListItemButton>
  );
};

UnitRow.propTypes = {
  unit: PropTypes.object,
  selected: PropTypes.bool,
  onSelect: PropTypes.func,
  estimate: PropTypes.object,
};

export const GpsUnitsList = ({ units = [], selectedId = null, onSelect = () => {}, etaByUnit = {} }) => (
  <List disablePadding
aria-label="Unidades">
    {units.map((unit) => (
      <div key={unit.id}>
        <UnitRow unit={unit}
selected={unit.id === selectedId}
onSelect={onSelect}
estimate={etaByUnit[unit.id]} />
        <Divider />
      </div>
    ))}
  </List>
);

GpsUnitsList.propTypes = {
  units: PropTypes.array,
  selectedId: PropTypes.string,
  onSelect: PropTypes.func,
  etaByUnit: PropTypes.object,
};
