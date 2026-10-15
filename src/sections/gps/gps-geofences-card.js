import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Card,
  CardHeader,
  Divider,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';
import { SeverityPill } from 'src/components/severity-pill';
import { GEOFENCE_TYPES } from 'src/utils/gps-insights';

const alertSummary = (alerts = {}) =>
  [alerts.entry && 'entrada', alerts.exit && 'salida', alerts.dwellMinutes && `permanencia > ${alerts.dwellMinutes} min`]
    .filter(Boolean)
    .join(', ') || 'sin alertas';

// Tolerance before a stop outside an allowed zone counts as unauthorized. Saved on blur.
const StopThreshold = ({ value, onSave }) => {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }}
spacing={1.5}
alignItems={{ sm: 'center' }}
sx={{ px: 3, py: 2 }}>
      <Typography variant="body2"
sx={{ flexGrow: 1 }}>
        Una unidad detenida fuera de un patio, cliente, puerto, aduana o zona de descanso genera <b>parada no autorizada</b> después de:
      </Typography>
      <TextField
        size="small"
        type="number"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => Number(draft) !== value && onSave(Number(draft))}
        inputProps={{ min: 1, max: 600 }}
        InputProps={{ endAdornment: <InputAdornment position="end">min</InputAdornment> }}
        sx={{ width: 130, flexShrink: 0 }}
      />
    </Stack>
  );
};

StopThreshold.propTypes = { value: PropTypes.number, onSave: PropTypes.func };

export const GpsGeofencesCard = ({ geofences = [], thresholdMinutes, onThresholdChange, onAdd, adding = false, onEdit, onDelete }) => (
  <Card>
    <CardHeader
      title="Geocercas y paradas no autorizadas"
      subheader="Zonas permitidas, zonas donde no se puede detener y sus alertas"
      action={(
        <Button variant="contained"
size="small"
onClick={onAdd}
disabled={adding}>
          Agregar geocerca
        </Button>
      )}
    />
    <Divider />
    <StopThreshold value={thresholdMinutes}
onSave={onThresholdChange} />
    <Divider />
    <Scrollbar sx={{ maxHeight: 420 }}>
      <Stack divider={<Divider />}>
        {geofences.map((fence) => {
          const type = GEOFENCE_TYPES[fence.type];
          return (
            <Stack
              key={fence.id}
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ sm: 'center' }}
              spacing={1.5}
              sx={{ px: 3, py: 1.5 }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Stack direction="row"
spacing={1}
alignItems="center"
sx={{ flexWrap: 'wrap', rowGap: 0.5 }}>
                  <Typography variant="subtitle2">{fence.name}</Typography>
                  <SeverityPill color={type.color}>{type.label}</SeverityPill>
                </Stack>
                <Typography variant="caption"
color="text.secondary">
                  Radio {fence.radiusKm} km · Alertas: {alertSummary(fence.alerts)}
                </Typography>
              </Box>
              <Stack direction="row"
spacing={1}
sx={{ flexShrink: 0 }}>
                <Button size="small"
onClick={() => onEdit(fence)}>
                  Editar
                </Button>
                <Button size="small"
color="error"
onClick={() => onDelete(fence)}>
                  Borrar
                </Button>
              </Stack>
            </Stack>
          );
        })}
      </Stack>
    </Scrollbar>
  </Card>
);

GpsGeofencesCard.propTypes = {
  geofences: PropTypes.array,
  thresholdMinutes: PropTypes.number,
  onThresholdChange: PropTypes.func,
  onAdd: PropTypes.func,
  adding: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};
