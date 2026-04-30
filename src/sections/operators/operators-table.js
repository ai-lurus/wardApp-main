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
  en_viaje: { label: 'En Viaje', color: 'warning' },
  no_disponible: { label: 'No Disponible', color: 'error' },
  inactivo: { label: 'Inactivo', color: 'default' },
};

export const OperatorsTable = (props) => {
  const {
    count = 0,
    items = [],
    onPageChange = () => { },
    onRowsPerPageChange,
    page = 0,
    rowsPerPage = 0,
    onEdit,
    onViewDetail,
    onStatusChange,
    onDelete,
  } = props;

  return (
    <Card>
      <Scrollbar>
        <Box sx={{ minWidth: 1000 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Licencia</TableCell>
                <TableCell>Tipo Lic.</TableCell>
                <TableCell>Vigencia Lic.</TableCell>
                <TableCell>Contacto</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography variant="subtitle1" color="text.secondary">
                      No hay operadores.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((operator) => {
                  const conf = statusConfig[operator.status] || statusConfig.disponible;

                  return (
                    <TableRow hover key={operator.id}>
                      <TableCell>
                        <Typography variant="subtitle2">{operator.name}</Typography>
                      </TableCell>
                      <TableCell>{operator.licenseNumber || '—'}</TableCell>
                      <TableCell>{operator.licenseType || '—'}</TableCell>
                      <TableCell>
                        {operator.licenseExpiry
                          ? format(new Date(operator.licenseExpiry), 'dd/MM/yyyy')
                          : '—'}
                      </TableCell>
                      <TableCell>
                        {operator.phone && <Typography variant="body2">{operator.phone}</Typography>}
                        {operator.email && <Typography variant="caption" color="text.secondary">{operator.email}</Typography>}
                        {!operator.phone && !operator.email && '—'}
                      </TableCell>
                      <TableCell>
                        {operator.status === 'en_viaje' ? (
                          <Chip label={conf.label} color={conf.color} size="small" />
                        ) : (
                          <TextField
                            select
                            name={`status-${operator.id}`}
                            size="small"
                            value={operator.status || 'disponible'}
                            onChange={(e) => onStatusChange(operator.id, e.target.value)}
                            sx={{ minWidth: 140 }}
                            InputProps={{ sx: { fontSize: 14 } }}
                            SelectProps={{ inputProps: { id: `status-select-${operator.id}`, name: `status-select-${operator.id}` } }}
                          >
                            <MenuItem value="disponible">Disponible</MenuItem>
                            <MenuItem value="no_disponible">No Disponible</MenuItem>
                            <MenuItem value="inactivo">Inactivo</MenuItem>
                          </TextField>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button
                            size="small"
                            variant="outlined"
                            color="info"
                            onClick={() => onViewDetail(operator)}
                          >
                            Detalle
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => onEdit(operator)}
                          >
                            Editar
                          </Button>
                          {operator.status !== 'inactivo' && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => onDelete(operator.id)}
                            >
                              Eliminar
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
      {count > 0 && (
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
      )}
    </Card>
  );
};

OperatorsTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
  onEdit: PropTypes.func,
  onViewDetail: PropTypes.func,
  onStatusChange: PropTypes.func,
  onDelete: PropTypes.func,
};
