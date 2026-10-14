import { Alert, Box, Stack, Typography, Collapse } from '@mui/material';
import ExclamationTriangleIcon from '@heroicons/react/24/solid/ExclamationTriangleIcon';
import { SvgIcon } from '@mui/material';

export const OperatorsAlerts = ({ alerts = [] }) => {
  if (alerts.length === 0) return null;

  return (
    <Collapse in={alerts.length > 0}>
      <Alert
        severity="warning"
        icon={<SvgIcon><ExclamationTriangleIcon /></SvgIcon>}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="subtitle2">
            Documentos por vencer
          </Typography>
          <Typography variant="body2">
            Tienes {alerts.length} documento(s) de operadores que vencerán en los próximos 30 días. Por favor, actualízalos para mantener la operación al día.
          </Typography>
        </Box>
      </Alert>
    </Collapse>
  );
};
