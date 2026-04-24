import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Stack, TextField, InputAdornment, Typography
} from '@mui/material';
import { tripsApi, unitsApi } from 'src/services/apiService';

export const TripCloseModal = ({ open, onClose, trip, onSuccess }) => {
  const [fuelCost, setFuelCost] = useState(trip?.costDetail?.estimatedFuelCost || '');
  const [extrasCost, setExtrasCost] = useState(trip?.costDetail?.estimatedExtrasCost || '');
  const [loading, setLoading] = useState(false);

  const handleCloseTrip = async () => {
    setLoading(true);
    try {
      const actualTollboothCost = trip?.costDetail?.estimatedTollboothCost || 0;

      await tripsApi.updateStatus(trip.id, 'completado', {
        actualTollboothCost,
        actualFuelCost: Number(fuelCost),
        actualExtrasCost: Number(extrasCost)
      });

      onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth>
      <DialogTitle>Cerrar Viaje</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          <Typography variant="body2"
            color="text.secondary">
            Registra los costos reales para finalizar el viaje. La hora de llegada se registrará automáticamente.
          </Typography>
          <TextField
            label="Costo Combustible (Real)"
            type="number"
            value={fuelCost}
            onChange={(e) => setFuelCost(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment
                position="start"
                sx={{
                  transform: "translateY(4px)"
                }}
              >$</InputAdornment>,
            }}
            fullWidth
          />
          <TextField
            label="Extras (Real)"
            type="number"
            value={extrasCost}
            onChange={(e) => setExtrasCost(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment
                position="start"
                sx={{
                  transform: "translateY(4px)"
                }}
              >$</InputAdornment>,
            }}
            fullWidth
          />

          <Typography variant="subtitle2"
            sx={{ mt: 2 }}>
            Casetas: ${trip?.costDetail?.estimatedTollboothCost?.toLocaleString('es-MX')} (Planificado)
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}
          disabled={loading}>Cancelar</Button>
        <Button
          onClick={handleCloseTrip}
          variant="contained"
          disabled={loading}
        >
          Confirmar y Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
