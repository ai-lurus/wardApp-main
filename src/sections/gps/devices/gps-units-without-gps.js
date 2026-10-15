import PropTypes from 'prop-types';
import { Box, Button, Card, CardHeader, Divider, Stack, Typography } from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';

export const GpsUnitsWithoutGps = ({ units = [], source = 'demo', onAssign }) => (
  <Card sx={{ height: '100%' }}>
    <CardHeader
      title="Unidades sin GPS"
      subheader={source === 'fleet' ? 'Desde tu módulo de flota' : 'Unidades de la demo'}
    />
    <Divider />
    {units.length ? (
      <Scrollbar sx={{ maxHeight: 360 }}>
        <Stack divider={<Divider />}>
          {units.map((unit) => (
            <Stack key={unit.id}
direction="row"
alignItems="center"
justifyContent="space-between"
spacing={2}
sx={{ px: 3, py: 1.5 }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2"
noWrap>
                  {unit.label}
                </Typography>
                <Typography variant="caption"
color="text.secondary"
noWrap
display="block">
                  {unit.vehicle}
                </Typography>
              </Box>
              <Button size="small"
variant="contained"
onClick={() => onAssign(unit)}
sx={{ flexShrink: 0 }}>
                Asignar GPS
              </Button>
            </Stack>
          ))}
        </Stack>
      </Scrollbar>
    ) : (
      <Typography color="text.secondary"
sx={{ px: 3, py: 2 }}>
        Todas las unidades tienen GPS.
      </Typography>
    )}
  </Card>
);

GpsUnitsWithoutGps.propTypes = { units: PropTypes.array, source: PropTypes.string, onAssign: PropTypes.func };
