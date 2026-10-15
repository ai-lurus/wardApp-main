import { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Skeleton,
  Snackbar,
  Stack,
  SvgIcon,
  Typography,
} from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { GpsDevicesTable } from 'src/sections/gps/devices/gps-devices-table';
import { GpsDeviceHistory } from 'src/sections/gps/devices/gps-device-history';
import { GpsUnitsWithoutGps } from 'src/sections/gps/devices/gps-units-without-gps';
import { GpsDeviceAssignDialog } from 'src/sections/gps/devices/gps-device-assign-dialog';
import { GpsDeviceRegisterDialog } from 'src/sections/gps/devices/gps-device-register-dialog';
import { GpsDeviceUnassignDialog } from 'src/sections/gps/devices/gps-device-unassign-dialog';
import { gpsApi } from 'src/services/apiService';

const CLOSED_ASSIGN = { open: false, unitId: '', deviceId: '' };

const SummaryCard = ({ label, value, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography color="text.secondary"
variant="overline">
        {label}
      </Typography>
      <Typography variant="h4"
color={color ? `${color}.main` : 'text.primary'}
sx={{ mt: 0.5 }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const Page = () => {
  const router = useRouter();
  const [devices, setDevices] = useState([]);
  const [history, setHistory] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assign, setAssign] = useState(CLOSED_ASSIGN);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [unassignDevice, setUnassignDevice] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const notify = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const refresh = useCallback(async () => {
    const [devicesResult, historyResult] = await Promise.all([gpsApi.listDevices(), gpsApi.listDeviceHistory()]);
    setDevices(devicesResult);
    setHistory(historyResult);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [unitsResult] = await Promise.all([gpsApi.listAssignableUnits(), refresh()]);
        setUnits(unitsResult);
      } catch (err) {
        console.error('Error loading GPS devices:', err);
        notify('Error al cargar dispositivos', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [refresh]);

  // Opened from a unit detail page with ?unitId=...
  useEffect(() => {
    if (router.query.unitId && !loading) {
      setAssign({ open: true, unitId: String(router.query.unitId), deviceId: '' });
    }
  }, [router.query.unitId, loading]);

  // Units annotated with the device they currently carry, if any.
  const unitsWithDevice = useMemo(
    () =>
      units.map((unit) => {
        const device = devices.find((item) => item.unitId === unit.id);
        return { ...unit, deviceImei: device?.imei || null };
      }),
    [units, devices]
  );
  const unitsWithoutGps = unitsWithDevice.filter((unit) => !unit.deviceImei);
  const source = units[0]?.source || 'demo';

  const counts = useMemo(
    () => ({
      active: devices.filter((d) => d.unitId && d.status === 'active').length,
      silent: devices.filter((d) => d.status === 'silent').length,
      stock: devices.filter((d) => !d.unitId && d.status !== 'fault').length,
      fault: devices.filter((d) => d.status === 'fault').length,
    }),
    [devices]
  );

  const closeAssign = () => {
    setAssign(CLOSED_ASSIGN);
    if (router.query.unitId) router.replace('/gps/devices', undefined, { shallow: true });
  };

  const handleAssign = async (values) => {
    const device = await gpsApi.assignDevice(values);
    await refresh();
    closeAssign();
    notify(`GPS ${device.imei} asignado a ${values.unitLabel}`);
  };

  const handleRegister = async (values) => {
    const device = await gpsApi.registerDevice(values);
    await refresh();
    setRegisterOpen(false);
    notify(`Dispositivo ${device.imei} registrado en almacén`);
  };

  const handleUnassign = async (values) => {
    try {
      await gpsApi.unassignDevice(values);
      await refresh();
      notify('GPS desvinculado; quedó en almacén');
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setUnassignDevice(null);
    }
  };

  return (
    <>
      <Head>
        <title>Dispositivos GPS | Ward</title>
      </Head>
      <Box component="main"
sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ sm: 'center' }}
              spacing={2}
            >
              <Stack spacing={0.5}>
                <Stack direction="row"
spacing={1.5}
alignItems="center">
                  <Typography variant="h4">Dispositivos GPS</Typography>
                  <Chip label="Demo"
color="primary"
size="small"
variant="outlined" />
                </Stack>
                <Typography color="text.secondary"
variant="body2">
                  Registra equipos, asígnalos a una unidad y lleva el historial de cada cambio.
                </Typography>
              </Stack>
              <Stack direction="row"
spacing={1}>
                <Button variant="outlined"
onClick={() => setRegisterOpen(true)}>
                  Registrar dispositivo
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SvgIcon fontSize="small"><PlusIcon /></SvgIcon>}
                  onClick={() => setAssign({ open: true, unitId: '', deviceId: '' })}
                >
                  Asignar GPS
                </Button>
              </Stack>
            </Stack>

            {loading ? (
              <Skeleton variant="rounded"
height={480} />
            ) : (
              <>
                <Box>
                  <Grid container
spacing={3}>
                    <Grid item
xs={6}
md={3}>
                      <SummaryCard label="Reportando"
value={counts.active}
color="success" />
                    </Grid>
                    <Grid item
xs={6}
md={3}>
                      <SummaryCard label="Sin señal"
value={counts.silent}
color="error" />
                    </Grid>
                    <Grid item
xs={6}
md={3}>
                      <SummaryCard label="En almacén"
value={counts.stock}
color="info" />
                    </Grid>
                    <Grid item
xs={6}
md={3}>
                      <SummaryCard label="Unidades sin GPS"
value={unitsWithoutGps.length}
color="warning" />
                    </Grid>
                  </Grid>
                </Box>

                <GpsDevicesTable
                  devices={devices}
                  onAssign={(device) => setAssign({ open: true, unitId: '', deviceId: device.id })}
                  onReassign={(device) => setAssign({ open: true, unitId: '', deviceId: device.id })}
                  onUnassign={setUnassignDevice}
                />

                <Box>
                  <Grid container
spacing={3}>
                    <Grid item
xs={12}
md={6}
sx={{ minWidth: 0 }}>
                      <GpsUnitsWithoutGps
                        units={unitsWithoutGps}
                        source={source}
                        onAssign={(unit) => setAssign({ open: true, unitId: unit.id, deviceId: '' })}
                      />
                    </Grid>
                    <Grid item
xs={12}
md={6}
sx={{ minWidth: 0 }}>
                      <GpsDeviceHistory history={history} />
                    </Grid>
                  </Grid>
                </Box>
              </>
            )}
          </Stack>
        </Container>
      </Box>

      <GpsDeviceAssignDialog
        open={assign.open}
        onClose={closeAssign}
        onSubmit={handleAssign}
        units={unitsWithDevice}
        devices={devices}
        initialUnitId={assign.unitId}
        initialDeviceId={assign.deviceId}
      />
      <GpsDeviceRegisterDialog open={registerOpen}
onClose={() => setRegisterOpen(false)}
onSubmit={handleRegister} />
      <GpsDeviceUnassignDialog device={unassignDevice}
onClose={() => setUnassignDevice(null)}
onConfirm={handleUnassign} />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity}
variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
