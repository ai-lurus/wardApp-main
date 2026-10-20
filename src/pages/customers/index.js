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
import { useAuth } from 'src/hooks/use-auth';
import { TableSkeleton } from 'src/components/table-skeleton';
import { ConfirmActionModal } from 'src/components/confirm-action-modal';
import { applyPagination } from 'src/utils/apply-pagination';
import { customersApi } from 'src/services/apiService';
import { CustomersToolbar } from 'src/sections/customer/customers-toolbar';
import { CustomersTable } from 'src/sections/customer/customers-table';
import { CustomerModal } from 'src/sections/customer/customer-modal';
import { CustomerDetailDrawer } from 'src/sections/customer/customer-detail-drawer';

const Page = () => {
  const { user } = useAuth();
  const canEdit = user?.role === 'admin';

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deletingCustomer, setDeletingCustomer] = useState(null);
  const [detailCustomerId, setDetailCustomerId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await customersApi.list();
      setCustomers(data);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setSnackbar({ open: true, message: 'Error al cargar clientes', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Client-side search, the list is small enough to filter in memory
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return customers;
    return customers.filter((c) =>
      c.name.toLowerCase().includes(query) ||
      c.phone.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query)
    );
  }, [customers, search]);

  const paginated = useMemo(
    () => applyPagination(filtered, page, rowsPerPage),
    [filtered, page, rowsPerPage]
  );

  const handleSearchChange = useCallback((value) => {
    setSearch(value);
    setPage(0);
  }, []);

  const handlePageChange = useCallback((event, value) => {
    setPage(value);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleSave = useCallback(async (values, id) => {
    if (id) {
      await customersApi.update(id, values);
    } else {
      await customersApi.create(values);
    }
    setModalOpen(false);
    setSnackbar({ open: true, message: id ? 'Cliente actualizado' : 'Cliente registrado', severity: 'success' });
    fetchCustomers();
  }, [fetchCustomers]);

  const handleDelete = useCallback(async () => {
    if (!deletingCustomer) return;
    try {
      await customersApi.delete(deletingCustomer.id);
      setSnackbar({ open: true, message: 'Cliente eliminado', severity: 'success' });
      fetchCustomers();
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Error al eliminar el cliente',
        severity: 'error',
      });
    } finally {
      setDeletingCustomer(null);
    }
  }, [deletingCustomer, fetchCustomers]);

  return (
    <>
      <Head>
        <title>Clientes | Ward</title>
      </Head>
      <Box component="main"
        sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack direction="row"
              justifyContent="space-between"
              spacing={4}>
              <Typography variant="h4">Clientes</Typography>
              {canEdit && (
                <div>
                  <Button
                    startIcon={<SvgIcon fontSize="small"><PlusIcon /></SvgIcon>}
                    variant="contained"
                    onClick={() => {
                      setEditingCustomer(null);
                      setModalOpen(true);
                    }}
                  >
                    Nuevo Cliente
                  </Button>
                </div>
              )}
            </Stack>

            <CustomersToolbar search={search}
              onSearchChange={handleSearchChange} />
            {loading ? (
              <TableSkeleton />
            ) : (
              <CustomersTable
                count={filtered.length}
                items={paginated}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                page={page}
                rowsPerPage={rowsPerPage}
                canEdit={canEdit}
                onViewDetail={(customer) => setDetailCustomerId(customer.id)}
                onEdit={(customer) => {
                  setEditingCustomer(customer);
                  setModalOpen(true);
                }}
                onDelete={setDeletingCustomer}
              />
            )}
          </Stack>
        </Container>
      </Box>

      {modalOpen && (
        <CustomerModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          customer={editingCustomer}
          onSave={handleSave}
        />
      )}

      <CustomerDetailDrawer
        open={Boolean(detailCustomerId)}
        onClose={() => setDetailCustomerId(null)}
        customerId={detailCustomerId}
      />

      <ConfirmActionModal
        open={Boolean(deletingCustomer)}
        onClose={() => setDeletingCustomer(null)}
        onConfirm={handleDelete}
        title="Eliminar Cliente"
        description={`¿Eliminar a "${deletingCustomer?.name || ''}"? Sus viajes se conservan en los reportes.`}
        confirmText="Sí, eliminar"
        color="error"
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <SubscriptionGuard moduleId="clientes">{page}</SubscriptionGuard>
  </DashboardLayout>
);

export default Page;
