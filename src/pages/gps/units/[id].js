import { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { formatDistanceToNowStrict } from 'date-fns';
import es from 'date-fns/locale/es';
import ArrowLeftIcon from '@heroicons/react/24/solid/ArrowLeftIcon';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Divider,
  Grid,
  Link,
  Skeleton,
  Stack,
  SvgIcon,
  Typography,
} from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { GpsFleetMap } from 'src/sections/gps/gps-fleet-map';
import { GpsUnitEvents } from 'src/sections/gps/gps-unit-events';
import { GpsUnitSpeedChart } from 'src/sections/gps/gps-unit-speed-chart';
import { TripStatusPill, UnitStatusPill } from 'src/sections/gps/gps-status';
import { useGpsSimulation } from 'src/hooks/use-gps-simulation';
import { gpsApi } from 'src/services/apiService';
import { GpsUnitTripCard } from 'src/sections/gps/gps-unit-trip-card';
import { GpsRouteReplay } from 'src/sections/gps/gps-route-replay';
import { GpsShareTrackingDialog } from 'src/sections/gps/gps-share-tracking-dialog';
import { HOTSPOT_LEVELS, TRAFFIC_LEVELS, estimateArrival } from 'src/utils/gps-insights';
import { unauthorizedStopFor } from 'src/utils/gps-stops';

// Where the back button returns to, based on ?from= in the URL.
const BACK_LINKS = {
  trips: { href: '/gps/trips', label: 'Viajes en ruta' },
  alerts: { href: '/gps/alerts', label: 'Centro de alertas' },
  map: { href: '/gps', label: 'Mapa de flota' },
};

const EMPTY_OVERLAYS = { geofences: [], hotspots: [], traffic: [] };
const ALL_LAYERS = { geofences: true, hotspots: true, traffic: true };

const StatCard = ({ label, value, caption }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography color="text.secondary"
variant="overline">
        {label}
      </Typography>
      <Typography variant="h5"
sx={{ mt: 0.5 }}>
        {value}
      </Typography>
      {caption && (
        <Typography color="text.secondary"
variant="caption">
          {caption}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const Page = () => {
  const router = useRouter();
  const { id } = router.query;
  const backLink = BACK_LINKS[router.query.from] || BACK_LINKS.map;
  const [unit, setUnit] = useState(null);
  const [cities, setCities] = useState({});
  const [overlays, setOverlays] = useState(EMPTY_OVERLAYS);
  const [device, setDevice] = useState(null);
  const [shareTrip, setShareTrip] = useState(null);
  const [stopRules, setStopRules] = useState({ thresholdMinutes: 15 });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [unitResult, citiesResult, overlaysResult, deviceResult] = await Promise.all([
        gpsApi.getUnit(id),
        gpsApi.listCities(),
        gpsApi.listOverlays(),
        gpsApi.getDeviceForUnit(id),
        gpsApi.getStopRules().then(setStopRules),
      ]);
      setDevice(deviceResult);
      setUnit(unitResult);
      setCities(citiesResult);
      setOverlays(overlaysResult);
    } catch (err) {
      console.error('Error fetching GPS unit:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const simulatedInput = useMemo(() => (unit ? [unit] : []), [unit]);
  const [liveUnit] = useGpsSimulation(simulatedInput, overlays);
  const routeList = useMemo(() => (unit ? [unit.route] : []), [unit]);

  const trip = unit?.currentTrip;
  const estimate = useMemo(
    () =>
      liveUnit && trip
        ? estimateArrival({ unit: liveUnit, trip, traffic: overlays.traffic, now: new Date(liveUnit.simulatedAt) })
        : null,
    [liveUnit, trip, overlays]
  );
  const unauthorizedStop = liveUnit
    ? unauthorizedStopFor(liveUnit, overlays.geofences, stopRules.thresholdMinutes)
    : null;
  // The live unauthorized stop goes on top of the recorded history.
  const stopReason = unauthorizedStop?.reason || null;
  const events = useMemo(() => {
    if (!unit) return [];
    if (!stopReason) return unit.events;
    const stopEvent = {
      id: `${unit.id}_unauthorized_stop`,
      type: 'unauthorized_stop',
      label: `Parada no autorizada: ${stopReason}`,
      at: new Date().toISOString(),
    };
    return [stopEvent, ...unit.events];
  }, [unit, stopReason]);
  const remainingKm = liveUnit ? Math.round(liveUnit.route.distanceKm * (1 - liveUnit.progress)) : 0;

  return (
    <>
      <Head>
        <title>{unit ? `${unit.eco} | GPS | Ward` : 'Unidad | GPS | Ward'}</title>
      </Head>
      <Box component="main"
sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Box>
              <Button
                component={NextLink}
                href={backLink.href}
                color="inherit"
                startIcon={
                  <SvgIcon fontSize="small">
                    <ArrowLeftIcon />
                  </SvgIcon>
                }
              >
                {backLink.label}
              </Button>
            </Box>

            {loading && <Skeleton variant="rounded"
height={480} />}

            {!loading && !unit && (
              <Alert severity="warning">No encontramos esta unidad.</Alert>
            )}

            {!loading && liveUnit && (
              <>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ md: 'center' }}
                  spacing={2}
                >
                  <Stack spacing={0.5}>
                    <Stack direction="row"
spacing={1.5}
alignItems="center">
                      <Typography variant="h4">
                        {liveUnit.eco} · {liveUnit.plate}
                      </Typography>
                      <UnitStatusPill status={liveUnit.status} />
                      <Chip label="Demo"
color="primary"
size="small"
variant="outlined" />
                    </Stack>
                    <Typography color="text.secondary">
                      {liveUnit.vehicle} · {liveUnit.trailer}
                    </Typography>
                  </Stack>
                  <Stack spacing={0.25}
alignItems={{ md: 'flex-end' }}>
                    <Typography variant="subtitle1">{liveUnit.driver.name}</Typography>
                    <Typography color="text.secondary"
variant="body2">
                      Tel. {liveUnit.driver.phone} · Licencia {liveUnit.driver.license}
                    </Typography>
                    <Typography color="text.secondary"
variant="body2">
                      {device ? `GPS ${device.model} · IMEI ${device.imei}` : 'Sin GPS asignado'} ·{' '}
                      <Link component={NextLink}
href={`/gps/devices?unitId=${liveUnit.id}`}
underline="hover">
                        {device ? 'Cambiar GPS' : 'Asignar GPS'}
                      </Link>
                    </Typography>
                    <Stack direction="row"
spacing={2}
justifyContent={{ md: 'flex-end' }}
sx={{ flexWrap: 'wrap', rowGap: 0.5 }}>
                      <Link component={NextLink}
href={`/gps?unit=${liveUnit.id}`}
underline="hover"
variant="body2">
                        Ver en el mapa
                      </Link>
                      <Link
                        component={NextLink}
                        href={`/gps/trips?q=${encodeURIComponent(liveUnit.eco)}`}
                        underline="hover"
                        variant="body2"
                      >
                        Ver sus viajes
                      </Link>
                      <Link href="#recorrido"
underline="hover"
variant="body2">
                        Reproducir recorrido
                      </Link>
                    </Stack>
                  </Stack>
                </Stack>

                {unauthorizedStop && (
                  <Alert severity="error">
                    Parada no autorizada. {unauthorizedStop.reason}. La tolerancia es de {stopRules.thresholdMinutes} min fuera de
                    patios, clientes, puertos, aduanas y zonas de descanso.
                  </Alert>
                )}
                {liveUnit.hotspot && (
                  <Alert severity={HOTSPOT_LEVELS[liveUnit.hotspot.level].color}>
                    Ruta caliente: {liveUnit.hotspot.name}. {liveUnit.hotspot.reason}
                    {liveUnit.hotspot.source === 'manual' ? '.' : ` (${liveUnit.hotspot.incidents} incidentes en 90 días).`}
                  </Alert>
                )}
                {liveUnit.trafficLevel && liveUnit.trafficLevel !== 'free' && (
                  <Alert severity="warning">
                    Tráfico {TRAFFIC_LEVELS[liveUnit.trafficLevel].label.toLowerCase()} en el tramo actual; la ETA ya
                    lo considera.
                  </Alert>
                )}
                {liveUnit.geofence && (
                  <Alert severity="info">Unidad dentro de la geocerca {liveUnit.geofence.name}.</Alert>
                )}

                <Box>
                  <Grid container
spacing={3}>
                    <Grid item
xs={6}
md={3}>
                      <StatCard
                        label="Velocidad"
                        value={`${liveUnit.currentSpeed} km/h`}
                        caption={liveUnit.stopReason || (liveUnit.status === 'moving' ? 'En movimiento' : 'Sin movimiento')}
                      />
                    </Grid>
                    <Grid item
xs={6}
md={3}>
                      <StatCard label="Combustible"
value={`${liveUnit.fuel}%`}
caption="Nivel de tanque" />
                    </Grid>
                    <Grid item
xs={6}
md={3}>
                      <StatCard
                        label="Odómetro"
                        value={`${liveUnit.odometer.toLocaleString('es-MX')} km`}
                        caption={`Restan ${remainingKm} km de ruta`}
                      />
                    </Grid>
                    <Grid item
xs={6}
md={3}>
                      <StatCard
                        label="Última señal"
                        value={
                          liveUnit.status === 'offline'
                            ? `Hace ${formatDistanceToNowStrict(new Date(liveUnit.lastUpdate), { locale: es })}`
                            : 'En línea'
                        }
                        caption={`${liveUnit.position[0].toFixed(4)}, ${liveUnit.position[1].toFixed(4)}`}
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Box>
                  <Grid container
spacing={3}>
                    <Grid item
xs={12}
lg={8}>
                      <Card>
                        <CardHeader title="Ruta"
subheader={liveUnit.route.name} />
                        <Divider />
                        <GpsFleetMap
                          units={[liveUnit]}
                          routes={routeList}
                          cities={cities}
                          selectedId={liveUnit.id}
                          focusPoints={liveUnit.route.points}
                          height={460}
                          aspectRatio={1.6}
                        />
                      </Card>
                    </Grid>
                    <Grid item
xs={12}
lg={4}>
                      <GpsUnitTripCard trip={trip}
progress={liveUnit.progress}
estimate={estimate}
                        onShare={setShareTrip} />
                    </Grid>
                  </Grid>
                </Box>

                <Box>
                  <Grid container
spacing={3}>
                    <Grid item
xs={12}
lg={8}>
                      <Stack spacing={3}>
                        <GpsUnitSpeedChart samples={unit.speedHistory} />
                        <Card>
                          <CardHeader title="Viajes de esta unidad" />
                          <Divider />
                          <Stack divider={<Divider />}>
                            {unit.tripHistory.map((item) => (
                              <Stack
                                key={item.id}
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                sx={{ px: 3, py: 1.5 }}
                              >
                                <Box>
                                  <Typography variant="subtitle2">
                                    {item.id} · {item.client}
                                  </Typography>
                                  <Typography variant="caption"
color="text.secondary">
                                    {item.origin.split(',')[0]} → {item.destination.split(',')[0]} · {item.distanceKm} km
                                  </Typography>
                                </Box>
                                <TripStatusPill status={item.status} />
                              </Stack>
                            ))}
                          </Stack>
                        </Card>
                      </Stack>
                    </Grid>
                    <Grid item
xs={12}
lg={4}>
                      <GpsUnitEvents events={events} />
                    </Grid>
                  </Grid>
                </Box>

                <GpsRouteReplay
                  unit={unit}
                  cities={cities}
                  overlays={overlays}
                  initialAt={router.query.replayAt ? String(router.query.replayAt) : null}
                />
              </>
            )}
          </Stack>
        </Container>
      </Box>
      <GpsShareTrackingDialog trip={shareTrip}
onClose={() => setShareTrip(null)} />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
