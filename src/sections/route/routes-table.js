import PropTypes from 'prop-types';
import {
  Box,
  Card,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
  SvgIcon
} from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';
import PencilIcon from '@heroicons/react/24/solid/PencilIcon';
import TrashIcon from '@heroicons/react/24/solid/TrashIcon';
import EyeIcon from '@heroicons/react/24/solid/EyeIcon';
import BanknotesIcon from '@heroicons/react/24/solid/BanknotesIcon';
import ArrowPathIcon from '@heroicons/react/24/solid/ArrowPathIcon';

const formatDuration = (minutes) => {
  if (!minutes) return '0m';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  return `${mins}m`;
};

export const RoutesTable = (props) => {
  const {
    count = 0,
    items = [],
    onEdit,
    onDelete,
    onActivate,
    onViewDetail,
    onPreviewCost,
    onPageChange = () => {},
    onRowsPerPageChange,
    page = 0,
    rowsPerPage = 0,
  } = props;

  return (
    <Card>
      <Scrollbar>
        <Box sx={{ minWidth: 800 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Origen</TableCell>
                <TableCell>Destino</TableCell>
                <TableCell>Distancia</TableCell>
                <TableCell>Duración</TableCell>
                <TableCell>Casetas</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((route) => (
                <TableRow hover key={route.id}>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {route.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{route.origin}</TableCell>
                  <TableCell>{route.destination}</TableCell>
                  <TableCell>{route.distanceKm} km</TableCell>
                  <TableCell>{formatDuration(route.estimatedDurationMin)}</TableCell>
                  <TableCell>{route.tollbooths?.length || 0}</TableCell>
                  <TableCell>
                    {route.active ? (
                      <Typography color="success.main" variant="caption">Activa</Typography>
                    ) : (
                      <Typography color="error.main" variant="caption">Inactiva</Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="Preview de Costo">
                        <IconButton onClick={() => onPreviewCost(route)}>
                          <SvgIcon fontSize="small"><BanknotesIcon /></SvgIcon>
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Ver Detalles">
                        <IconButton onClick={() => onViewDetail(route)}>
                          <SvgIcon fontSize="small"><EyeIcon /></SvgIcon>
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton onClick={() => onEdit(route)}>
                          <SvgIcon fontSize="small"><PencilIcon /></SvgIcon>
                        </IconButton>
                      </Tooltip>
                      {route.active ? (
                        <Tooltip title="Desactivar">
                          <IconButton onClick={() => onDelete(route.id)} color="error">
                            <SvgIcon fontSize="small"><TrashIcon /></SvgIcon>
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Reactivar">
                          <IconButton onClick={() => onActivate(route.id)} color="success">
                            <SvgIcon fontSize="small"><ArrowPathIcon /></SvgIcon>
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
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
      />
    </Card>
  );
};

RoutesTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onActivate: PropTypes.func,
  onViewDetail: PropTypes.func,
  onPreviewCost: PropTypes.func,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number
};
