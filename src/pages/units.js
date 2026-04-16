import { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import {
  Alert,
  Box,
  Button,
  Container,
  Snackbar,
  Stack,
  SvgIcon,
  Typography,
} from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { SubscriptionGuard } from 'src/guards/subscription-guard';
import { UnitsTable } from 'src/sections/units/units-table';
import { UnitsSearch } from 'src/sections/units/units-search';
import { UnitModal } from 'src/sections/units/unit-modal';
import { TableSkeleton } from 'src/components/table-skeleton';
import { applyPagination } from 'src/utils/apply-pagination';
import { unitsApi } from 'src/services/apiService';
// import Link from 'next/link';

const Page = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [units, setUnits] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [unitsResult, alertsResult] = await Promise.all([
        unitsApi.list({ limit: 1000 }),
        unitsApi.getAlertsInsurance()
      ]);
      setUnits(unitsResult.items);
      setAlerts(alertsResult);
    } catch (err) {
      console.error('Error fetching units:', err);
      setSnackbar({ open: true, message: 'Error al cargar unidades', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredUnits = useMemo(() => {
    let result = units;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.matricula?.toLowerCase().includes(query) ||
          u.vin?.toLowerCase().includes(query)
      );
    }
    if (statusFilter) {
      result = result.filter((u) => u.status === statusFilter);
    }
    if (typeFilter) {
      result = result.filter((u) => u.type === typeFilter);
    }
    return result;
  }, [units, searchQuery, statusFilter, typeFilter]);

  const paginatedUnits = useMemo(
    () => applyPagination(filteredUnits, page, rowsPerPage),
    [filteredUnits, page, rowsPerPage]
  );

  const handlePageChange = useCallback((event, value) => {
    setPage(value);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleEdit = useCallback((unit) => {
    setEditingUnit(unit);
    setModalOpen(true);
  }, []);

  const handleStatusChange = useCallback(async (id, newStatus) => {
    try {
      await unitsApi.updateStatus(id, newStatus);
      await fetchData();
      setSnackbar({ open: true, message: 'Estado actualizado', severity: 'success' });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Error al actualizar estado', severity: 'error' });
    }
  }, [fetchData]);

  const handleSave = useCallback(
    async (values) => {
      try {
        if (editingUnit) {
          await unitsApi.update(editingUnit.id, values);
        } else {
          await unitsApi.create(values);
        }
        setModalOpen(false);
        setEditingUnit(null);
        await fetchData();
        setSnackbar({ open: true, message: 'Unidad guardada exitosamente', severity: 'success' });
      } catch (err) {
        console.error(err);
        const message = err.response?.data?.error || err.response?.data?.message || 'Error al guardar unidad';
        setSnackbar({ open: true, message, severity: 'error' });
      }
    },
    [editingUnit, fetchData]
  );

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setEditingUnit(null);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setStatusFilter('');
    setTypeFilter('');
  }, []);

  return (
    <>
      <Head>
        <title>Flotas | Ward</title>
      </Head>
      <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            {/* Alerts Banner */}
            {alerts && alerts.length > 0 && (
              <Alert severity="warning" variant="filled">
                <Typography variant="body1" fontWeight="bold">
                  Las siguientes unidades tienen seguro vencido o por vencer en ≤ 30 días:
                </Typography>
                <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                  {alerts.map(alert => (
                    <li key={alert.id}>
                      <Typography
                        variant="body2"
                        sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => handleEdit(alert)}
                      >
                        {alert.matricula} {alert.marca ? `(${alert.marca})` : ''} - Vence: {alert.insuranceExpiration ? new Date(alert.insuranceExpiration).toLocaleDateString() : 'Desconocido'}
                      </Typography>
                    </li>
                  ))}
                </ul>
              </Alert>
            )}

            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Typography variant="h4">Flotas</Typography>
              <Button
                startIcon={
                  <SvgIcon fontSize="small">
                    <PlusIcon />
                  </SvgIcon>
                }
                variant="contained"
                onClick={() => setModalOpen(true)}
              >
                Nueva Unidad
              </Button>
            </Stack>

            <UnitsSearch
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              typeFilter={typeFilter}
              onTypeChange={setTypeFilter}
              onClearFilters={handleClearFilters}
            />

            {loading ? (
              <TableSkeleton rowCount={10} colCount={9} />
            ) : (
              <UnitsTable
                count={filteredUnits.length}
                items={paginatedUnits}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                page={page}
                rowsPerPage={rowsPerPage}
                onEdit={handleEdit}
                onStatusChange={handleStatusChange}
              />
            )}
          </Stack>
        </Container>
      </Box>

      <UnitModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        unit={editingUnit}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout><SubscriptionGuard>{page}</SubscriptionGuard></DashboardLayout>;

export default Page;
