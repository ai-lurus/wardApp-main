import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Card,
  Chip,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';
import format from 'date-fns/format';

const statusConfig = {
  disponible: { label: 'Disponible', color: 'success' },
  mantenimiento: { label: 'Mantenimiento', color: 'warning' },
  en_viaje: { label: 'En Viaje', color: 'info' },
  inactivo: { label: 'Inactivo', color: 'default' },
};

export const UnitsTable = (props) => {
  const {
    count = 0,
    items = [],
    onPageChange = () => { },
    onRowsPerPageChange,
    page = 0,
    rowsPerPage = 0,
    onEdit,
    onStatusChange,
  } = props;

  return (
    <Card>
      <Scrollbar>
        <Box sx={{ minWidth: 1000 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Matrícula</TableCell>
                <TableCell>Marca</TableCell>
                <TableCell>Modelo</TableCell>
                <TableCell>Año</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Ejes</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Vencimiento Seguro</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                    <Typography variant="subtitle1" color="text.secondary">
                      No hay unidades.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((unit) => {
                  const conf = statusConfig[unit.status] || statusConfig.disponible;

                  return (
                    <TableRow hover key={unit.id}>
                      <TableCell>
                        <Typography variant="subtitle2">{unit.matricula}</Typography>
                        {unit.vin && (
                          <Typography variant="caption" color="text.secondary">
                            VIN: {unit.vin}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{unit.marca || '—'}</TableCell>
                      <TableCell>{unit.modelo || '—'}</TableCell>
                      <TableCell>{unit.year || '—'}</TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>
                        {unit.type ? unit.type.replace('_', ' ') : '—'}
                      </TableCell>
                      <TableCell>{unit.axesNumber || '—'}</TableCell>
                      <TableCell>
                        {unit.status === 'en_viaje' ? (
                          <Chip label={conf.label} color={conf.color} size="small" />
                        ) : (
                          <TextField
                            select
                            name={`status-${unit.id}`}
                            size="small"
                            value={unit.status || 'disponible'}
                            onChange={(e) => onStatusChange(unit.id, e.target.value)}
                            sx={{ minWidth: 140 }}
                            InputProps={{ sx: { fontSize: 14 } }}
                            SelectProps={{ inputProps: { id: `status-select-${unit.id}`, name: `status-select-${unit.id}` } }}
                          >
                            <MenuItem value="disponible">Disponible</MenuItem>
                            <MenuItem value="mantenimiento">Mantenimiento</MenuItem>
                            <MenuItem value="inactivo">Inactivo</MenuItem>
                          </TextField>
                        )}
                      </TableCell>
                      <TableCell>
                        {unit.insuranceExpiration
                          ? format(new Date(unit.insuranceExpiration), 'dd/MM/yyyy')
                          : '—'}
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => onEdit(unit)}
                          >
                            Editar
                          </Button>
                          {unit.status !== 'inactivo' && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="warning"
                              onClick={() => onStatusChange(unit.id, 'inactivo')}
                            >
                              Desactivar
                            </Button>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Box>
      </Scrollbar>
      <TablePagination
        SelectProps={{ inputProps: { 'aria-label': 'Rows per page', id: 'rows-per-page-select', name: 'rowsPerPage' } }}
        component="div"
        count={count}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Card>
  );
};

UnitsTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
  onEdit: PropTypes.func,
  onStatusChange: PropTypes.func,
};
