import { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  InputAdornment,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { WarehouseMapEditor } from 'src/sections/warehouse/warehouse-map-editor';
import { WarehouseMapView } from 'src/sections/warehouse/warehouse-map-view';
import { warehouseApi, materialsApi } from 'src/services/apiService';

const Page = () => {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null);
  const [zones, setZones] = useState([]);
  const [mapData, setMapData] = useState({ config: null, zones: [] });
  const [allMaterials, setAllMaterials] = useState([]);
  const [configForm, setConfigForm] = useState({ widthM: 50, heightM: 30 });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnack = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const fetchEditor = useCallback(async () => {
    try {
      setLoading(true);
      const [cfg, zns] = await Promise.all([
        warehouseApi.getConfig(),
        warehouseApi.getZones(),
      ]);
      setConfig(cfg);
      setConfigForm({ widthM: cfg.widthM, heightM: cfg.heightM });
      setZones(zns);
    } catch (err) {
      showSnack('Error al cargar el mapa', 'error');
    } finally {
      setLoading(false);
    }
  }, [showSnack]);

  const fetchMapView = useCallback(async () => {
    try {
      setLoading(true);
      const [mapResult, matResult] = await Promise.all([
        warehouseApi.getMap(),
        materialsApi.list({ active: true, limit: 200 }),
      ]);
      setMapData(mapResult);
      setAllMaterials(matResult.items);
    } catch (err) {
      showSnack('Error al cargar el mapa', 'error');
    } finally {
      setLoading(false);
    }
  }, [showSnack]);

  useEffect(() => {
    if (tab === 0) fetchMapView();
    else fetchEditor();
  }, [tab, fetchEditor, fetchMapView]);

  // ─── Config update ───────────────────────────────────

  const handleConfigSave = useCallback(async () => {
    try {
      const updated = await warehouseApi.updateConfig({
        widthM: Number(configForm.widthM),
        heightM: Number(configForm.heightM),
      });
      setConfig(updated);
      showSnack('Dimensiones actualizadas');
    } catch (err) {
      showSnack('Error al actualizar dimensiones', 'error');
    }
  }, [configForm, showSnack]);

  // ─── Zone CRUD ───────────────────────────────────────

  const handleZoneCreate = useCallback(async (values) => {
    try {
      const zone = await warehouseApi.createZone(values);
      setZones((prev) => [...prev, zone]);
      showSnack('Zona creada');
    } catch (err) {
      showSnack('Error al crear zona', 'error');
    }
  }, [showSnack]);

  const handleZoneUpdate = useCallback(async (id, values) => {
    try {
      const updated = await warehouseApi.updateZone(id, values);
      setZones((prev) => prev.map((z) => (z.id === id ? updated : z)));
      showSnack('Zona actualizada');
    } catch (err) {
      showSnack('Error al actualizar zona', 'error');
    }
  }, [showSnack]);

  const handleZoneDelete = useCallback(async (id) => {
    try {
      await warehouseApi.deleteZone(id);
      setZones((prev) => prev.filter((z) => z.id !== id));
      showSnack('Zona eliminada');
    } catch (err) {
      showSnack('Error al eliminar zona', 'error');
    }
  }, [showSnack]);

  // ─── Material assignment (map view) ─────────────────

  const handleAssign = useCallback(async (materialId, zoneId) => {
    try {
      await materialsApi.setZone(materialId, zoneId);
      await fetchMapView();
      showSnack('Material asignado a zona');
    } catch (err) {
      showSnack('Error al asignar material', 'error');
    }
  }, [fetchMapView, showSnack]);

  const handleUnassign = useCallback(async (materialId) => {
    try {
      await materialsApi.setZone(materialId, null);
      await fetchMapView();
      showSnack('Material desasignado');
    } catch (err) {
      showSnack('Error al desasignar material', 'error');
    }
  }, [fetchMapView, showSnack]);

  return (
    <>
      <Head>
        <title>Almacén | Ward</title>
      </Head>
      <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Typography variant="h4">Almacén</Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                <Tab label="Mapa de materiales" />
                <Tab label="Editor de zonas" />
              </Tabs>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {/* Tab 0: Map View */}
                {tab === 0 && (
                  <Box sx={{ height: 440, mb: 4 }}>
                    <WarehouseMapView
                      zones={mapData.zones}
                      config={mapData.config}
                      allMaterials={allMaterials}
                      onAssign={handleAssign}
                      onUnassign={handleUnassign}
                    />
                  </Box>
                )}

                {/* Tab 1: Editor */}
                {tab === 1 && (
                  <Stack spacing={2} sx={{ pb: 6 }}>
                    {/* Dimensions config */}
                    <Stack direction="row" spacing={2} alignItems="center">
                      <TextField
                        size="small"
                        label="Ancho del almacén"
                        type="number"
                        value={configForm.widthM}
                        onChange={(e) => setConfigForm((f) => ({ ...f, widthM: e.target.value }))}
                        InputProps={{ endAdornment: <InputAdornment position="end">m</InputAdornment> }}
                        sx={{ width: 180 }}
                      />
                      <TextField
                        size="small"
                        label="Alto del almacén"
                        type="number"
                        value={configForm.heightM}
                        onChange={(e) => setConfigForm((f) => ({ ...f, heightM: e.target.value }))}
                        InputProps={{ endAdornment: <InputAdornment position="end">m</InputAdornment> }}
                        sx={{ width: 180 }}
                      />
                      <Button variant="outlined" size="small" onClick={handleConfigSave}>
                        Guardar dimensiones
                      </Button>
                      <Typography variant="body2" color="text.secondary">
                        {zones.length} zona{zones.length !== 1 ? 's' : ''} creada{zones.length !== 1 ? 's' : ''}
                      </Typography>
                    </Stack>

                    <Box sx={{ height: 380 }}>
                      <WarehouseMapEditor
                        zones={zones}
                        config={config}
                        onZoneCreate={handleZoneCreate}
                        onZoneUpdate={handleZoneUpdate}
                        onZoneDelete={handleZoneDelete}
                      />
                    </Box>
                  </Stack>
                )}
              </>
            )}
          </Stack>
        </Container>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
