import { Box, Card, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, Typography, Chip, Tooltip, IconButton } from '@mui/material';
import { format } from 'date-fns';
import EyeIcon from '@heroicons/react/24/solid/EyeIcon';

const statusMap = {
  programado: { color: 'info', label: 'Programado' },
  en_curso: { color: 'warning', label: 'En Curso' },
  completado: { color: 'success', label: 'Completado' },
  cancelado: { color: 'error', label: 'Cancelado' }
};

export const TripsTable = (props) => {
  const {
    count = 0,
    items = [],
    onPageChange = () => {},
    onRowsPerPageChange,
    page = 0,
    rowsPerPage = 0,
    onViewDetail
  } = props;

  return (
    <Card>
      <Box sx={{ minWidth: 800, overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Ruta</TableCell>
              <TableCell>Unidad</TableCell>
              <TableCell>Operador</TableCell>
              <TableCell>Costo Estimado</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((trip) => {
              const status = statusMap[trip.status] || { color: 'default', label: trip.status };
              const totalCost = trip.estimatedCost?.total || 0;

              return (
                <TableRow hover key={trip.id}>
                  <TableCell>
                    {format(new Date(trip.scheduledDate || trip.createdAt), 'dd/MM/yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    {trip.route?.name}
                    <Typography variant="body2" color="text.secondary">
                      {trip.route?.origin} → {trip.route?.destination}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {trip.unit?.plate || trip.unit?.matricula}
                  </TableCell>
                  <TableCell>
                    {trip.operator?.name || 'No asignado'}
                  </TableCell>
                  <TableCell>
                    ${totalCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Chip label={status.label} color={status.color} size="small" />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Ver Detalle">
                      <IconButton onClick={() => onViewDetail(trip)}>
                        <EyeIcon width={20} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
      <TablePagination
        component="div"
        count={count}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage="Filas por página"
      />
    </Card>
  );
};
