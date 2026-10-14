import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Stepper, Step, StepLabel, Box, Stack, MenuItem,
  TextField, Typography, CircularProgress, Divider, Paper, Alert, InputAdornment
} from '@mui/material';
import { routesApi, tripsApi } from 'src/services/apiService';

const steps = ['Asignación', 'Desglose de Costos', 'Confirmación'];

export const TripCreateModal = ({ open, onClose, onSuccess, routes, units, operators }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [routeId, setRouteId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [operatorId, setOperatorId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');

  // Cost Preview State
  const [routeDetails, setRouteDetails] = useState(null);
  const [adHocExtras, setAdHocExtras] = useState("");
  const [fuelCostEst, setFuelCostEst] = useState("");
  const [dieselPrice, setDieselPrice] = useState("");

  // Available options
  const availableUnits = units.filter(u => u.status === 'disponible');
  const availableOperators = operators; // For now assuming all operators available or filtering by role

  const selectedRoute = routes.find(r => r.id === routeId);
  const selectedUnit = units.find(u => u.id === unitId);
  const selectedOperator = operators.find(u => u.id === operatorId);

  useEffect(() => {
    const distance = routeDetails?.distanceKm || selectedRoute?.distanceKm || 0;
    const efficiency = parseFloat(selectedUnit?.fuelEfficiency) || 0;

    if (distance > 0 && efficiency > 0 && dieselPrice) {
      const litersNeeded = distance / efficiency;
      const calculatedFuelCost = (Number(dieselPrice) || 0) * litersNeeded;
      setFuelCostEst(calculatedFuelCost.toFixed(2));
    } else {
      setFuelCostEst("");
    }
  }, [dieselPrice, routeDetails, selectedRoute, selectedUnit, setFuelCostEst]);

  const fetchCostPreview = async () => {
    const axles = selectedUnit?.axles || selectedUnit?.axesNumber;
    if (!routeId || !axles) return;
    setLoading(true);
    setError(null);
    try {
      const fullRoute = await routesApi.get(routeId);
      setRouteDetails(fullRoute);
    } catch (err) {
      console.warn("No se pudo obtener la ruta completa, usando datos locales", err);
      setRouteDetails(selectedRoute);
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

  const calculateTollsTotal = () => {
    if (!routeDetails?.tollbooths) return 0;
    const axles = selectedUnit?.axles || selectedUnit?.axesNumber || 2;
    return routeDetails.tollbooths.reduce((sum, tb) => {
      let cost = 0;
      if (axles <= 2) cost = tb.cost2Axles;
      else if (axles === 3) cost = tb.cost3Axles;
      else if (axles === 4) cost = tb.cost4Axles;
      else if (axles === 5) cost = tb.cost5Axles;
      else if (axles === 6) cost = tb.cost6Axles;
      else cost = tb.cost7PlusAxles;
      return sum + (cost || 0);
    }, 0);
  };

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    try {
      const tollsTotal = calculateTollsTotal();
      const payload = {
        routeId,
        unitId,
        operatorId,
        scheduledDate,
        estimatedTollboothCost: tollsTotal,
        estimatedFuelCost: Number(fuelCostEst) || 0,
        estimatedExtrasCost: Number(adHocExtras) || 0,
      };

      const newTrip = await tripsApi.create(payload);
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
        if (!routeDetails) return <Typography>No se pudo cargar el detalle de la ruta.</Typography>;

        const tollsTotalDisplay = calculateTollsTotal();
        const tollboothsCountDisplay = routeDetails?.tollbooths?.length || 0;

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
                <Typography color="text.secondary">Casetas ({tollboothsCountDisplay})</Typography>
                <Typography>${tollsTotalDisplay.toLocaleString('es-MX')}</Typography>
              </Stack>
              {routeDetails?.tollbooths?.length > 0 && (
                <Box sx={{ pl: 2, mb: 1 }}>
                  {routeDetails.tollbooths.map((tb, idx) => {
                    const axles = selectedUnit?.axles || selectedUnit?.axesNumber || 2;
                    let cost = 0;
                    if (axles <= 2) cost = tb.cost2Axles;
                    else if (axles === 3) cost = tb.cost3Axles;
                    else if (axles === 4) cost = tb.cost4Axles;
                    else if (axles === 5) cost = tb.cost5Axles;
                    else if (axles === 6) cost = tb.cost6Axles;
                    else cost = tb.cost7PlusAxles;

                    cost = cost || 0;

                    return (
                      <Stack key={tb.id || idx}
                        direction="row"
                        justifyContent="space-between">
                        <Typography variant="body2"
                          color="text.secondary">
                          • {tb.name || `Caseta ${idx + 1}`}
                        </Typography>
                        <Typography variant="body2"
                          color="text.secondary">
                          ${cost.toLocaleString('es-MX')}
                        </Typography>
                      </Stack>
                    );
                  })}
                </Box>
              )}
              <Stack direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1 }}>
                <Typography variant="subtitle2">Precio Diesel/L</Typography>
                <TextField
                  size="small"
                  type="number"
                  value={dieselPrice}
                  onChange={(e) => setDieselPrice(e.target.value)}
                  sx={{ width: 120 }}
                  hiddenLabel
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                  }}
                  inputProps={{
                    sx: { py: 1, textAlign: 'right' }
                  }}
                />
              </Stack>

              {/* {fuelCostEst > 0 && ( */}
              <Box sx={{
                pl: 2,
                pr: 1,
                py: 1.5,
                mb: 2,
                bgcolor: 'action.hover',
                borderRadius: 1,
                borderLeft: '4px solid',
                borderColor: 'primary.main'
              }}>
                <Stack direction="row"
                  justifyContent="space-between"
                  alignItems="center">
                  <Box>
                    <Typography variant="caption"
                      color="text.secondary"
                      fontWeight="bold"
                      display="block">
                      Información de Consumo:
                    </Typography>
                    <Typography variant="caption"
                      color="text.secondary"
                      display="block">
                      Distancia: {routeDetails?.distanceKm || selectedRoute?.distanceKm || 0} km
                    </Typography>
                    <Typography variant="caption"
                      color="text.secondary"
                      display="block">
                      Rendimiento: {selectedUnit?.fuelEfficiency || 0} km/L
                    </Typography>
                    <Typography variant="caption"
                      color="primary.main"
                      fontWeight="medium">
                      Lts. Calculados: {((routeDetails?.distanceKm || selectedRoute?.distanceKm || 0) / (parseFloat(selectedUnit?.fuelEfficiency) || 1)).toFixed(2)} L
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption"
                      color="text.secondary"
                      display="block">
                      Gasto Estimado
                    </Typography>
                    <Typography variant="subtitle1"
                      color="primary.main"
                      fontWeight="bold">
                      ${Number(fuelCostEst).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
              {/* )} */}
              <Divider sx={{ my: 1 }} />
              <Stack direction="row"
                justifyContent="space-between"
                alignItems="center">
                <Typography variant="subtitle2">Extras</Typography>
                <TextField
                  size="small"
                  type="number"
                  value={adHocExtras}
                  onChange={(e) => setAdHocExtras(e.target.value)}
                  sx={{ width: 120 }}
                  hiddenLabel
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                  }}
                  inputProps={{
                    sx: { py: 1, textAlign: 'right' } // py: 1 ensures vertical center, textAlign right is standard for currency
                  }}
                />
              </Stack>
            </Paper>
          </Stack>
        );
      case 2:
        const total = calculateTollsTotal() + (Number(fuelCostEst) || 0) + (Number(adHocExtras) || 0);
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
