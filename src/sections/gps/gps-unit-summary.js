import PropTypes from 'prop-types';
import NextLink from 'next/link';
import XMarkIcon from '@heroicons/react/24/solid/XMarkIcon';
import { Box, Button, IconButton, Stack, SvgIcon, Typography } from '@mui/material';
import { UnitAlerts, UnitEta } from './gps-unit-badges';
import { UnitStatusPill } from './gps-status';

// Compact summary of the selected unit, shown at the top of the units panel.
export const GpsUnitSummary = ({ unit, estimate, onClose }) => (
  <Box
    sx={{ px: 2, py: 1.5, backgroundColor: 'primary.alpha4', borderBottom: 1, borderColor: 'divider' }}
    role="region"
    aria-label={`Resumen de ${unit.eco}`}
  >
    <Stack direction="row"
justifyContent="space-between"
alignItems="flex-start"
spacing={1}>
      <Box sx={{ minWidth: 0 }}>
        <Stack direction="row"
spacing={1}
alignItems="center">
          <Typography variant="subtitle1"
noWrap>
            {unit.eco}
          </Typography>
          <UnitStatusPill status={unit.status} />
        </Stack>
        <Typography variant="body2"
color="text.secondary"
noWrap>
          {unit.driver?.name} · {unit.vehicle}
        </Typography>
      </Box>
      <IconButton size="small"
onClick={onClose}
aria-label="Cerrar resumen">
        <SvgIcon fontSize="small">
          <XMarkIcon />
        </SvgIcon>
      </IconButton>
    </Stack>
    <Stack spacing={0.75}
sx={{ mt: 1 }}>
      <Typography variant="body2">
        {unit.route.originName} → {unit.route.destinationName}
      </Typography>
      <Typography variant="caption"
color="text.secondary">
        {unit.status === 'moving' ? `${unit.currentSpeed} km/h` : unit.stopReason || 'Sin movimiento'} · Avance{' '}
        {Math.round(unit.progress * 100)}% · Combustible {unit.fuel}%
      </Typography>
      {unit.unauthorizedStop && (
        <Typography variant="caption"
color="error.main">
          {unit.unauthorizedStop.reason}
        </Typography>
      )}
      <UnitEta estimate={estimate} />
      <UnitAlerts unit={unit} />
      <Box>
        <Button component={NextLink}
href={`/gps/units/${unit.id}?from=map`}
size="small"
variant="contained">
          Ver detalle
        </Button>
      </Box>
    </Stack>
  </Box>
);

GpsUnitSummary.propTypes = { unit: PropTypes.object, estimate: PropTypes.object, onClose: PropTypes.func };
