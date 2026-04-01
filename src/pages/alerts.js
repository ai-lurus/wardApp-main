import { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import { Alert, Box, CircularProgress, Container, Snackbar, Stack, Typography } from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { SubscriptionGuard } from 'src/guards/subscription-guard';
import { AlertsTable } from 'src/sections/inventory/alerts-table';
import { MovementModal } from 'src/sections/inventory/movement-modal';
import { TableSkeleton } from 'src/components/table-skeleton';
import { inventoryApi, materialsApi } from 'src/services/apiService';
import { useTranslation } from 'react-i18next';

const Page = () => {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [preselectedMaterialId, setPreselectedMaterialId] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [alertsData, matResult] = await Promise.all([
        inventoryApi.getAlerts(),
        materialsApi.list({ active: true }),
      ]);
      setAlerts(alertsData);
      setMaterials(matResult.items);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setSnackbar({ open: true, message: 'Error al cargar alertas', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRegisterEntry = useCallback((materialId) => {
    setPreselectedMaterialId(materialId);
    setModalOpen(true);
  }, []);

  const handleSave = useCallback(async (values) => {
    try {
      await inventoryApi.registerEntry(values);
      setModalOpen(false);
      setPreselectedMaterialId(null);
      await fetchData();
      setSnackbar({ open: true, message: 'Entrada registrada', severity: 'success' });
    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.message || 'Error al registrar entrada';
      setSnackbar({ open: true, message, severity: 'error' });
    }
  }, [fetchData]);

  // Remove full page blocking spinner

  return (
    <>
      <Head>
        <title>Alertas de Stock | Ward</title>
      </Head>
      <Box component="main"
sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Typography variant="h4">{t('stockAlerts')}</Typography>
            {loading ? (
              <TableSkeleton rowCount={8}
colCount={6} />
            ) : (
              <AlertsTable items={alerts}
onRegisterEntry={handleRegisterEntry} />
            )}
          </Stack>
        </Container>
      </Box>
      <MovementModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setPreselectedMaterialId(null);
        }}
        onSave={handleSave}
        type="entry"
        materials={materials}
        preselectedMaterialId={preselectedMaterialId}
      />
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

Page.getLayout = (page) => <DashboardLayout><SubscriptionGuard>{page}</SubscriptionGuard></DashboardLayout>;

export default Page;
