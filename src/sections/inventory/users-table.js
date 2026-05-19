import PropTypes from 'prop-types';
import {
  Box,
  IconButton,
  Tooltip,
  SvgIcon,
  Card,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';
import PencilIcon from '@heroicons/react/24/solid/PencilIcon';
import TrashIcon from '@heroicons/react/24/solid/TrashIcon';
import ArrowPathIcon from '@heroicons/react/24/solid/ArrowPathIcon';

const roleLabels = {
  admin: { label: 'Admin', color: 'primary' },
  almacenista: { label: 'Almacenista', color: 'default' },
};

export const UsersTable = (props) => {
  const {
    count = 0,
    items = [],
    onPageChange = () => { },
    onRowsPerPageChange,
    page = 0,
    rowsPerPage = 0,
    onEdit,
    onToggleStatus,
    currentUserId,
  } = props;

  return (
    <Card>
      <Scrollbar>
        <Box sx={{ minWidth: 700 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Correo</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Alta</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((user) => {
                const roleInfo = roleLabels[user.role] || { label: user.role, color: 'default' };
                return (
                  <TableRow hover
                    key={user.id}>
                    <TableCell>
                      <Typography variant="subtitle2">{user.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2"
                        color="text.secondary">
                        {user.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={roleInfo.label}
                        color={roleInfo.color}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.active ? 'Activo' : 'Inactivo'}
                        color={user.active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2"
                        color="text.secondary">
                        {new Date(user.createdAt).toLocaleDateString('es-MX')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row"
                        spacing={1}>
                        <Tooltip title="Editar">
                          <IconButton onClick={() => onEdit(user)}>
                            <SvgIcon fontSize="small">
                              <PencilIcon />
                            </SvgIcon>
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={user.id === currentUserId ? 'No puedes desactivar tu propia cuenta' : (user.active ? 'Desactivar' : 'Activar')}>
                          <span>
                            <IconButton
                              color={user.active ? 'error' : 'success'}
                              onClick={() => onToggleStatus(user)}
                              disabled={user.id === currentUserId}
                            >
                              <SvgIcon fontSize="small">
                                {user.active ? <TrashIcon /> : <ArrowPathIcon />}
                              </SvgIcon>
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
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

UsersTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
  onEdit: PropTypes.func,
  onToggleStatus: PropTypes.func,
  currentUserId: PropTypes.string,
};
