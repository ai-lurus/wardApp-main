import {
  Avatar,
  Box,
  Chip,
  IconButton,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import PencilIcon from '@heroicons/react/24/solid/PencilIcon';
import UserPlusIcon from '@heroicons/react/24/solid/UserPlusIcon';
import PropTypes from 'prop-types';
import { Scrollbar } from 'src/components/scrollbar';

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

export const TenantsTable = ({ items = [], onEdit, onManageUsers }) => (
  <Scrollbar>
    <Box sx={{ minWidth: 600 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Empresa</TableCell>
            <TableCell>Slug</TableCell>
            <TableCell>Usuarios</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell align="right">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((company) => (
            <TableRow hover key={company.id}>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: 13 }}>
                    {getInitials(company.name)}
                  </Avatar>
                  <Typography variant="subtitle2">{company.name}</Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {company.slug}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{company.userCount ?? 0}</Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={company.active ? 'Activo' : 'Inactivo'}
                  color={company.active ? 'success' : 'default'}
                  size="small"
                />
              </TableCell>
              <TableCell align="right">
                <Tooltip title="Editar empresa">
                  <IconButton size="small" onClick={() => onEdit(company)}>
                    <SvgIcon fontSize="small"><PencilIcon /></SvgIcon>
                  </IconButton>
                </Tooltip>
                <Tooltip title="Gestionar usuarios">
                  <IconButton size="small" onClick={() => onManageUsers(company)}>
                    <SvgIcon fontSize="small"><UserPlusIcon /></SvgIcon>
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  </Scrollbar>
);

TenantsTable.propTypes = {
  items: PropTypes.array,
  onEdit: PropTypes.func,
  onManageUsers: PropTypes.func,
};
