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
  MenuItem
} from '@mui/material';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  maxHeight: '90vh',
  overflowY: 'auto',
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
  const [axles, setAxles] = useState(2);

  useEffect(() => {
    if (open) {
      setAxles(2);
    }
  }, [open]);

  if (!route) return null;

  const sortedTollbooths = [...(route.tollbooths || [])].sort((a, b) => a.order - b.order);

  // Calculate total cost on the fly from the already fetched detailed data
  const calculateTotal = () => {
    const priceKey = axles >= 7 ? 'cost7PlusAxles' : `cost${axles}Axles`;
    return sortedTollbooths.reduce((sum, tb) => sum + (tb[priceKey] || 0), 0);
  };

  const totalCost = calculateTotal();

  return (
    <Modal open={open}
      onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6"
          mb={1}>Simulador de Costos</Typography>
        <Typography variant="body2"
          color="text.secondary"
          mb={3}>
          Ruta: {route.name}
        </Typography>

        <Stack spacing={3}>
          <TextField
            select
            fullWidth
            label="Tipo de Vehículo"
            value={axles}
            onChange={(e) => setAxles(e.target.value)}
            helperText="Selecciona el número de ejes para ver el desglose"
          >
            {AXLE_OPTIONS.map((opt) => (
              <MenuItem key={opt.value}
                value={opt.value}>{opt.label}</MenuItem>
            ))}
          </TextField>

          <Divider />

          <Box>
            <Typography variant="subtitle2"
              mb={2}>Desglose por Caseta ({axles} ejes):</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Caseta</TableCell>
                  <TableCell align="right">Costo Unitario</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedTollbooths.map((tb) => {
                  const priceKey = axles >= 7 ? 'cost7PlusAxles' : `cost${axles}Axles`;
                  const price = tb[priceKey] || 0;

                  return (
                    <TableRow key={tb.id}>
                      <TableCell>{tb.name}</TableCell>
                      <TableCell align="right">${price.toFixed(2)}</TableCell>
                    </TableRow>
                  );
                })}

                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', pt: 2 }}>TOTAL ESTIMADO</TableCell>
                  <TableCell align="right"
                    sx={{ fontWeight: 'bold', pt: 2, color: 'primary.main' }}>
                    ${totalCost.toFixed(2)} MXN
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <Typography variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 2 }}>
              * Los costos son informativos y calculados en base a los precios actuales de las casetas registradas.
            </Typography>
          </Box>

          <Stack direction="row"
            justifyContent="flex-end"
            mt={1}>
            <Button onClick={onClose}
              variant="outlined">Cerrar</Button>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
};
