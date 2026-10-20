import PropTypes from 'prop-types';
import {
  Box,
  Card,
  IconButton,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import EyeIcon from '@heroicons/react/24/solid/EyeIcon';
import PencilIcon from '@heroicons/react/24/solid/PencilIcon';
import TrashIcon from '@heroicons/react/24/solid/TrashIcon';
import { Scrollbar } from 'src/components/scrollbar';
import { formatCurrency } from 'src/utils/format-currency';

export const CustomersTable = (props) => {
  const {
    count = 0,
    items = [],
    onPageChange = () => { },
    onRowsPerPageChange,
    page = 0,
    rowsPerPage = 0,
    onViewDetail,
    onEdit,
    onDelete,
    canEdit = false,
  } = props;

  return (
    <Card>
      <Scrollbar>
        <Box sx={{ minWidth: 900 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell>Correo</TableCell>
                <TableCell align="right">Viajes</TableCell>
                <TableCell align="right">Ingresos</TableCell>
                <TableCell align="right">Utilidad</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}
                    align="center"
                    sx={{ py: 3 }}>
                    <Typography variant="subtitle1"
                      color="text.secondary">
                      No hay clientes registrados.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((customer) => (
                  <TableRow hover
                    key={customer.id}>
                    <TableCell>
                      <Typography variant="subtitle2">{customer.name}</Typography>
                    </TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customer.email || '—'}</TableCell>
                    <TableCell align="right">{customer.stats.tripCount}</TableCell>
                    <TableCell align="right">{formatCurrency(customer.stats.revenue)}</TableCell>
                    <TableCell align="right">
                      <Typography variant="body2"
                        color={customer.stats.profit < 0 ? 'error.main' : 'success.main'}>
                        {formatCurrency(customer.stats.profit)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Ver detalle">
                        <IconButton onClick={() => onViewDetail(customer)}>
                          <SvgIcon fontSize="small"><EyeIcon /></SvgIcon>
                        </IconButton>
                      </Tooltip>
                      {canEdit && (
                        <>
                          <Tooltip title="Editar">
                            <IconButton onClick={() => onEdit(customer)}>
                              <SvgIcon fontSize="small"><PencilIcon /></SvgIcon>
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton color="error"
                              onClick={() => onDelete(customer)}>
                              <SvgIcon fontSize="small"><TrashIcon /></SvgIcon>
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Box>
      </Scrollbar>
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

CustomersTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
  onViewDetail: PropTypes.func.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  canEdit: PropTypes.bool,
};
