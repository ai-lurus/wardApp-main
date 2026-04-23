import { useCallback, useEffect, useState } from 'react';
import { Stack, Button } from '@mui/material';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import { TripsTable } from './trips-table';
import { TripsSearch } from './trips-search';
import { TripsSummary } from './trips-summary';
import { TripCreateModal } from './trip-create-modal';
import { TripDetailDrawer } from './trip-detail-drawer';
import { tripsApi, routesApi, unitsApi, operatorsApi } from 'src/services/apiService';

export const TripsSection = () => {
  const [trips, setTrips] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [units, setUnits] = useState([]);
  const [operators, setOperators] = useState([]);
  
  const [filters, setFilters] = useState({ query: '', status: '', routeId: '', unitId: '' });
  
  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailDrawer, setDetailDrawer] = useState({ open: false, data: null });

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchDependencies = useCallback(async () => {
    try {
      const [fetchedRoutes, fetchedUnits, fetchedOperators] = await Promise.all([
        routesApi.list({ active: 'true' }),
        unitsApi.list({ available_only: 'true' }),
        operatorsApi.list({ available_only: 'true' })
      ]);
      setRoutes(fetchedRoutes);
      setUnits(fetchedUnits?.items || fetchedUnits || []);
      setOperators(fetchedOperators || []);
    } catch (err) {
      console.error('Error fetching dependencies:', err);
    }
  }, []);

  const fetchTrips = useCallback(async () => {
    try {
      const data = await tripsApi.list(filters);
      setTrips(data);
    } catch (err) {
      console.error('Error fetching trips:', err);
    }
  }, [filters]);

  useEffect(() => {
    fetchDependencies();
  }, [fetchDependencies]);

  useEffect(() => {
    fetchTrips();
    setPage(0);
  }, [fetchTrips]);

  const handlePageChange = useCallback((event, value) => {
    setPage(value);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const paginatedTrips = trips.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleTripCreated = () => {
    setCreateModalOpen(false);
    fetchTrips();
  };

  const handleTripUpdated = () => {
    setDetailDrawer({ open: false, data: null });
    fetchTrips();
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row"
justifyContent="flex-end"
sx={{ mb: 2 }}>
        <Button
          startIcon={<PlusIcon style={{ width: 20 }} />}
          variant="contained"
          onClick={() => setCreateModalOpen(true)}
        >
          Nuevo Viaje
        </Button>
      </Stack>

      <TripsSummary trips={trips} />

      <TripsSearch 
        onSearch={setFilters}
        routes={routes}
        units={units}
      />

      <TripsTable 
        count={trips.length}
        items={paginatedTrips} 
        onViewDetail={(trip) => setDetailDrawer({ open: true, data: trip })}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
      />
      
      {createModalOpen && (
        <TripCreateModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={handleTripCreated}
          routes={routes}
          units={units}
          operators={operators}
        />
      )}

      {detailDrawer.open && (
        <TripDetailDrawer
          open={detailDrawer.open}
          onClose={() => setDetailDrawer({ open: false, data: null })}
          onSuccess={handleTripUpdated}
          trip={detailDrawer.data}
        />
      )}
    </Stack>
  );
};
