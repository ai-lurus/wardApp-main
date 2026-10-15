import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Container,
  FormControlLabel,
  Grid,
  Skeleton,
  Snackbar,
  Stack,
  Switch,
  Tab,
  Tabs,
  SwipeableDrawer,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { ConfirmActionModal } from 'src/components/confirm-action-modal';
import { GpsFleetMap } from 'src/sections/gps/gps-fleet-map';
import { GpsLayerControl } from 'src/sections/gps/gps-layer-control';
import { GpsUnitSummary } from 'src/sections/gps/gps-unit-summary';
import { ALERTS_FILTER, GpsUnitsPanel } from 'src/sections/gps/gps-units-panel';
import { GpsGeofencesCard } from 'src/sections/gps/gps-geofences-card';
import { GpsGeofenceDialog } from 'src/sections/gps/gps-geofence-dialog';
import { GpsManualHotspots } from 'src/sections/gps/gps-manual-hotspots';
import { GpsHotspotDialog } from 'src/sections/gps/gps-hotspot-dialog';
import { useGpsSimulation } from 'src/hooks/use-gps-simulation';
import { useManualHotspots } from 'src/hooks/use-manual-hotspots';
import { useGeofenceEditor } from 'src/hooks/use-geofence-editor';
import { useGpsAlerts } from 'src/hooks/use-gps-alerts';
import { gpsApi } from 'src/services/apiService';
import { estimateArrival } from 'src/utils/gps-insights';
import { unitMatches } from 'src/utils/gps-search';
import { withUnauthorizedStops } from 'src/utils/gps-stops';

// Map and unit panel fill the screen on desktop so the whole map is visible without scrolling.
const WORKSPACE_HEIGHT = { xs: 'calc(100vh - 170px)', md: 560, lg: 'calc(100vh - 200px)' };
// On phones the unit panel opens as a bottom sheet over the full-screen map.
const SHEET_HEIGHT = '80vh';
const EMPTY_OVERLAYS = { geofences: [], hotspots: [], traffic: [] };
const ACTIVE_TRIP_STATUSES = ['in_transit', 'delayed', 'scheduled'];
const FILTER_FIT_DELAY_MS = 400;


const DrawingBanner = ({ message, canFinish, onUndo, onCancel, onFinish }) => (
  <Alert
    severity="info"
    sx={{ boxShadow: 2, maxWidth: 640, '& .MuiAlert-action': { alignItems: 'center' } }}
    action={(
      <Stack direction="row"
spacing={1}>
        {onUndo && <Button size="small"
onClick={onUndo}>Deshacer</Button>}
        <Button size="small"
onClick={onCancel}>Cancelar</Button>
        {onFinish && (
          <Button size="small"
variant="contained"
onClick={onFinish}
disabled={!canFinish}>
            Continuar
          </Button>
        )}
      </Stack>
    )}
  >
    {message}
  </Alert>
);

DrawingBanner.propTypes = {
  message: PropTypes.string,
  canFinish: PropTypes.bool,
  onUndo: PropTypes.func,
  onCancel: PropTypes.func,
  onFinish: PropTypes.func,
};

const Page = () => {
  const router = useRouter();
  const [units, setUnits] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [cities, setCities] = useState({});
  const [overlays, setOverlays] = useState(EMPTY_OVERLAYS);
  const [trips, setTrips] = useState([]);
  const [layers, setLayers] = useState({ geofences: true, hotspots: true, traffic: true });
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [fit, setFit] = useState({ key: null, points: [] });
  const [stress, setStress] = useState(false);
  const [tab, setTab] = useState('geofences');
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const searchRef = useRef(null);
  const isPhone = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const [sheetOpen, setSheetOpen] = useState(false);
  const mapRef = useRef(null);

  const notify = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);
  const reloadOverlays = useCallback(async () => {
    setOverlays(await gpsApi.listOverlays());
  }, []);
  const hotspotEditor = useManualHotspots({ onChange: reloadOverlays, notify });
  const geofenceEditor = useGeofenceEditor({ onChange: reloadOverlays, notify });

  const { openUnitIds } = useGpsAlerts();
  // "Con alertas": units with an open alert in the alert center, or a live unauthorized stop or hot route.
  const hasAlert = useCallback(
    (unit) => Boolean(unit.unauthorizedStop || unit.hotspot || openUnitIds.has(unit.id)),
    [openUnitIds]
  );

  const liveUnits = useGpsSimulation(units, overlays);
  const allUnits = useMemo(
    () => withUnauthorizedStops(liveUnits, overlays.geofences, geofenceEditor.stopRules.thresholdMinutes),
    [liveUnits, overlays.geofences, geofenceEditor.stopRules.thresholdMinutes]
  );

  // Search narrows the list first; status chips (with counts) then filter what is left.
  const searched = useMemo(() => allUnits.filter((unit) => unitMatches(unit, search)), [allUnits, search]);
  const counts = useMemo(
    () =>
      searched.reduce(
        (acc, unit) => ({ ...acc, [unit.status]: (acc[unit.status] || 0) + 1, alerts: acc.alerts + (hasAlert(unit) ? 1 : 0) }),
        { all: searched.length, alerts: 0 }
      ),
    [searched, hasAlert]
  );
  const visibleUnits = useMemo(() => {
    if (!statusFilter) return searched;
    if (statusFilter === ALERTS_FILTER) return searched.filter(hasAlert);
    return searched.filter((unit) => unit.status === statusFilter);
  }, [searched, statusFilter, hasAlert]);
  const selectedUnit = allUnits.find((unit) => unit.id === selectedId) || null;

  // Live ETA per unit for its current or next trip, using simulated time and current traffic.
  const etaByUnit = useMemo(
    () =>
      visibleUnits.reduce((acc, unit) => {
        const trip = trips.find((item) => item.unitId === unit.id && ACTIVE_TRIP_STATUSES.includes(item.status));
        if (!trip) return acc;
        return { ...acc, [unit.id]: estimateArrival({ unit, trip, traffic: overlays.traffic, now: new Date(unit.simulatedAt) }) };
      }, {}),
    [visibleUnits, trips, overlays]
  );

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [routesResult, citiesResult, overlaysResult, tripsResult] = await Promise.all([
        gpsApi.listRoutes(),
        gpsApi.listCities(),
        gpsApi.listOverlays(),
        gpsApi.listTrips(),
      ]);
      setRoutes(routesResult);
      setCities(citiesResult);
      setOverlays(overlaysResult);
      setTrips(tripsResult);
    } catch (err) {
      console.error('Error fetching GPS data:', err);
      notify('Error al cargar datos de GPS', 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Units load on their own so the 100-unit test mode can be switched without reloading the rest.
  useEffect(() => {
    let active = true;
    gpsApi
      .listUnits({ stress })
      .then((result) => active && setUnits(result))
      .catch((err) => {
        console.error('Error fetching GPS units:', err);
        notify('Error al cargar unidades', 'error');
      });
    return () => {
      active = false;
    };
  }, [stress, notify]);

  // After the search or status filter settles, fit the map to what is left (or reset when cleared).
  const visibleRef = useRef(visibleUnits);
  visibleRef.current = visibleUnits;
  useEffect(() => {
    const timer = setTimeout(() => {
      const active = Boolean(search || statusFilter);
      const points = visibleRef.current.map((unit) => unit.position).filter(Boolean);
      setFit(active && points.length ? { key: `filter:${search}:${statusFilter}`, points } : { key: null, points: [] });
    }, FILTER_FIT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  // Picking from the list centers the map on the unit; picking on the map only selects it.
  const selectFromList = useCallback(
    (id) => {
      setSheetOpen(false);
      setSelectedId((current) => (current === id ? null : id));
      const unit = allUnits.find((item) => item.id === id);
      if (unit?.position && id !== selectedId) setFit({ key: `unit:${id}:${Date.now()}`, points: [unit.position] });
    },
    [allUnits, selectedId]
  );
  const selectFromMap = useCallback((id) => setSelectedId((current) => (current === id ? null : id)), []);

  // Opened from a unit detail with ?unit=<id>.
  const requestedId = router.query.unit ? String(router.query.unit) : null;
  const requestedUnit = allUnits.find((unit) => unit.id === requestedId);
  const requestedReady = Boolean(requestedUnit);
  useEffect(() => {
    if (requestedReady) {
      selectFromList(requestedId);
      router.replace('/gps', undefined, { shallow: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedReady]);

  // "/" focuses the search, like most consoles.
  useEffect(() => {
    const onKeyDown = (event) => {
      const tag = event.target.tagName;
      if (event.key !== '/' || ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || event.target.isContentEditable) return;
      event.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const toggleLayer = useCallback((key) => setLayers((current) => ({ ...current, [key]: !current[key] })), []);

  const startDrawing = (editor, layer) => {
    hotspotEditor.cancelDrawing();
    geofenceEditor.cancelDrawing();
    setLayers((current) => ({ ...current, [layer]: true }));
    setSelectedId(null);
    editor.startDrawing();
    mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const drawingGeofence = geofenceEditor.drawing;
  const drawingHotspot = hotspotEditor.drawing;
  let banner = null;
  if (drawingGeofence) {
    banner = (
      <DrawingBanner
        message={geofenceEditor.draftPoints.length ? 'Ahora haz clic en el borde para fijar el radio.' : 'Haz clic en el centro de la geocerca.'}
        onCancel={geofenceEditor.cancelDrawing}
      />
    );
  } else if (drawingHotspot) {
    banner = (
      <DrawingBanner
        message={`Haz clic sobre el mapa para trazar el tramo (${hotspotEditor.draftPoints.length} puntos, mínimo 2).`}
        canFinish={hotspotEditor.draftPoints.length >= 2}
        onUndo={hotspotEditor.draftPoints.length ? hotspotEditor.undoPoint : null}
        onCancel={hotspotEditor.cancelDrawing}
        onFinish={hotspotEditor.finishDrawing}
      />
    );
  }

  return (
    <>
      <Head>
        <title>Mapa de flota | Ward</title>
      </Head>
      <Box component="main"
sx={{ flexGrow: 1, py: { xs: 4, lg: 3 } }}>
        <Container maxWidth={false}
sx={{ px: { xs: 2, md: 3 } }}>
          <Stack spacing={2.5}>
            <Stack direction={{ xs: 'column', sm: 'row' }}
justifyContent="space-between"
alignItems={{ sm: 'center' }}
spacing={1}>
              <Stack direction="row"
spacing={1.5}
alignItems="center">
                <Typography variant="h4"
component="h1">Mapa de flota</Typography>
                <Chip label="Demo"
color="primary"
size="small"
variant="outlined" />
              </Stack>
              <FormControlLabel
                control={<Switch size="small"
checked={stress}
onChange={(event) => setStress(event.target.checked)} />}
                label={<Typography variant="body2">Prueba: 100 unidades en Monterrey</Typography>}
              />
            </Stack>

            <Box ref={mapRef}>
              <Grid container
spacing={2}>
                <Grid item
xs={12}
lg={8}
xl={9}
sx={{ minWidth: 0 }}>
                  {loading ? (
                    <Skeleton variant="rounded"
sx={{ height: WORKSPACE_HEIGHT }} />
                  ) : (
                    <GpsFleetMap
                      height={WORKSPACE_HEIGHT}
                      toolbar={<GpsLayerControl layers={layers}
onToggle={toggleLayer} />}
                      banner={banner}
                      footer={isPhone && !(drawingGeofence || drawingHotspot) ? (
                        selectedUnit ? (
                          <Card sx={{ width: '100%', maxWidth: 420, boxShadow: 4 }}>
                            <GpsUnitSummary unit={selectedUnit}
estimate={etaByUnit[selectedUnit.id]}
onClose={() => setSelectedId(null)} />
                          </Card>
                        ) : (
                          <Button variant="contained"
onClick={() => setSheetOpen(true)}
sx={{ minHeight: 44, boxShadow: 4, borderRadius: 6, px: 3 }}>
                            Unidades ({visibleUnits.length})
                          </Button>
                        )
                      ) : null}
                      units={visibleUnits}
                      routes={routes}
                      cities={cities}
                      selectedId={selectedId}
                      onSelect={selectFromMap}
                      geofences={overlays.geofences}
                      hotspots={overlays.hotspots}
                      traffic={overlays.traffic}
                      layers={layers}
                      drawing={drawingGeofence || drawingHotspot}
                      drawMode={drawingGeofence ? 'circle' : 'line'}
                      draftPoints={drawingGeofence ? geofenceEditor.draftPoints : hotspotEditor.draftPoints}
                      onMapClick={drawingGeofence ? geofenceEditor.addPoint : hotspotEditor.addPoint}
                      fitKey={fit.key}
                      fitPoints={fit.points}
                    />
                  )}
                </Grid>
                <Grid item
xs={12}
lg={4}
xl={3}
sx={{ minWidth: 0 }}>
                  {!isPhone && (
                  <GpsUnitsPanel
                    height={WORKSPACE_HEIGHT}
                    loading={loading || !units.length}
                    units={visibleUnits}
                    counts={counts}
                    total={allUnits.length}
                    search={search}
                    onSearch={setSearch}
                    searchRef={searchRef}
                    statusFilter={statusFilter}
                    onStatusFilter={setStatusFilter}
                    selectedUnit={selectedUnit}
                    onSelect={selectFromList}
                    etaByUnit={etaByUnit}
                  />
                  )}
                </Grid>
              </Grid>
            </Box>

            <Card>
              <Tabs value={tab}
onChange={(event, value) => setTab(value)}
sx={{ px: 2 }}
aria-label="Configuración del mapa">
                <Tab value="geofences"
label={`Geocercas y paradas (${geofenceEditor.geofences.length})`} />
                <Tab value="hotspots"
label={`Rutas calientes (${hotspotEditor.hotspots.length})`} />
              </Tabs>
            </Card>
            {tab === 'geofences' ? (
              <GpsGeofencesCard
                geofences={geofenceEditor.geofences}
                thresholdMinutes={geofenceEditor.stopRules.thresholdMinutes}
                onThresholdChange={geofenceEditor.saveThreshold}
                onAdd={() => startDrawing(geofenceEditor, 'geofences')}
                adding={drawingGeofence}
                onEdit={geofenceEditor.edit}
                onDelete={geofenceEditor.requestDelete}
              />
            ) : (
              <GpsManualHotspots
                hotspots={hotspotEditor.hotspots}
                onAdd={() => startDrawing(hotspotEditor, 'hotspots')}
                adding={drawingHotspot}
                onEdit={hotspotEditor.edit}
                onDelete={hotspotEditor.requestDelete}
              />
            )}
          </Stack>
        </Container>
      </Box>

      {isPhone && (
        <SwipeableDrawer
          anchor="bottom"
          open={sheetOpen}
          onOpen={() => setSheetOpen(true)}
          onClose={() => setSheetOpen(false)}
          disableSwipeToOpen
          PaperProps={{ sx: { borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: 'hidden' } }}
        >
          <Box sx={{ width: 40, height: 4, borderRadius: 2, backgroundColor: 'neutral.300', mx: 'auto', mt: 1 }}
aria-hidden />
          <GpsUnitsPanel
            height={SHEET_HEIGHT}
            loading={loading || !units.length}
            units={visibleUnits}
            counts={counts}
            total={allUnits.length}
            search={search}
            onSearch={setSearch}
            searchRef={searchRef}
            statusFilter={statusFilter}
            onStatusFilter={setStatusFilter}
            selectedUnit={null}
            onSelect={selectFromList}
            etaByUnit={etaByUnit}
          />
        </SwipeableDrawer>
      )}
      <GpsGeofenceDialog
        open={geofenceEditor.dialog.open}
        geofence={geofenceEditor.dialog.geofence}
        draft={geofenceEditor.dialog.draft}
        onClose={geofenceEditor.closeDialog}
        onSubmit={geofenceEditor.save}
      />
      <GpsHotspotDialog
        open={hotspotEditor.dialog.open}
        hotspot={hotspotEditor.dialog.hotspot}
        onClose={hotspotEditor.closeDialog}
        onSubmit={hotspotEditor.save}
      />
      <ConfirmActionModal
        open={Boolean(hotspotEditor.toDelete || geofenceEditor.toDelete)}
        onClose={() => {
          hotspotEditor.cancelDelete();
          geofenceEditor.cancelDelete();
        }}
        onConfirm={geofenceEditor.toDelete ? geofenceEditor.confirmDelete : hotspotEditor.confirmDelete}
        title={geofenceEditor.toDelete ? '¿Borrar esta geocerca?' : '¿Borrar esta ruta caliente?'}
        description={`“${(geofenceEditor.toDelete || hotspotEditor.toDelete)?.name || ''}” dejará de mostrarse en el mapa y en las alertas.`}
        confirmText="Borrar"
      />
      <Snackbar open={snackbar.open}
autoHideDuration={3000}
onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
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
