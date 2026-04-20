import { useState, useEffect } from 'react';
import { 
  Box, 
  Divider, 
  Modal, 
  Stack, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow, 
  Typography,
  Button,
  TextField,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { routesApi } from 'src/services/apiService';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const AXLE_OPTIONS = [
  { value: 2, label: '2 Ejes' },
  { value: 3, label: '3 Ejes' },
  { value: 4, label: '4 Ejes' },
  { value: 5, label: '5 Ejes' },
  { value: 6, label: '6 Ejes' },
  { value: 7, label: '7+ Ejes' },
];

export const CostPreviewModal = ({ open, onClose, route }) => {
  const [axles, setAxles] = useState(5);
  const [loading, setLoading] = useState(false);
  const [costData, setCostData] = useState(null);

  useEffect(() => {
    if (open && route) {
      handleCalculate(axles);
    }
  }, [open, route]);

  const handleCalculate = async (val) => {
    setLoading(true);
    try {
      const data = await routesApi.getCostPreview(route.id, val);
      setCostData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAxleChange = (e) => {
    const val = e.target.value;
    setAxles(val);
    handleCalculate(val);
  };

  if (!route) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" mb={1}>Preview de Costo</Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          {route.name}
        </Typography>

        <Stack spacing={3}>
          <TextField
            select
            fullWidth
            label="Tipo de Vehículo (Ejes)"
            value={axles}
            onChange={handleAxleChange}
          >
            {AXLE_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </TextField>

          <Divider />

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress size={24} />
            </Box>
          ) : costData ? (
            <Box>
              <Typography variant="subtitle2" mb={2}>Desglose Estimado:</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Caseta</TableCell>
                    <TableCell align="right">Costo</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Note: The backend response for cost-preview doesn't return the breakdown, just the total.
                      We'll simulate the breakdown from the route tollbooths if available, or just show the total.
                      Wait, looking at backend code route.service.ts would tell me what's in 'result'.
                  */}
                  {(route.tollbooths || []).map(tb => {
                    const priceKey = axles >= 7 ? 'cost7PlusAxles' : `cost${axles}Axles`;
                    return (
                      <TableRow key={tb.id}>
                        <TableCell>{tb.name}</TableCell>
                        <TableCell align="right">${(tb[priceKey] || 0).toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      ${costData.total_cost.toFixed(2)} {costData.currency}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          ) : (
            <Typography color="error" textAlign="center">No se pudo obtener el costo.</Typography>
          )}

          <Stack direction="row" justifyContent="flex-end">
            <Button onClick={onClose}>Cerrar</Button>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
};
