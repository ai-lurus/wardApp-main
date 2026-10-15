import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { Button, Card, CardHeader, Chip, Divider, Stack, Typography } from '@mui/material';
import { SeverityPill } from 'src/components/severity-pill';
import { HOTSPOT_LEVELS } from 'src/utils/gps-insights';

const isExpired = (spot) => spot.validUntil && new Date(spot.validUntil) <= new Date();

// Hot routes marked by hand, with edit and delete. Computed ones are managed from incident data, not here.
export const GpsManualHotspots = ({ hotspots = [], onAdd, adding = false, onEdit, onDelete }) => (
  <Card>
    <CardHeader
      title="Tus rutas calientes"
      subheader="Se suman a las calculadas con los incidentes de los últimos 90 días"
      action={(
        <Button
          variant="contained"
          color="error"
          size="small"
          onClick={onAdd}
          disabled={adding}
        >
          Agregar ruta caliente
        </Button>
      )}
    />
    <Divider />
    {hotspots.length ? (
      <Stack divider={<Divider />}>
        {hotspots.map((spot) => (
          <Stack
            key={spot.id}
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ sm: 'center' }}
            spacing={1.5}
            sx={{ px: 3, py: 1.5 }}
          >
            <Stack spacing={0.5}
sx={{ minWidth: 0 }}>
              <Stack direction="row"
spacing={1}
alignItems="center"
sx={{ flexWrap: 'wrap', rowGap: 0.5 }}>
                <Typography variant="subtitle2">{spot.name}</Typography>
                <SeverityPill color={HOTSPOT_LEVELS[spot.level].color}>{HOTSPOT_LEVELS[spot.level].label}</SeverityPill>
                {isExpired(spot) && <Chip label="Vencida"
size="small" />}
              </Stack>
              <Typography variant="body2"
color="text.secondary">
                {spot.reason}
                {spot.note ? ` · ${spot.note}` : ''}
              </Typography>
              <Typography variant="caption"
color="text.secondary">
                {spot.validUntil ? `Vigente hasta ${format(new Date(spot.validUntil), 'dd/MM/yyyy')}` : 'Sin vencimiento'} ·{' '}
                {spot.points.length} puntos · {spot.createdBy}
              </Typography>
            </Stack>
            <Stack direction="row"
spacing={1}
sx={{ flexShrink: 0 }}>
              <Button size="small"
onClick={() => onEdit(spot)}>
                Editar
              </Button>
              <Button size="small"
color="error"
onClick={() => onDelete(spot)}>
                Borrar
              </Button>
            </Stack>
          </Stack>
        ))}
      </Stack>
    ) : (
      <Typography color="text.secondary"
sx={{ px: 3, py: 2 }}>
        Aún no agregas ninguna. Usa “Agregar ruta caliente” y marca el tramo sobre el mapa.
      </Typography>
    )}
  </Card>
);

GpsManualHotspots.propTypes = {
  hotspots: PropTypes.array,
  onAdd: PropTypes.func,
  adding: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};
