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
  Button
} from '@mui/material';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 900,
  maxWidth: '95vw',
  maxHeight: '90vh',
  overflowY: 'auto',
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

export const RouteDetails = ({ open, onClose, route }) => {
  if (!route) return null;

  const sortedTollbooths = [...(route.tollbooths || [])].sort((a, b) => a.order - b.order);

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h5" mb={1}>{route.name}</Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          {route.origin} → {route.destination} ({route.distanceKm} km)
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Typography variant="h6" mb={2}>Desglose de Casetas</Typography>
        
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Orden</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell align="right">2 Ejes</TableCell>
              <TableCell align="right">3 Ejes</TableCell>
              <TableCell align="right">4 Ejes</TableCell>
              <TableCell align="right">5 Ejes</TableCell>
              <TableCell align="right">6 Ejes</TableCell>
              <TableCell align="right">7+ Ejes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedTollbooths.map((tb) => (
              <TableRow key={tb.id}>
                <TableCell>{tb.order}</TableCell>
                <TableCell>{tb.name}</TableCell>
                <TableCell align="right">${tb.cost2Axles?.toFixed(2)}</TableCell>
                <TableCell align="right">${tb.cost3Axles?.toFixed(2)}</TableCell>
                <TableCell align="right">${tb.cost4Axles?.toFixed(2)}</TableCell>
                <TableCell align="right">${tb.cost5Axles?.toFixed(2)}</TableCell>
                <TableCell align="right">${tb.cost6Axles?.toFixed(2)}</TableCell>
                <TableCell align="right">${tb.cost7PlusAxles?.toFixed(2)}</TableCell>
              </TableRow>
            ))}
            {sortedTollbooths.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">No hay casetas registradas</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Stack direction="row" justifyContent="flex-end" mt={4}>
          <Button onClick={onClose} variant="contained">Cerrar</Button>
        </Stack>
      </Box>
    </Modal>
  );
};
