import {
  Drawer, Box, Typography, Stack, IconButton, Divider, Grid, Chip, Button, CircularProgress
} from '@mui/material';
import XMarkIcon from '@heroicons/react/24/solid/XMarkIcon';
import { format } from 'date-fns';
import { TripCloseModal } from './trip-close-modal';
import { ConfirmActionModal } from 'src/components/confirm-action-modal';
import { useState, useEffect } from 'react';
import { tripsApi } from 'src/services/apiService';

const statusMap = {
  programado: { color: 'info', label: 'Programado' },
  en_curso: { color: 'warning', label: 'En Curso' },
  completado: { color: 'success', label: 'Completado' },
  cancelado: { color: 'error', label: 'Cancelado' }
};

export const TripDetailDrawer = ({ open, onClose, trip, onSuccess }) => {
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [tripDetail, setTripDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && trip?.id) {
      setLoading(true);
      tripsApi.get(trip.id)
        .then(data => setTripDetail(data))
        .catch(err => console.error('Failed to fetch trip detail', err))
        .finally(() => setLoading(false));
    } else {
      setTripDetail(null);
    }
  }, [open, trip?.id]);

  if (!open || !trip) return null;
  const data = tripDetail || trip;
  const status = statusMap[data.status] || { color: 'default', label: data.status };

  const handleStartTrip = async () => {
    try {
      await tripsApi.updateStatus(data.id, 'en_curso');
      onSuccess();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelTrip = async () => {
    try {
      await tripsApi.updateStatus(data.id, 'cancelado');
      setCancelModalOpen(false);
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

        {loading && !tripDetail ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
        ) : (
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

                {data.status === 'programado' && (
                  <Button variant="outlined"
                    size="small"
                    onClick={handleStartTrip}>
                    Iniciar Viaje
                  </Button>
                )}
                {data.status === 'en_curso' && (
                  <Button variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => setCloseModalOpen(true)}>
                    Cerrar Viaje
                  </Button>
                )}
                {(data.status === 'programado' || data.status === 'en_curso') && (
                  <Button variant="contained"
                    color="error"
                    size="small"
                    onClick={() => setCancelModalOpen(true)}>
                    Cancelar Viaje
                  </Button>
                )}
              </Stack>
            </Box>

            <Divider sx={{ my: 3, borderBottomWidth: 2 }} />

            <Grid container
              spacing={2}>
              <Grid item
                xs={12}
                sm={6}>
                <Typography variant="subtitle2"
                  color="text.secondary">Ruta</Typography>
                <Typography>{data.route?.name}</Typography>
                <Typography variant="body2"
                  color="text.secondary">
                  {data.route?.origin} → {data.route?.destination}
                </Typography>
              </Grid>
              <Grid item
                xs={12}
                sm={6}>
                <Typography variant="subtitle2"
                  color="text.secondary">Unidad</Typography>
                <Typography>{data.unit?.plate || data.unit?.matricula} ({data.unit?.type})</Typography>
              </Grid>
              <Grid item
                xs={12}
                sm={6}>
                <Typography variant="subtitle2"
                  color="text.secondary">Operador</Typography>
                <Typography>{data.operator?.name || 'No asignado'}</Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3, borderBottomWidth: 2 }} />

            <Grid container
              spacing={2}>
              <Grid item
                xs={12}
                sm={6}>
                <Typography variant="subtitle2"
                  color="text.secondary">Salida Programada</Typography>
                <Typography>{data.scheduledDate || data.createdAt ? format(new Date(data.scheduledDate || data.createdAt), 'dd/MM/yyyy HH:mm') : '--'}</Typography>
              </Grid>
              <Grid item
                xs={12}
                sm={6}>
                <Typography variant="subtitle2"
                  color="text.secondary">Llegada (Real)</Typography>
                <Typography>{data.status === 'completado' && data.arrivalTime ? format(new Date(data.arrivalTime), 'dd/MM/yyyy HH:mm') : '--'}</Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3, borderBottomWidth: 2 }} />

            <Typography variant="h6">Desglose de Costos</Typography>

            <Grid container
              spacing={0}
              justifyContent="center">
              <Grid item
                xs={12}
                md={data.status === 'completado' ? 6 : 12}
                sx={{ p: 1.5 }}>
                <Box sx={{
                  p: 3,
                  bgcolor: 'background.paper',
                  borderRadius: 3,
                  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)',
                  border: '1px solid',
                  borderColor: 'divider',
                  height: '100%'
                }}>
                  <Typography
                    variant="overline"
                    sx={{
                      fontWeight: 700,
                      letterSpacing: 1.1,
                      color: 'text.secondary',
                      display: 'block',
                      mb: 1
                    }}
                  >
                    Costo Estimado
                  </Typography>
                  <Stack spacing={1}>
                    <Stack direction="row"
                      justifyContent="space-between">
                      <Typography variant="body2">Casetas</Typography>
                      <Typography variant="body2">${data.costDetail?.estimatedTollboothCost?.toLocaleString('es-MX', { minimumFractionDigits: 2 }) || 0}</Typography>
                    </Stack>
                    <Stack direction="row"
                      justifyContent="space-between">
                      <Typography variant="body2">Combustible</Typography>
                      <Typography variant="body2">${data.costDetail?.estimatedFuelCost?.toLocaleString('es-MX', { minimumFractionDigits: 2 }) || 0}</Typography>
                    </Stack>
                    <Stack direction="row"
                      justifyContent="space-between">
                      <Typography variant="body2">Extras</Typography>
                      <Typography variant="body2">${data.costDetail?.estimatedExtrasCost?.toLocaleString('es-MX', { minimumFractionDigits: 2 }) || 0}</Typography>
                    </Stack>
                    <Divider sx={{ my: 1, borderBottomWidth: 1.5 }} />
                    <Stack direction="row"
                      justifyContent="space-between">
                      <Typography variant="subtitle2">Total</Typography>
                      <Typography variant="subtitle2">${data.estimatedCost?.toLocaleString('es-MX', { minimumFractionDigits: 2 }) || 0}</Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Grid>

              {data.status === 'completado' && data.actualCost !== undefined && data.actualCost !== null && (
                <Grid item
                  xs={12}
                  md={6}
                  sx={{ p: 1.5 }}>
                  <Box sx={{
                    p: 3,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    borderRadius: 3,
                    boxShadow: '0px 4px 20px rgba(99, 102, 241, 0.2)',
                    height: '100%'
                  }}>
                    <Typography
                      variant="overline"
                      sx={{
                        fontWeight: 700,
                        letterSpacing: 1.1,
                        color: 'inherit',
                        display: 'block',
                        mb: 1,
                        opacity: 0.9
                      }}
                    >
                      Costo Real
                    </Typography>
                    <Stack spacing={1}>
                      <Stack direction="row"
                        justifyContent="space-between">
                        <Typography variant="body2">Casetas</Typography>
                        <Typography variant="body2">${data.costDetail?.tollboothCost?.toLocaleString('es-MX', { minimumFractionDigits: 2 }) || 0}</Typography>
                      </Stack>
                      <Stack direction="row"
                        justifyContent="space-between">
                        <Typography variant="body2">Combustible</Typography>
                        <Typography variant="body2">${data.costDetail?.fuelCost?.toLocaleString('es-MX', { minimumFractionDigits: 2 }) || 0}</Typography>
                      </Stack>
                      <Stack direction="row"
                        justifyContent="space-between">
                        <Typography variant="body2">Extras</Typography>
                        <Typography variant="body2">${data.costDetail?.extrasCost?.toLocaleString('es-MX', { minimumFractionDigits: 2 }) || 0}</Typography>
                      </Stack>
                      <Divider sx={{ borderColor: 'rgba(255,255,255,0.3)', my: 1, borderBottomWidth: 1.5 }} />
                      <Stack direction="row"
                        justifyContent="space-between">
                        <Typography variant="subtitle2">Total</Typography>
                        <Typography variant="subtitle2">${data.actualCost?.toLocaleString('es-MX', { minimumFractionDigits: 2 }) || 0}</Typography>
                      </Stack>
                    </Stack>
                  </Box>
                </Grid>
              )}
            </Grid>

          </Stack>
        )}
      </Drawer>

      {closeModalOpen && (
        <TripCloseModal
          open={closeModalOpen}
          onClose={() => setCloseModalOpen(false)}
          trip={data}
          onSuccess={handleTripClosed}
        />
      )}

      <ConfirmActionModal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancelTrip}
        title="Cancelar Viaje"
        description="Esta acción cancelará el viaje y no podrá revertirse. La unidad y el operador volverán a estar disponibles."
        confirmText="Sí, cancelar"
        color="error"
      />
    </>
  );
};
