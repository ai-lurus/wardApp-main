import {
  Drawer, Box, Typography, Stack, IconButton, Divider, Grid, Chip, Button
} from '@mui/material';
import XMarkIcon from '@heroicons/react/24/solid/XMarkIcon';
import { format } from 'date-fns';
import { TripCloseModal } from './trip-close-modal';
import { useState } from 'react';
import { tripsApi } from 'src/services/apiService';

const statusMap = {
  programado: { color: 'info', label: 'Programado' },
  en_curso: { color: 'warning', label: 'En Curso' },
  completado: { color: 'success', label: 'Completado' },
  cancelado: { color: 'error', label: 'Cancelado' }
};

export const TripDetailDrawer = ({ open, onClose, trip, onSuccess }) => {
  const [closeModalOpen, setCloseModalOpen] = useState(false);

  if (!trip) return null;
  const status = statusMap[trip.status] || { color: 'default', label: trip.status };

  const handleStartTrip = async () => {
    try {
      await tripsApi.updateStatus(trip.id, 'en_curso');
      onSuccess();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTripClosed = () => {
    setCloseModalOpen(false);
    onSuccess();
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{ sx: { width: { xs: '100%', md: 600 }, p: 3 } }}
      >
        <Stack direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 3 }}>
          <Typography variant="h5">Detalle del Viaje</Typography>
          <IconButton onClick={onClose}>
            <XMarkIcon width={24} />
          </IconButton>
        </Stack>

        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2"
              color="text.secondary">Estado Actual</Typography>
            <Stack direction="row"
              spacing={2}
              alignItems="center"
              sx={{ mt: 1 }}>
              <Chip label={status.label}
                color={status.color} />

              {trip.status === 'programado' && (
                <Button variant="outlined"
                  size="small"
                  onClick={handleStartTrip}>
                  Iniciar Viaje
                </Button>
              )}
              {trip.status === 'en_curso' && (
                <Button variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => setCloseModalOpen(true)}>
                  Cerrar Viaje
                </Button>
              )}
            </Stack>
          </Box>

          <Divider />

          <Grid container
            spacing={2}>
            <Grid item
              xs={12}
              sm={6}>
              <Typography variant="subtitle2"
                color="text.secondary">Ruta</Typography>
              <Typography>{trip.route?.name}</Typography>
              <Typography variant="body2"
                color="text.secondary">
                {trip.route?.origin} → {trip.route?.destination}
              </Typography>
            </Grid>
            <Grid item
              xs={12}
              sm={6}>
              <Typography variant="subtitle2"
                color="text.secondary">Fecha Programada</Typography>
              <Typography>{format(new Date(trip.scheduledDate || trip.createdAt), 'dd/MM/yyyy HH:mm')}</Typography>
            </Grid>
            <Grid item
              xs={12}
              sm={6}>
              <Typography variant="subtitle2"
                color="text.secondary">Unidad</Typography>
              <Typography>{trip.unit?.plate || trip.unit?.matricula} ({trip.unit?.type})</Typography>
            </Grid>
            <Grid item
              xs={12}
              sm={6}>
              <Typography variant="subtitle2"
                color="text.secondary">Operador</Typography>
              <Typography>{trip.operator?.name || 'No asignado'}</Typography>
            </Grid>
          </Grid>

          <Divider />

          <Typography variant="h6">Desglose de Costos</Typography>

          <Grid container
            spacing={3}>
            <Grid item
              xs={12}
              md={trip.status === 'completado' ? 6 : 12}>
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="subtitle2"
                  gutterBottom>Costo Estimado</Typography>
                <Stack spacing={1}>
                  <Stack direction="row"
                    justifyContent="space-between">
                    <Typography variant="body2">Casetas</Typography>
                    <Typography variant="body2">${trip.estimatedCost?.tolls?.toLocaleString('es-MX') || 0}</Typography>
                  </Stack>
                  <Stack direction="row"
                    justifyContent="space-between">
                    <Typography variant="body2">Combustible</Typography>
                    <Typography variant="body2">${trip.estimatedCost?.fuel?.toLocaleString('es-MX') || 0}</Typography>
                  </Stack>
                  <Stack direction="row"
                    justifyContent="space-between">
                    <Typography variant="body2">Extras</Typography>
                    <Typography variant="body2">${trip.estimatedCost?.extras?.toLocaleString('es-MX') || 0}</Typography>
                  </Stack>
                  <Divider />
                  <Stack direction="row"
                    justifyContent="space-between">
                    <Typography variant="subtitle2">Total</Typography>
                    <Typography variant="subtitle2">${trip.estimatedCost?.total?.toLocaleString('es-MX') || 0}</Typography>
                  </Stack>
                </Stack>
              </Box>
            </Grid>

            {trip.status === 'completado' && trip.actualCost && (
              <Grid item
                xs={12}
                md={6}>
                <Box sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 1 }}>
                  <Typography variant="subtitle2"
                    gutterBottom>Costo Real</Typography>
                  <Stack spacing={1}>
                    <Stack direction="row"
                      justifyContent="space-between">
                      <Typography variant="body2">Casetas</Typography>
                      <Typography variant="body2">${trip.actualCost?.tolls?.toLocaleString('es-MX') || 0}</Typography>
                    </Stack>
                    <Stack direction="row"
                      justifyContent="space-between">
                      <Typography variant="body2">Combustible</Typography>
                      <Typography variant="body2">${trip.actualCost?.fuel?.toLocaleString('es-MX') || 0}</Typography>
                    </Stack>
                    <Stack direction="row"
                      justifyContent="space-between">
                      <Typography variant="body2">Extras</Typography>
                      <Typography variant="body2">${trip.actualCost?.extras?.toLocaleString('es-MX') || 0}</Typography>
                    </Stack>
                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
                    <Stack direction="row"
                      justifyContent="space-between">
                      <Typography variant="subtitle2">Total</Typography>
                      <Typography variant="subtitle2">${trip.actualCost?.total?.toLocaleString('es-MX') || 0}</Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Grid>
            )}
          </Grid>

          {trip.status === 'completado' && trip.arrivalTime && (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle2"
                  color="text.secondary">Fecha de Llegada (Real)</Typography>
                <Typography>{format(new Date(trip.arrivalTime), 'dd/MM/yyyy HH:mm')}</Typography>
              </Box>
            </>
          )}

        </Stack>
      </Drawer>

      {closeModalOpen && (
        <TripCloseModal
          open={closeModalOpen}
          onClose={() => setCloseModalOpen(false)}
          trip={trip}
          onSuccess={handleTripClosed}
        />
      )}
    </>
  );
};
