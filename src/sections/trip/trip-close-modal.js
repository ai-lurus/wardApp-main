import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Stack, TextField, InputAdornment, Typography
} from '@mui/material';
import { tripsApi, unitsApi } from 'src/services/apiService';

export const TripCloseModal = ({ open, onClose, trip, onSuccess }) => {
  const [tollboothCost, setTollboothCost] = useState(trip?.costDetail?.estimatedTollboothCost || '');
  const [fuelCost, setFuelCost] = useState(trip?.costDetail?.estimatedFuelCost || '');
  const [extrasCost, setExtrasCost] = useState(trip?.costDetail?.estimatedExtrasCost || '');
  const [revenue, setRevenue] = useState(trip?.entryCost || '');
  const [loading, setLoading] = useState(false);

  const handleCloseTrip = async () => {
    setLoading(true);
    try {
      await tripsApi.updateStatus(trip.id, 'completado', {
        actualTollboothCost: Number(tollboothCost),
        actualFuelCost: Number(fuelCost),
        actualExtrasCost: Number(extrasCost),
        entryCost: Number(revenue)
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
            label="Costo Casetas (Real)"
            type="number"
            value={tollboothCost}
            onChange={(e) => setTollboothCost(e.target.value)}
            helperText={`Planificado: $${trip?.costDetail?.estimatedTollboothCost?.toLocaleString('es-MX')}`}
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
          <TextField
            label="Ingresos del Viaje (Facturado)"
            type="number"
            value={revenue}
            onChange={(e) => setRevenue(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment
                position="start"
                sx={{
                  transform: "translateY(4px)"
                }}
              >$</InputAdornment>,
            }}
            fullWidth
            required
          />


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
