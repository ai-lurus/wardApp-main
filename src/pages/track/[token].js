import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { format, formatDistanceToNowStrict } from 'date-fns';
import es from 'date-fns/locale/es';
import { Box, Card, CardContent, Container, LinearProgress, Skeleton, Stack, Typography } from '@mui/material';
import { GpsFleetMap } from 'src/sections/gps/gps-fleet-map';
import { TripStatusPill } from 'src/sections/gps/gps-status';
import { useGpsSimulation } from 'src/hooks/use-gps-simulation';
import { gpsApi } from 'src/services/apiService';
import { delayInfo, estimateArrival } from 'src/utils/gps-insights';

// Public page, no dashboard layout and no login: a customer follows one shipment.

const EMPTY_OVERLAYS = { geofences: [], hotspots: [], traffic: [] };
const NO_LAYERS = { geofences: false, hotspots: false, traffic: false };

const MESSAGES = {
  invalid: { title: 'Enlace no válido', body: 'Revisa que el enlace esté completo o pide uno nuevo a tu transportista.' },
  expired: { title: 'Este enlace ya venció', body: 'Pide a tu transportista un enlace nuevo para seguir el envío.' },
  not_found: { title: 'No encontramos el viaje', body: 'El viaje ya no está disponible. Pide un enlace nuevo a tu transportista.' },
};

const Header = () => (
  <Box sx={{ backgroundColor: 'neutral.900', py: 1.5 }}>
    <Container maxWidth="md">
      <Stack direction="row"
alignItems="center"
spacing={1.5}>
        <Box component="img"
src="/assets/logos/ward-logo-white.png"
alt="Ward"
sx={{ height: 28, width: 'auto' }} />
        <Typography variant="body2"
sx={{ color: 'neutral.300' }}>
          Seguimiento de envío
        </Typography>
      </Stack>
    </Container>
  </Box>
);

const Field = ({ label, value }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography variant="caption"
color="text.secondary"
display="block">
      {label}
    </Typography>
    <Typography variant="body1">{value}</Typography>
  </Box>
);

Field.propTypes = { label: PropTypes.string, value: PropTypes.node };

const Page = () => {
  const router = useRouter();
  const { token } = router.query;
  const [data, setData] = useState(null);
  const [overlays, setOverlays] = useState(EMPTY_OVERLAYS);

  useEffect(() => {
    if (!router.isReady) return;
    Promise.all([gpsApi.getPublicTracking(token), gpsApi.listOverlays()]).then(([tracking, overlaysResult]) => {
      setData(tracking);
      setOverlays(overlaysResult);
    });
  }, [router.isReady, token]);

  const simulated = useMemo(() => (data?.status === 'ok' ? [data.unit] : []), [data]);
  const [liveUnit] = useGpsSimulation(simulated, overlays);
  const trip = data?.trip;
  const delivered = trip?.status === 'delivered';
  const estimate =
    liveUnit && trip && !delivered
      ? estimateArrival({ unit: liveUnit, trip, traffic: overlays.traffic, now: new Date(liveUnit.simulatedAt) })
      : null;
  const delay = estimate ? delayInfo(estimate.delayMinutes) : null;
  const progress = delivered ? 100 : Math.round((liveUnit?.progress || 0) * 100);
  const routes = useMemo(() => (data?.unit ? [data.unit.route] : []), [data]);

  return (
    <>
      <Head>
        <title>Seguimiento de envío | Ward</title>
        <meta name="robots"
content="noindex" />
      </Head>
      <Box sx={{ minHeight: '100vh', backgroundColor: 'neutral.50' }}>
        <Header />
        <Container maxWidth="md"
sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 } }}>
          {!data && <Skeleton variant="rounded"
height={480} />}
          {data && data.status !== 'ok' && (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h5"
sx={{ mb: 1 }}>
                  {MESSAGES[data.status].title}
                </Typography>
                <Typography color="text.secondary">{MESSAGES[data.status].body}</Typography>
                {data.status === 'expired' && data.expiresAt && (
                  <Typography variant="caption"
color="text.secondary"
display="block"
sx={{ mt: 1 }}>
                    Venció el {format(new Date(data.expiresAt), 'dd/MM/yyyy HH:mm')}
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}
          {data?.status === 'ok' && liveUnit && (
            <Stack spacing={2}>
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row"
justifyContent="space-between"
alignItems="flex-start"
spacing={1}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="overline"
color="text.secondary">
                          Envío {trip.id}
                        </Typography>
                        <Typography variant="h5"
component="h1">
                          {trip.origin.split(',')[0]} → {trip.destination.split(',')[0]}
                        </Typography>
                      </Box>
                      <TripStatusPill status={trip.status} />
                    </Stack>
                    {data.options.showEta && (
                      <Box sx={{ p: 2, borderRadius: 1, backgroundColor: 'primary.alpha4' }}>
                        <Typography variant="body2"
color="text.secondary">
                          {delivered ? 'Entregado' : 'Llegada estimada'}
                        </Typography>
                        <Typography variant="h4">
                          {format(new Date(delivered ? trip.deliveredAt : estimate.eta), "EEE d 'de' MMM, HH:mm", { locale: es })}
                        </Typography>
                        {delay && (
                          <Typography variant="body2"
color={`${delay.color}.main`}>
                            {delay.color === 'error' ? 'Con retraso respecto a lo programado' : 'A tiempo'}
                          </Typography>
                        )}
                      </Box>
                    )}
                    <Box>
                      <Stack direction="row"
justifyContent="space-between">
                        <Typography variant="body2">Avance del viaje</Typography>
                        <Typography variant="body2">{progress}%</Typography>
                      </Stack>
                      <LinearProgress variant="determinate"
value={progress}
sx={{ mt: 1, height: 8, borderRadius: 4 }} />
                      {estimate && (
                        <Typography variant="caption"
color="text.secondary">
                          Faltan {estimate.remainingKm} km
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              <Card sx={{ overflow: 'hidden' }}>
                <GpsFleetMap
                  units={[liveUnit]}
                  routes={routes}
                  selectedId={liveUnit.id}
                  focusPoints={liveUnit.route.points}
                  height={{ xs: 320, sm: 420 }}
                  aspectRatio={1.4}
                  layers={NO_LAYERS}
                />
              </Card>

              <Card>
                <CardContent>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    <Field label="Origen"
value={trip.origin} />
                    <Field label="Destino"
value={trip.destination} />
                    <Field label="Carga"
value={trip.cargo} />
                    <Field label="Unidad"
value={`${liveUnit.eco} · ${liveUnit.plate}`} />
                    {data.unit.driver && <Field label="Operador"
value={data.unit.driver.name} />}
                    <Field
                      label="Última actualización"
                      value={
                        liveUnit.status === 'offline'
                          ? `Hace ${formatDistanceToNowStrict(new Date(liveUnit.lastUpdate), { locale: es })}`
                          : 'Hace unos segundos'
                      }
                    />
                  </Box>
                </CardContent>
              </Card>
              <Typography variant="caption"
color="text.secondary"
align="center">
                Información compartida por tu transportista a través de Ward. Ubicación aproximada.
              </Typography>
            </Stack>
          )}
        </Container>
      </Box>
    </>
  );
};

export default Page;
