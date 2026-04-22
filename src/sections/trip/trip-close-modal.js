import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Stack, TextField, InputAdornment, Typography
} from '@mui/material';
import { tripsApi, unitsApi } from 'src/services/apiService';

export const TripCloseModal = ({ open, onClose, trip, onSuccess }) => {
  const [arrivalTime, setArrivalTime] = useState('');
  const [fuelCost, setFuelCost] = useState(trip?.estimatedCost?.fuel || 0);
  const [extrasCost, setExtrasCost] = useState(trip?.estimatedCost?.extras || 0);
  const [loading, setLoading] = useState(false);

  const handleCloseTrip = async () => {
    setLoading(true);
    try {
      const tolls = trip.estimatedCost?.tolls || 0;
      const actualCost = {
        tolls,
        fuel: Number(fuelCost),
        extras: Number(extrasCost),
        total: tolls + Number(fuelCost) + Number(extrasCost)
      };

      await tripsApi.updateStatus(trip.id, 'completado', {
        arrivalTime,
        actualCost
      });

      // Update unit status back to 'disponible'
      if (trip.unitId) {
        await unitsApi.updateStatus(trip.unitId, 'disponible').catch(e => console.warn('Could not free unit', e));
      }

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
            Registra los costos reales y la hora de llegada para finalizar el viaje.
          </Typography>
          <TextField
            label="Hora de Llegada"
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            value={arrivalTime}
            onChange={(e) => setArrivalTime(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Costo Combustible (Real)"
            type="number"
            value={fuelCost}
            onChange={(e) => setFuelCost(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            fullWidth
          />
          <TextField
            label="Extras (Real)"
            type="number"
            value={extrasCost}
            onChange={(e) => setExtrasCost(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            fullWidth
          />
          <Typography variant="subtitle2"
            sx={{ mt: 2 }}>
            Casetas: ${trip?.estimatedCost?.tolls?.toLocaleString('es-MX')} (Planificado)
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}
          disabled={loading}>Cancelar</Button>
        <Button
          onClick={handleCloseTrip}
          variant="contained"
          disabled={loading || !arrivalTime}
        >
          Confirmar y Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
