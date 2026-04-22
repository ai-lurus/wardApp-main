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
import ArrowPathIcon from '@heroicons/react/24/solid/ArrowPathIcon';

export const TollboothsTable = (props) => {
  const {
    count = 0,
    items = [],
    onEdit,
    onDelete,
    onActivate,
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
                <TableCell align="right">2 Ejes</TableCell>
                <TableCell align="right">3 Ejes</TableCell>
                <TableCell align="right">4 Ejes</TableCell>
                <TableCell align="right">5 Ejes</TableCell>
                <TableCell align="right">6 Ejes</TableCell>
                <TableCell align="right">7+ Ejes</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((tb) => (
                <TableRow hover key={tb.id}>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {tb.name}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">${tb.cost2Axles?.toFixed(2)}</TableCell>
                  <TableCell align="right">${tb.cost3Axles?.toFixed(2)}</TableCell>
                  <TableCell align="right">${tb.cost4Axles?.toFixed(2)}</TableCell>
                  <TableCell align="right">${tb.cost5Axles?.toFixed(2)}</TableCell>
                  <TableCell align="right">${tb.cost6Axles?.toFixed(2)}</TableCell>
                  <TableCell align="right">${tb.cost7PlusAxles?.toFixed(2)}</TableCell>
                  <TableCell>
                    {tb.active ? (
                      <Typography color="success.main" variant="caption">Activa</Typography>
                    ) : (
                      <Typography color="error.main" variant="caption">Inactiva</Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="Editar">
                        <IconButton onClick={() => onEdit(tb)}>
                          <SvgIcon fontSize="small"><PencilIcon /></SvgIcon>
                        </IconButton>
                      </Tooltip>
                      {tb.active ? (
                        <Tooltip title="Desactivar">
                          <IconButton onClick={() => onDelete(tb.id)} color="error">
                            <SvgIcon fontSize="small"><TrashIcon /></SvgIcon>
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Reactivar">
                          <IconButton onClick={() => onActivate(tb.id)} color="success">
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

TollboothsTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onActivate: PropTypes.func,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number
};
