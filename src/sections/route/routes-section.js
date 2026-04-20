import { useCallback, useEffect, useState } from 'react';
import { Stack, Button } from '@mui/material';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import { RoutesTable } from './routes-table';
import { RoutesSearch } from './routes-search';
import { RouteModal } from './route-modal';
import { RouteDetails } from './route-details';
import { CostPreviewModal } from './cost-preview-modal';
import { routesApi } from 'src/services/apiService';

export const RoutesSection = ({ allTollbooths }) => {
  const [routes, setRoutes] = useState([]);
  const [routeFilters, setRouteFilters] = useState({ origin: '', destination: '', active: undefined });
  const [routeSearch, setRouteSearch] = useState('');
  const [routeModal, setRouteModal] = useState({ open: false, data: null });
  const [routeDetail, setRouteDetail] = useState({ open: false, data: null });
  const [costPreview, setCostPreview] = useState({ open: false, data: null });

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchRoutes = useCallback(async () => {
    try {
      const data = await routesApi.list({ ...routeFilters, search: routeSearch });
      setRoutes(data);
    } catch (err) {
      console.error('Error fetching routes:', err);
    }
  }, [routeFilters, routeSearch]);

  useEffect(() => {
    fetchRoutes();
    setPage(0); // Reset page on filter change
  }, [fetchRoutes]);

  const handlePageChange = useCallback((event, value) => {
    setPage(value);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const paginatedRoutes = routes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleRouteSave = async (values) => {
    try {
      if (routeModal.data) {
        await routesApi.update(routeModal.data.id, values);
      } else {
        await routesApi.create(values);
      }
      setRouteModal({ open: false, data: null });
      fetchRoutes();
    } catch (err) {
      console.error('Error saving route:', err);
    }
  };

  const handleRouteDelete = async (id) => {
    if (window.confirm('¿Estás seguro de desactivar esta ruta?')) {
      try {
        await routesApi.delete(id);
        fetchRoutes();
      } catch (err) {
        console.error('Error deleting route:', err);
      }
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="flex-end">
        <Button
          startIcon={<PlusIcon style={{ width: 20 }} />}
          variant="contained"
          onClick={() => setRouteModal({ open: true, data: null })}
        >
          Nueva Ruta
        </Button>
      </Stack>
      <RoutesSearch 
        onSearch={(params) => {
          setRouteSearch(params.search);
          setRouteFilters({
            active: params.active,
            origin: params.origin,
            destination: params.destination
          });
        }}
      />
      <RoutesTable 
        count={routes.length}
        items={paginatedRoutes} 
        onEdit={(data) => setRouteModal({ open: true, data })}
        onDelete={handleRouteDelete}
        onViewDetail={(data) => setRouteDetail({ open: true, data })}
        onPreviewCost={(data) => setCostPreview({ open: true, data })}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
      />
      
      {/* Modals are now local to RoutesSection */}
      <RouteModal
        open={routeModal.open}
        onClose={() => setRouteModal({ open: false, data: null })}
        onSave={handleRouteSave}
        route={routeModal.data}
        allTollbooths={allTollbooths}
      />
      <RouteDetails
        open={routeDetail.open}
        onClose={() => setRouteDetail({ open: false, data: null })}
        route={routeDetail.data}
      />
      <CostPreviewModal
        open={costPreview.open}
        onClose={() => setCostPreview({ open: false, data: null })}
        route={costPreview.data}
      />
    </Stack>
  );
};
