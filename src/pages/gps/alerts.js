import { useMemo, useState } from 'react';
import Head from 'next/head';
import { Alert, Box, Chip, Container, Skeleton, Snackbar, Stack, Typography } from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { GpsAlertsFilters } from 'src/sections/gps/alerts/gps-alerts-filters';
import { GpsAlertsList } from 'src/sections/gps/alerts/gps-alerts-list';
import { GpsAlertStatusDialog } from 'src/sections/gps/alerts/gps-alert-status-dialog';
import { useGpsAlerts } from 'src/hooks/use-gps-alerts';
import { gpsApi } from 'src/services/apiService';
import { ALERT_SEVERITIES, ALERT_STATUSES, ALERT_TYPES, isOpenAlert } from 'src/utils/gps-alerts';
import { normalizeSearch } from 'src/utils/gps-search';

const DEFAULT_FILTERS = { search: '', unitId: '', status: 'open', severity: null, type: null, sort: 'newest' };

const STATUS_FILTERS = {
  open: isOpenAlert,
  pending: (alert) => alert.status === 'pending',
  in_progress: (alert) => alert.status === 'in_progress',
  resolved: (alert) => alert.status === 'resolved',
  all: () => true,
};

const matchesSearch = (alert, search) => {
  const needle = normalizeSearch(search);
  if (!needle) return true;
  return [alert.title, alert.unitEco, alert.unitPlate, alert.driverName, ALERT_TYPES[alert.type].label].some((field) =>
    normalizeSearch(field).includes(needle)
  );
};

const countBy = (items, key) => items.reduce((acc, item) => ({ ...acc, [item[key]]: (acc[item[key]] || 0) + 1 }), {});

const Page = () => {
  const { alerts, loading } = useGpsAlerts();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [statusRequest, setStatusRequest] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const updateFilters = (patch) => setFilters((current) => ({ ...current, ...patch }));

  // Search and unit narrow the set; chip counts are computed on what is left.
  const base = useMemo(
    () => alerts.filter((alert) => matchesSearch(alert, filters.search) && (!filters.unitId || alert.unitId === filters.unitId)),
    [alerts, filters.search, filters.unitId]
  );
  const byStatus = base.filter(STATUS_FILTERS[filters.status]);
  const bySeverity = filters.severity ? byStatus.filter((alert) => alert.severity === filters.severity) : byStatus;
  const visible = useMemo(() => {
    const list = filters.type ? bySeverity.filter((alert) => alert.type === filters.type) : bySeverity;
    return filters.sort === 'oldest' ? [...list].reverse() : list;
  }, [bySeverity, filters.type, filters.sort]);

  const statusCounts = countBy(base, 'status');
  const severityCounts = countBy(byStatus, 'severity');
  const typeCounts = countBy(bySeverity, 'type');
  const unitCounts = countBy(alerts, 'unitId');

  const statusOptions = [
    { value: 'open', label: 'Abiertas', count: base.filter(isOpenAlert).length, color: 'error' },
    ...Object.entries(ALERT_STATUSES).map(([value, config]) => ({ value, label: config.label, count: statusCounts[value] || 0, color: config.color })),
    { value: 'all', label: 'Todas', count: base.length },
  ];
  const severityOptions = [
    { value: null, label: 'Todas', count: byStatus.length },
    ...Object.entries(ALERT_SEVERITIES).map(([value, config]) => ({ value, label: config.label, count: severityCounts[value] || 0, color: config.color })),
  ];
  const typeOptions = [
    { value: null, label: 'Todos', count: bySeverity.length },
    ...Object.entries(ALERT_TYPES)
      .filter(([value]) => typeCounts[value] || filters.type === value)
      .map(([value, config]) => ({ value, label: config.label, count: typeCounts[value] || 0 })),
  ];
  const unitOptions = useMemo(() => {
    const seen = new Map();
    alerts.forEach((alert) => seen.set(alert.unitId, `${alert.unitEco} · ${alert.driverName}`));
    return [...seen.entries()].map(([value, label]) => ({ value, label, count: unitCounts[value] || 0 }));
  }, [alerts, unitCounts]);

  const handleConfirmStatus = async (id, status, note) => {
    await gpsApi.updateAlertStatus(id, status, note);
    setStatusRequest(null);
    setSnackbar({ open: true, message: `Alerta marcada como «${ALERT_STATUSES[status].label}»` });
  };

  const openCount = alerts.filter(isOpenAlert).length;

  return (
    <>
      <Head>
        <title>Centro de alertas | Ward</title>
      </Head>
      <Box component="main"
sx={{ flexGrow: 1, py: { xs: 4, lg: 3 } }}>
        <Container maxWidth="xl">
          <Stack spacing={2.5}>
            <Stack spacing={0.5}>
              <Stack direction="row"
spacing={1.5}
alignItems="center">
                <Typography variant="h4"
component="h1">Centro de alertas</Typography>
                <Chip label="Demo"
color="primary"
size="small"
variant="outlined" />
              </Stack>
              <Typography color="text.secondary"
variant="body2">
                {loading ? 'Cargando alertas…' : `${openCount} abiertas de ${alerts.length} en los últimos 7 días. Atiende, resuelve y deja notas para el turno.`}
              </Typography>
            </Stack>
            <GpsAlertsFilters
              filters={filters}
              onChange={updateFilters}
              statusOptions={statusOptions}
              severityOptions={severityOptions}
              typeOptions={typeOptions}
              unitOptions={unitOptions}
            />
            {loading ? (
              <Skeleton variant="rounded"
height={360} />
            ) : (
              <GpsAlertsList
                alerts={visible}
                onChangeStatus={(alert, status) => setStatusRequest({ alert, status })}
                onClearFilters={() => setFilters(DEFAULT_FILTERS)}
              />
            )}
          </Stack>
        </Container>
      </Box>
      <GpsAlertStatusDialog request={statusRequest}
onClose={() => setStatusRequest(null)}
onConfirm={handleConfirmStatus} />
      <Snackbar open={snackbar.open}
autoHideDuration={3000}
onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity="success"
variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
