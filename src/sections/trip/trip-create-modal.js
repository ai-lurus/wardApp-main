import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Stepper, Step, StepLabel, Box, Stack, FormControl, InputLabel, Select, MenuItem,
  TextField, Typography, CircularProgress, Divider, Paper, Alert
} from '@mui/material';
import { routesApi, tripsApi, unitsApi } from 'src/services/apiService';

const steps = ['Asignación', 'Desglose de Costos', 'Confirmación'];

export const TripCreateModal = ({ open, onClose, onSuccess, routes, units, users }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [routeId, setRouteId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [operatorId, setOperatorId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');

  // Cost Preview State
  const [costPreview, setCostPreview] = useState(null);
  const [adHocExtras, setAdHocExtras] = useState(0);

  // Available options
  const availableUnits = units.filter(u => u.status === 'disponible');
  const availableOperators = users; // For now assuming all operators available or filtering by role

  const selectedRoute = routes.find(r => r.id === routeId);
  const selectedUnit = units.find(u => u.id === unitId);
  const selectedOperator = users.find(u => u.id === operatorId);

  const fetchCostPreview = async () => {
    if (!routeId || !selectedUnit?.axles) return;
    setLoading(true);
    setError(null);
    try {
      const result = await routesApi.getCostPreview(routeId, selectedUnit.axles);
      setCostPreview(result);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Error al obtener desglose de costos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeStep === 1) {
      fetchCostPreview();
    }
  }, [activeStep, routeId, unitId]);

  const handleNext = () => {
    if (activeStep === 0) {
      if (!routeId || !unitId || !operatorId || !scheduledDate) {
        setError("Completa todos los campos para continuar.");
        return;
      }
    }
    setError(null);
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        routeId,
        unitId,
        operatorId,
        scheduledDate,
        route: selectedRoute,
        unit: selectedUnit,
        operator: selectedOperator,
        estimatedCost: {
          tolls: costPreview?.tollsTotal || 0,
          fuel: costPreview?.fuelEstimatedCost || 0,
          insurance: 0, // Mock or fetch if needed
          extras: Number(adHocExtras) || 0,
          total: (costPreview?.tollsTotal || 0) + (costPreview?.fuelEstimatedCost || 0) + (Number(adHocExtras) || 0)
        }
      };

      const newTrip = await tripsApi.create(payload);

      // Update unit status mock
      await unitsApi.updateStatus(unitId, 'en_viaje').catch(e => console.warn('Could not update unit status', e));

      onSuccess(newTrip);
    } catch (err) {
      console.error(err);
      setError('Error al crear el viaje');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}
            sx={{ mt: 2 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              select
              fullWidth
              label="Ruta"
              value={routeId}
              onChange={(e) => setRouteId(e.target.value)}
            >
              {routes.filter(r => r.active).map(r => (
                <MenuItem key={r.id}
                  value={r.id}>{r.name} ({r.origin} → {r.destination})</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              label="Unidad (Disponibles)"
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
            >
              {availableUnits.map(u => (
                <MenuItem key={u.id}
                  value={u.id}>{u.plate || u.matricula} - {u.type} ({u.axles || u.axesNumber} ejes)</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              label="Operador"
              value={operatorId}
              onChange={(e) => setOperatorId(e.target.value)}
            >
              {availableOperators.map(o => (
                <MenuItem key={o.id}
                  value={o.id}>{o.name}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Fecha Programada"
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              fullWidth
            />
          </Stack>
        );
      case 1:
        if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
        if (error) return <Alert severity="error">{error}</Alert>;
        if (!costPreview) return <Typography>No se pudo cargar el preview de costos.</Typography>;

        return (
          <Stack spacing={3}
            sx={{ mt: 2 }}>
            <Paper variant="outlined"
              sx={{ p: 2 }}>
              <Typography variant="h6"
                gutterBottom>Desglose Estimado</Typography>
              <Stack direction="row"
                justifyContent="space-between"
                sx={{ mb: 1 }}>
                <Typography color="text.secondary">Casetas ({costPreview.tollboothsCount})</Typography>
                <Typography>${costPreview.tollsTotal?.toLocaleString('es-MX')}</Typography>
              </Stack>
              <Stack direction="row"
                justifyContent="space-between"
                sx={{ mb: 1 }}>
                <Typography color="text.secondary">Combustible (Est.)</Typography>
                <Typography>${costPreview.fuelEstimatedCost?.toLocaleString('es-MX')}</Typography>
              </Stack>
              <Stack direction="row"
                justifyContent="space-between"
                sx={{ mb: 1 }}>
                <Typography color="text.secondary">Seguro de Carga</Typography>
                <Typography>$0.00</Typography>
              </Stack>
              <Divider sx={{ my: 1 }} />
              <Stack direction="row"
                justifyContent="space-between"
                alignItems="center">
                <Typography variant="subtitle2">Extras Ad-hoc</Typography>
                <TextField
                  size="small"
                  type="number"
                  value={adHocExtras}
                  onChange={(e) => setAdHocExtras(e.target.value)}
                  sx={{ width: 120 }}
                  InputProps={{ startAdornment: '$' }}
                />
              </Stack>
            </Paper>
          </Stack>
        );
      case 2:
        const total = (costPreview?.tollsTotal || 0) + (costPreview?.fuelEstimatedCost || 0) + (Number(adHocExtras) || 0);
        return (
          <Stack spacing={3}
            sx={{ mt: 2 }}>
            <Typography variant="h6">Resumen del Viaje</Typography>
            <Box>
              <Typography variant="subtitle2"
                color="text.secondary">Ruta</Typography>
              <Typography>{selectedRoute?.name}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2"
                color="text.secondary">Unidad</Typography>
              <Typography>{selectedUnit?.plate || selectedUnit?.matricula}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2"
                color="text.secondary">Operador</Typography>
              <Typography>{selectedOperator?.name}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2"
                color="text.secondary">Fecha</Typography>
              <Typography>{scheduledDate}</Typography>
            </Box>
            <Divider />
            <Stack direction="row"
              justifyContent="space-between">
              <Typography variant="h6">Costo Total Estimado</Typography>
              <Typography variant="h6"
                color="primary">${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</Typography>
            </Stack>
          </Stack>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth>
      <DialogTitle>Nuevo Viaje</DialogTitle>
      <DialogContent dividers>
        <Stepper activeStep={activeStep}
          alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {renderStepContent(activeStep)}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}
          disabled={loading}>Cancelar</Button>
        {activeStep > 0 && (
          <Button onClick={handleBack}
            disabled={loading}>Atrás</Button>
        )}
        {activeStep < steps.length - 1 ? (
          <Button onClick={handleNext}
            variant="contained"
            disabled={loading}>
            Siguiente
          </Button>
        ) : (
          <Button onClick={handleCreate}
            variant="contained"
            disabled={loading}>
            Confirmar y Crear
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
