import { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import MagnifyingGlassIcon from '@heroicons/react/24/solid/MagnifyingGlassIcon';
import {
  Alert,
  Box,
  Card,
  Chip,
  Container,
  InputAdornment,
  MenuItem,
  Snackbar,
  Stack,
  SvgIcon,
  TextField,
  Typography,
} from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { GpsTripsTable } from 'src/sections/gps/gps-trips-table';
import { GpsShareTrackingDialog } from 'src/sections/gps/gps-share-tracking-dialog';
import { tripStatusMap } from 'src/sections/gps/gps-status';
import { TableSkeleton } from 'src/components/table-skeleton';
import { applyPagination } from 'src/utils/apply-pagination';
import { gpsApi } from 'src/services/apiService';

const Page = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Opened from a unit detail with ?q=ECO-101 to show that unit's trips.
  useEffect(() => {
    if (router.query.q) setSearchQuery(String(router.query.q));
  }, [router.query.q]);
  const [statusFilter, setStatusFilter] = useState('');
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareTrip, setShareTrip] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setTrips(await gpsApi.listTrips());
    } catch (err) {
      console.error('Error fetching GPS trips:', err);
      setSnackbar({ open: true, message: 'Error al cargar viajes', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredTrips = useMemo(() => {
    let result = trips;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((trip) =>
        [trip.id, trip.client, trip.unitEco, trip.unitPlate, trip.driverName, trip.origin, trip.destination]
          .some((value) => value.toLowerCase().includes(query))
      );
    }
    if (statusFilter) {
      result = result.filter((trip) => trip.status === statusFilter);
    }
    return result;
  }, [trips, searchQuery, statusFilter]);

  const paginatedTrips = useMemo(
    () => applyPagination(filteredTrips, page, rowsPerPage),
    [filteredTrips, page, rowsPerPage]
  );

  const handlePageChange = useCallback((event, value) => {
    setPage(value);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  return (
    <>
      <Head>
        <title>Viajes en ruta | Ward</title>
      </Head>
      <Box component="main"
sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack direction="row"
spacing={1.5}
alignItems="center">
              <Typography variant="h4">Viajes en ruta</Typography>
              <Chip label="Demo"
color="primary"
size="small"
variant="outlined" />
            </Stack>
            <Card sx={{ p: 2 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }}
spacing={2}
alignItems={{ sm: 'center' }}>
                <TextField
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
                  placeholder="Buscar por viaje, cliente, unidad u operador..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SvgIcon color="action"
fontSize="small">
                          <MagnifyingGlassIcon />
                        </SvgIcon>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ flexGrow: 1, maxWidth: { sm: 480 } }}
                  size="small"
                />
                <TextField
                  select
                  label="Estado"
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                  sx={{ minWidth: 180 }}
                  size="small"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {Object.entries(tripStatusMap).map(([status, config]) => (
                    <MenuItem key={status}
value={status}>
                      {config.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            </Card>
            {loading ? (
              <TableSkeleton rowCount={8}
colCount={8} />
            ) : (
              <GpsTripsTable
                count={filteredTrips.length}
                items={paginatedTrips}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                page={page}
                rowsPerPage={rowsPerPage}
                onShare={setShareTrip}
              />
            )}
          </Stack>
        </Container>
      </Box>
      <GpsShareTrackingDialog trip={shareTrip}
onClose={() => setShareTrip(null)} />
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

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
