import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { Box, Card, CardHeader, Divider, Stack, Typography } from '@mui/material';

const eventColors = {
  position: 'success',
  toll: 'info',
  speeding: 'error',
  harsh: 'error',
  fuel: 'primary',
  geofence: 'info',
  ignition: 'primary',
  stop: 'warning',
  signal: 'error',
  maintenance: 'success',
  hotspot: 'error',
  unauthorized_stop: 'error',
};

export const GpsUnitEvents = ({ events = [] }) => (
  <Card sx={{ height: '100%' }}>
    <CardHeader title="Historial de eventos"
subheader="Últimas horas" />
    <Divider />
    <Stack spacing={0}
sx={{ px: 3, py: 2 }}>
      {events.map((event, index) => (
        <Stack key={event.id}
direction="row"
spacing={2}>
          <Stack alignItems="center">
            <Box
              sx={{
                width: 12,
                height: 12,
                mt: 0.5,
                borderRadius: '50%',
                backgroundColor: `${eventColors[event.type] || 'primary'}.main`,
              }}
            />
            {index < events.length - 1 && (
              <Box sx={{ width: 2, flexGrow: 1, backgroundColor: 'divider', my: 0.5 }} />
            )}
          </Stack>
          <Box sx={{ pb: 2.5 }}>
            <Typography variant="body2">{event.label}</Typography>
            <Typography variant="caption"
color="text.secondary">
              {format(new Date(event.at), 'dd/MM/yyyy HH:mm')}
            </Typography>
          </Box>
        </Stack>
      ))}
    </Stack>
  </Card>
);

GpsUnitEvents.propTypes = {
  events: PropTypes.array,
};
