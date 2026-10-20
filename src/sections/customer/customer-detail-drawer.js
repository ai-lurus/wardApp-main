import { useEffect, useState } from 'react';
import {
  Box,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import XMarkIcon from '@heroicons/react/24/solid/XMarkIcon';
import { format } from 'date-fns';
import { customersApi } from 'src/services/apiService';
import { formatCurrency } from 'src/utils/format-currency';

const statusMap = {
  programado: { color: 'info', label: 'Programado' },
  en_curso: { color: 'warning', label: 'En Curso' },
  completado: { color: 'success', label: 'Completado' },
  cancelado: { color: 'error', label: 'Cancelado' }
};

const Stat = ({ label, value, color = 'text.primary' }) => (
  <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}>
    <Typography variant="overline"
      color="text.secondary"
      display="block">
      {label}
    </Typography>
    <Typography variant="h6"
      color={color}>
      {value}
    </Typography>
  </Box>
);

export const CustomerDetailDrawer = ({ open, onClose, customerId }) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && customerId) {
      setLoading(true);
      customersApi.get(customerId)
        .then(setCustomer)
        .catch((err) => console.error('Failed to fetch customer detail', err))
        .finally(() => setLoading(false));
    } else {
      setCustomer(null);
    }
  }, [open, customerId]);

  const stats = customer?.stats;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', md: 760 }, p: 3 } }}
    >
      <Stack direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}>
        <Typography variant="h5">Detalle del Cliente</Typography>
        <IconButton onClick={onClose}>
          <XMarkIcon width={24} />
        </IconButton>
      </Stack>

      {loading || !customer ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
      ) : (
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6">{customer.name}</Typography>
            <Typography variant="body2"
              color="text.secondary">
              {customer.phone}{customer.email ? ` · ${customer.email}` : ''}
            </Typography>
            {customer.notes && (
              <Typography variant="body2"
                sx={{ mt: 1, whiteSpace: 'pre-line' }}>
                {customer.notes}
              </Typography>
            )}
          </Box>

          <Divider />

          <Box>
            <Typography variant="h6"
              sx={{ mb: 2 }}>Finanzas</Typography>
            <Grid container
              spacing={2}>
              <Grid xs={6}
                sm={4}>
                <Stat label="Viajes"
                  value={stats.tripCount} />
              </Grid>
              <Grid xs={6}
                sm={4}>
                <Stat label="Ingresos"
                  value={formatCurrency(stats.revenue)} />
              </Grid>
              <Grid xs={6}
                sm={4}>
                <Stat label="Costos"
                  value={formatCurrency(stats.cost)} />
              </Grid>
              <Grid xs={6}
                sm={4}>
                <Stat label="Utilidad"
                  value={formatCurrency(stats.profit)}
                  color={stats.profit < 0 ? 'error.main' : 'success.main'} />
              </Grid>
              <Grid xs={6}
                sm={4}>
                <Stat label="Margen"
                  value={`${stats.margin.toFixed(1)}%`} />
              </Grid>
              <Grid xs={6}
                sm={4}>
                <Stat label="Último viaje"
                  value={stats.lastTripDate ? format(new Date(stats.lastTripDate), 'dd/MM/yyyy') : '—'} />
              </Grid>
            </Grid>
            <Typography variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 1 }}>
              Ingresos, costos y utilidad consideran solo viajes completados ({stats.completedCount}).
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="h6"
              sx={{ mb: 2 }}>Viajes</Typography>
            {customer.trips.length === 0 ? (
              <Typography color="text.secondary">Este cliente aún no tiene viajes.</Typography>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Ruta</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell align="right">Ingreso</TableCell>
                      <TableCell align="right">Utilidad</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {customer.trips.map((trip) => {
                      const status = statusMap[trip.status] || { color: 'default', label: trip.status };
                      const isCompleted = trip.status === 'completado';
                      const profit = (trip.entryCost || 0) - (trip.actualCost || 0);
                      return (
                        <TableRow key={trip.id}
                          hover>
                          <TableCell>{format(new Date(trip.scheduledDate), 'dd/MM/yyyy')}</TableCell>
                          <TableCell>
                            {trip.route?.name}
                            <Typography variant="body2"
                              color="text.secondary">
                              {trip.route?.origin} → {trip.route?.destination}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip size="small"
                              label={status.label}
                              color={status.color} />
                          </TableCell>
                          <TableCell align="right">
                            {trip.entryCost ? formatCurrency(trip.entryCost) : '—'}
                          </TableCell>
                          <TableCell align="right">
                            {isCompleted ? (
                              <Typography variant="body2"
                                color={profit < 0 ? 'error.main' : 'success.main'}>
                                {formatCurrency(profit)}
                              </Typography>
                            ) : '—'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Box>
            )}
          </Box>
        </Stack>
      )}
    </Drawer>
  );
};
