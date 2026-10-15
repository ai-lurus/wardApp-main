import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { Card, CardHeader, Divider, Stack, Typography } from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';
import { SeverityPill } from 'src/components/severity-pill';

const ACTIONS = {
  assigned: { label: 'Asignado', color: 'success' },
  reassigned: { label: 'Reasignado', color: 'info' },
  unassigned: { label: 'Desvinculado', color: 'warning' },
  registered: { label: 'Registrado', color: 'primary' },
};

export const GpsDeviceHistory = ({ history = [] }) => (
  <Card sx={{ height: '100%' }}>
    <CardHeader title="Historial de asignaciones"
subheader="Cada alta, cambio y baja queda registrada" />
    <Divider />
    <Scrollbar sx={{ maxHeight: 360 }}>
      <Stack divider={<Divider />}>
        {history.map((entry) => {
          const action = ACTIONS[entry.action];
          return (
            <Stack key={entry.id}
spacing={0.5}
sx={{ px: 3, py: 1.5 }}>
              <Stack direction="row"
spacing={1}
alignItems="center"
justifyContent="space-between">
                <Typography variant="subtitle2"
sx={{ fontFamily: 'monospace' }}>
                  {entry.imei}
                </Typography>
                <SeverityPill color={action.color}>{action.label}</SeverityPill>
              </Stack>
              {entry.unitLabel && <Typography variant="body2">{entry.unitLabel}</Typography>}
              {entry.note && (
                <Typography variant="caption"
color="text.secondary">
                  {entry.note}
                </Typography>
              )}
              <Typography variant="caption"
color="text.secondary">
                {format(new Date(entry.at), 'dd/MM/yyyy HH:mm')} · {entry.by}
              </Typography>
            </Stack>
          );
        })}
      </Stack>
    </Scrollbar>
  </Card>
);

GpsDeviceHistory.propTypes = { history: PropTypes.array };
