import PropTypes from 'prop-types';
import NextLink from 'next/link';
import { format, formatDistanceToNowStrict } from 'date-fns';
import es from 'date-fns/locale/es';
import { Box, Button, Card, Divider, Link, Stack, Typography } from '@mui/material';
import { SeverityPill } from 'src/components/severity-pill';
import { ALERT_SEVERITIES, ALERT_STATUSES, ALERT_TYPES } from 'src/utils/gps-alerts';

const NEXT_ACTIONS = {
  pending: [
    { status: 'in_progress', label: 'Atender', variant: 'contained' },
    { status: 'resolved', label: 'Resolver', variant: 'outlined' },
  ],
  in_progress: [{ status: 'resolved', label: 'Resolver', variant: 'contained' }],
  resolved: [{ status: 'pending', label: 'Reabrir', variant: 'text' }],
};

const AlertRow = ({ alert, onChangeStatus }) => {
  const severity = ALERT_SEVERITIES[alert.severity];
  const status = ALERT_STATUSES[alert.status];
  const lastNote = [...alert.history].reverse().find((entry) => entry.note);
  const unitHref = `/gps/units/${alert.unitId}?from=alerts`;

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      justifyContent="space-between"
      sx={{ px: 3, py: 2, opacity: alert.status === 'resolved' ? 0.75 : 1 }}
    >
      <Stack spacing={0.75}
sx={{ minWidth: 0 }}>
        <Stack direction="row"
spacing={1}
alignItems="center"
sx={{ flexWrap: 'wrap', rowGap: 0.5 }}>
          <SeverityPill color={severity.color}>{severity.label}</SeverityPill>
          <Typography variant="overline"
color="text.secondary"
sx={{ lineHeight: 1.5 }}>
            {ALERT_TYPES[alert.type].label}
          </Typography>
          <SeverityPill color={status.color}>{status.label}</SeverityPill>
        </Stack>
        <Typography variant="subtitle2">{alert.title}</Typography>
        <Typography variant="body2"
color="text.secondary">
          <Link component={NextLink}
href={unitHref}
underline="hover"
color="text.primary"
fontWeight={600}>
            {alert.unitEco}
          </Link>{' '}
          · {alert.unitPlate} · {alert.driverName}
        </Typography>
        <Typography variant="caption"
color="text.secondary"
title={format(new Date(alert.at), 'dd/MM/yyyy HH:mm')}>
          {format(new Date(alert.at), 'dd/MM HH:mm')} · hace {formatDistanceToNowStrict(new Date(alert.at), { locale: es })}
        </Typography>
        {lastNote && (
          <Typography variant="caption"
sx={{ fontStyle: 'italic' }}>
            “{lastNote.note}” · {lastNote.by}, {format(new Date(lastNote.at), 'dd/MM HH:mm')}
          </Typography>
        )}
      </Stack>
      <Stack spacing={1}
alignItems={{ md: 'flex-end' }}
sx={{ flexShrink: 0 }}>
        <Stack direction="row"
spacing={1}>
          {NEXT_ACTIONS[alert.status].map((action) => (
            <Button key={action.status}
size="small"
variant={action.variant}
onClick={() => onChangeStatus(alert, action.status)}>
              {action.label}
            </Button>
          ))}
        </Stack>
        <Stack direction="row"
spacing={1.5}>
          <Link component={NextLink}
href={`/gps?unit=${alert.unitId}`}
underline="hover"
variant="body2">
            Ver en el mapa
          </Link>
          <Link
            component={NextLink}
            href={`${unitHref}&replayAt=${encodeURIComponent(alert.at)}`}
            underline="hover"
            variant="body2"
          >
            Reproducir recorrido
          </Link>
        </Stack>
      </Stack>
    </Stack>
  );
};

AlertRow.propTypes = { alert: PropTypes.object, onChangeStatus: PropTypes.func };

export const GpsAlertsList = ({ alerts = [], onChangeStatus, onClearFilters }) => (
  <Card>
    {alerts.length ? (
      <Stack divider={<Divider />}>
        {alerts.map((alert) => (
          <AlertRow key={alert.id}
alert={alert}
onChangeStatus={onChangeStatus} />
        ))}
      </Stack>
    ) : (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary"
sx={{ mb: 1.5 }}>
          No hay alertas con estos filtros.
        </Typography>
        <Button onClick={onClearFilters}>Limpiar filtros</Button>
      </Box>
    )}
  </Card>
);

GpsAlertsList.propTypes = { alerts: PropTypes.array, onChangeStatus: PropTypes.func, onClearFilters: PropTypes.func };
