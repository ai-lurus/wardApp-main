import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { Box, Button, Card, CardContent, CardHeader, Divider, LinearProgress, Stack, Typography } from '@mui/material';
import { delayInfo, formatDuration } from 'src/utils/gps-insights';
import { TripStatusPill } from './gps-status';

const formatDate = (value) => format(new Date(value), 'dd/MM HH:mm');

const Field = ({ label, children }) => (
  <Box>
    <Typography variant="body2"
color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body1">{children}</Typography>
  </Box>
);

Field.propTypes = { label: PropTypes.string, children: PropTypes.node };

// Current trip of a unit with a live ETA that accounts for traffic and stops.
export const GpsUnitTripCard = ({ trip, progress = 0, estimate = null, onShare }) => {
  const percent = Math.round(progress * 100);
  const delay = estimate ? delayInfo(estimate.delayMinutes) : null;

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title="Viaje actual"
        sx={{ flexWrap: 'wrap', gap: 1, '& .MuiCardHeader-action': { m: 0 } }}
        action={trip && onShare && (
          <Button size="small"
onClick={() => onShare(trip)}>
            Compartir seguimiento
          </Button>
        )}
      />
      <Divider />
      <CardContent>
        {trip ? (
          <Stack spacing={2}>
            <Stack direction="row"
justifyContent="space-between"
alignItems="center">
              <Typography variant="subtitle1">{trip.id}</Typography>
              <TripStatusPill status={trip.status} />
            </Stack>
            <Field label="Cliente">{trip.client}</Field>
            <Field label="Carga">
              {trip.cargo} · {trip.weightTon} t
            </Field>
            <Field label="Ruta">
              {trip.origin} → {trip.destination}
            </Field>
            <Box>
              <Stack direction="row"
justifyContent="space-between">
                <Typography variant="body2"
color="text.secondary">
                  Avance
                </Typography>
                <Typography variant="body2">{percent}%</Typography>
              </Stack>
              <LinearProgress variant="determinate"
value={percent}
sx={{ mt: 1, height: 8, borderRadius: 4 }} />
            </Box>
            <Stack direction="row"
justifyContent="space-between"
spacing={2}>
              <Field label={trip.status === 'scheduled' ? 'Salida programada' : 'Salida'}>
                {formatDate(trip.departedAt)}
              </Field>
              {estimate && (
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2"
color="text.secondary">
                    ETA estimada
                  </Typography>
                  <Typography variant="body1"
color={`${delay.color}.main`}>
                    {formatDate(estimate.eta)}
                  </Typography>
                </Box>
              )}
            </Stack>
            {estimate && (
              <Box sx={{ p: 1.5, borderRadius: 1, backgroundColor: 'neutral.50' }}>
                <Typography variant="body2">
                  Plan {formatDate(estimate.plannedEta)} ·{' '}
                  <Typography component="span"
variant="body2"
color={`${delay.color}.main`}>
                    {delay.label}
                  </Typography>
                </Typography>
                <Typography variant="caption"
color="text.secondary"
display="block">
                  Restan {estimate.remainingKm} km
                  {estimate.trafficMinutes > 0
                    ? ` · tráfico agrega ${formatDuration(estimate.trafficMinutes)}`
                    : ' · sin tráfico en lo que resta'}
                </Typography>
              </Box>
            )}
          </Stack>
        ) : (
          <Typography color="text.secondary">Sin viaje asignado.</Typography>
        )}
      </CardContent>
    </Card>
  );
};

GpsUnitTripCard.propTypes = {
  trip: PropTypes.object,
  progress: PropTypes.number,
  estimate: PropTypes.object,
  onShare: PropTypes.func,
};
