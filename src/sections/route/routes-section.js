import { useCallback, useEffect, useState } from 'react';
import { Stack, Button } from '@mui/material';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import { RoutesTable } from './routes-table';
import { RoutesSearch } from './routes-search';
import { RouteModal } from './route-modal';
import { RouteDetails } from './route-details';
import { CostPreviewModal } from './cost-preview-modal';
import { ConfirmActionModal } from 'src/components/confirm-action-modal';
import { routesApi, tollboothsApi } from 'src/services/apiService';

export const RoutesSection = () => {
  const [routes, setRoutes] = useState([]);
  const [routeFilters, setRouteFilters] = useState({ origin: '', destination: '', active: undefined });
  const [routeSearch, setRouteSearch] = useState('');
  const [routeModal, setRouteModal] = useState({ open: false, data: null });
  const [routeError, setRouteError] = useState('');
  const [routeDetail, setRouteDetail] = useState({ open: false, data: null });
  const [costPreview, setCostPreview] = useState({ open: false, data: null });
  const [confirmModal, setConfirmModal] = useState({ open: false, id: null, type: 'deactivate' });
  
  // Independent list of tollbooths for the modal
  const [allTollbooths, setAllTollbooths] = useState([]);

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

  const fetchAllTollbooths = useCallback(async () => {
    try {
      const data = await tollboothsApi.list();
      setAllTollbooths(data);
    } catch (err) {
      console.error('Error fetching all tollbooths for routes:', err);
    }
  }, []);

  useEffect(() => {
    fetchRoutes();
    fetchAllTollbooths();
    setPage(0); // Reset page on filter change
  }, [fetchRoutes, fetchAllTollbooths]);

  const handlePageChange = useCallback((event, value) => {
    setPage(value);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const paginatedRoutes = routes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const enrichRoute = useCallback((route) => {
    if (!route || !route.tollbooths) return route;
    const enrichedTollbooths = route.tollbooths.map(rtb => {
      const details = allTollbooths.find(tb => tb.id === rtb.id);
      return { ...rtb, ...details };
    });
    return { ...route, tollbooths: enrichedTollbooths };
  }, [allTollbooths]);

  const handleRouteSave = async (values) => {
    setRouteError('');
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
      const message = err.response?.data?.error || err.message || 'Error al guardar la ruta';
      setRouteError(message);
    }
  };

  const handleViewDetail = async (route) => {
    try {
      const detailedRoute = await routesApi.get(route.id);
      setRouteDetail({ open: true, data: detailedRoute });
    } catch (err) {
      console.error('Error fetching route details:', err);
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmModal.id) return;
    try {
      if (confirmModal.type === 'deactivate') {
        await routesApi.delete(confirmModal.id);
      } else {
        await routesApi.update(confirmModal.id, { active: true });
      }
      setConfirmModal({ open: false, id: null, type: 'deactivate' });
      fetchRoutes();
    } catch (err) {
      console.error(`Error ${confirmModal.type} route:`, err);
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button
          startIcon={<PlusIcon style={{ width: 20 }} />}
          variant="contained"
          onClick={() => {
            setRouteError('');
            setRouteModal({ open: true, data: null });
          }}
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
        onEdit={(data) => {
          setRouteError('');
          setRouteModal({ open: true, data });
        }}
        onDelete={(id) => setConfirmModal({ open: true, id, type: 'deactivate' })}
        onActivate={(id) => setConfirmModal({ open: true, id, type: 'activate' })}
        onViewDetail={handleViewDetail}
        onPreviewCost={(data) => setCostPreview({ open: true, data: enrichRoute(data) })}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
      />
      
      <RouteModal
        open={routeModal.open}
        onClose={() => setRouteModal({ open: false, data: null })}
        onSave={handleRouteSave}
        route={routeModal.data}
        allTollbooths={allTollbooths}
        serverError={routeError}
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
      <ConfirmActionModal
        open={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, id: null, type: 'deactivate' })}
        onConfirm={handleConfirmAction}
        title={confirmModal.type === 'deactivate' ? "¿Desactivar Ruta?" : "¿Reactivar Ruta?"}
        description={confirmModal.type === 'deactivate' 
          ? "Esta acción marcará la ruta como inactiva. Podrás reactivarla despuéssi es necesario."
          : "Esta acción volverá a activar la ruta para que sea visible en todas las operaciones."}
        confirmText={confirmModal.type === 'deactivate' ? "Desactivar" : "Reactivar"}
        color={confirmModal.type === 'deactivate' ? "error" : "success"}
        iconType={confirmModal.type === 'deactivate' ? "warning" : "info"}
      />
    </Stack>
  );
};
