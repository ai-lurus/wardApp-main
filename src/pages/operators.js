import { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { operatorsApi } from 'src/services/apiService';
import { OperatorsSearch } from 'src/sections/operators/operators-search';
import { OperatorsTable } from 'src/sections/operators/operators-table';
import { OperatorModal } from 'src/sections/operators/operator-modal';
import { OperatorDetailDrawer } from 'src/sections/operators/operator-detail-drawer';
import { OperatorsAlerts } from 'src/sections/operators/operators-alerts';

const useOperators = (filters) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOperators = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      // El backend no soporta search text en operators listado aún, pero lo manejamos client-side o lo pasamos.
      
      const res = await operatorsApi.list(params);
      
      // Client-side text filter since backend API only has status & available_only
      let filteredData = res;
      if (filters.search) {
        const query = filters.search.toLowerCase();
        filteredData = res.filter(o => 
          o.name.toLowerCase().includes(query) || 
          (o.licenseNumber && o.licenseNumber.toLowerCase().includes(query)) ||
          (o.email && o.email.toLowerCase().includes(query))
        );
      }
      
      setData(filteredData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchOperators();
  }, [fetchOperators]);

  return { data, fetchOperators, loading };
};

const useAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const fetchAlerts = useCallback(async () => {
    try {
      const res = await operatorsApi.getAlertsExpiringDocuments();
      setAlerts(res);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return { alerts, fetchAlerts };
};

const Page = () => {
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const { data, fetchOperators } = useOperators(filters);
  const { alerts, fetchAlerts } = useAlerts();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingOperator, setEditingOperator] = useState(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailOperatorId, setDetailOperatorId] = useState(null);

  const handlePageChange = useCallback((event, value) => {
    setPage(value);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(event.target.value);
    setPage(0);
  }, []);

  const handleEdit = useCallback((operator) => {
    setEditingOperator(operator);
    setModalOpen(true);
  }, []);

  const handleViewDetail = useCallback((operator) => {
    setDetailOperatorId(operator.id);
    setDrawerOpen(true);
  }, []);

  const handleSave = useCallback(async (values, id) => {
    if (id) {
      await operatorsApi.update(id, values);
    } else {
      await operatorsApi.create(values);
    }
    setModalOpen(false);
    fetchOperators();
  }, [fetchOperators]);

  const handleStatusChange = useCallback(async (id, status) => {
    try {
      await operatorsApi.updateStatus(id, status);
      fetchOperators();
    } catch (err) {
      console.error(err);
      alert('Error al cambiar el estatus');
    }
  }, [fetchOperators]);

  const handleDelete = useCallback(async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este operador?')) {
      try {
        await operatorsApi.delete(id);
        fetchOperators();
      } catch (err) {
        console.error(err);
        alert('Error al eliminar');
      }
    }
  }, [fetchOperators]);

  // Paginated items
  const paginatedItems = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <>
      <Head>
        <title>Operadores | Ward.io</title>
      </Head>
      <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <OperatorsAlerts alerts={alerts} />
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Stack spacing={1}>
                <Typography variant="h4">Operadores</Typography>
              </Stack>
              <div>
                <Button
                  startIcon={<PlusIcon fontSize="small" style={{ width: 20 }} />}
                  variant="contained"
                  onClick={() => {
                    setEditingOperator(null);
                    setModalOpen(true);
                  }}
                >
                  Nuevo Operador
                </Button>
              </div>
            </Stack>

            <OperatorsSearch filters={filters} onFilterChange={setFilters} />

            <OperatorsTable
              count={data.length}
              items={paginatedItems}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              page={page}
              rowsPerPage={rowsPerPage}
              onEdit={handleEdit}
              onViewDetail={handleViewDetail}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          </Stack>
        </Container>
      </Box>

      {modalOpen && (
        <OperatorModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          operator={editingOperator}
          onSave={handleSave}
        />
      )}

      <OperatorDetailDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setDetailOperatorId(null);
          // fetch alerts again in case new doc changed alerts
          fetchAlerts();
        }}
        operatorId={detailOperatorId}
      />
    </>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default Page;
