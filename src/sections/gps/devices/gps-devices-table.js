import PropTypes from 'prop-types';
import NextLink from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';
import es from 'date-fns/locale/es';
import { Box, Button, Card, CardHeader, Link, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';
import { SeverityPill } from 'src/components/severity-pill';
import { DEVICE_STATUS } from 'src/utils/gps-devices';

const lastSignalLabel = (value) =>
  value ? `Hace ${formatDistanceToNowStrict(new Date(value), { locale: es })}` : 'Nunca ha reportado';

const UnitCell = ({ device }) => {
  if (!device.unitId) {
    return <Typography variant="body2"
color="text.secondary">Sin asignar</Typography>;
  }
  // Only demo GPS units have a live detail page.
  if (device.unitId.startsWith('gps_')) {
    return (
      <Link component={NextLink}
href={`/gps/units/${device.unitId}`}
underline="hover"
variant="subtitle2">
        {device.unitLabel}
      </Link>
    );
  }
  return <Typography variant="subtitle2">{device.unitLabel}</Typography>;
};

UnitCell.propTypes = { device: PropTypes.object };

export const GpsDevicesTable = ({ devices = [], onAssign, onReassign, onUnassign }) => (
  <Card>
    <CardHeader title="Dispositivos"
subheader={`${devices.length} registrados`} />
    <Scrollbar>
      <Box sx={{ minWidth: 960 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>IMEI / Modelo</TableCell>
              <TableCell>SIM</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Unidad</TableCell>
              <TableCell>Última señal</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {devices.map((device) => {
              const status = DEVICE_STATUS[device.status];
              return (
                <TableRow hover
key={device.id}>
                  <TableCell>
                    <Typography variant="subtitle2"
sx={{ fontFamily: 'monospace' }}>
                      {device.imei}
                    </Typography>
                    <Typography variant="caption"
color="text.secondary">
                      {device.model}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{device.carrier}</Typography>
                    <Typography variant="caption"
color="text.secondary"
sx={{ fontFamily: 'monospace' }}>
                      {device.iccid}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <SeverityPill color={status.color}>{status.label}</SeverityPill>
                  </TableCell>
                  <TableCell>
                    <UnitCell device={device} />
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{lastSignalLabel(device.lastSignal)}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row"
spacing={1}
justifyContent="flex-end">
                      {device.unitId ? (
                        <>
                          <Button size="small"
onClick={() => onReassign(device)}>
                            Reasignar
                          </Button>
                          <Button size="small"
color="error"
onClick={() => onUnassign(device)}>
                            Desvincular
                          </Button>
                        </>
                      ) : (
                        <Button size="small"
variant="outlined"
disabled={device.status === 'fault'}
onClick={() => onAssign(device)}>
                          Asignar
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    </Scrollbar>
  </Card>
);

GpsDevicesTable.propTypes = {
  devices: PropTypes.array,
  onAssign: PropTypes.func,
  onReassign: PropTypes.func,
  onUnassign: PropTypes.func,
};
