import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Modal,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { adminApi } from 'src/services/apiService';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 560,
  maxHeight: '90vh',
  overflowY: 'auto',
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: 1,
  p: 3,
};

const roleLabel = { admin: 'Admin', almacenista: 'Almacenista', operator: 'Operador' };

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

const addUserSchema = Yup.object({
  name: Yup.string().required('Requerido'),
  email: Yup.string().email('Email inválido').required('Requerido'),
  password: Yup.string().min(8, 'Mínimo 8 caracteres').required('Requerido'),
  role: Yup.string().oneOf(['admin', 'operator']).required('Requerido'),
});

export const TenantUsersModal = ({ open, onClose, company }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const loadUsers = () => {
    if (!company) return;
    setLoading(true);
    adminApi.listCompanyUsers(company.id)
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (open && company) {
      loadUsers();
      setShowForm(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, company]);

  const formik = useFormik({
    initialValues: { name: '', email: '', password: '', role: 'admin' },
    validationSchema: addUserSchema,
    onSubmit: async (values, helpers) => {
      try {
        await adminApi.createCompanyUser(company.id, values);
        helpers.resetForm();
        setShowForm(false);
        loadUsers();
      } catch (err) {
        helpers.setStatus(err.response?.data?.message ?? 'Error al crear usuario');
      }
    },
  });

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" mb={0.5}>
          Usuarios — {company?.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          {company?.slug}
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {loading ? (
          <Typography variant="body2" color="text.secondary">Cargando...</Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Usuario</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 28, height: 28, fontSize: 11, bgcolor: 'primary.main' }}>
                        {getInitials(u.name)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{u.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{u.email}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{roleLabel[u.role] ?? u.role}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={u.active ? 'Activo' : 'Inactivo'}
                      color={u.active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Typography variant="body2" color="text.secondary" py={1}>
                      Sin usuarios
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

        <Box mt={2}>
          {!showForm ? (
            <Button size="small" variant="outlined" onClick={() => setShowForm(true)}>
              + Agregar usuario
            </Button>
          ) : (
            <Box mt={1}>
              <Divider sx={{ mb: 2 }}>Nuevo usuario</Divider>
              <form onSubmit={formik.handleSubmit}>
                <Stack spacing={1.5}>
                  {formik.status && <Alert severity="error">{formik.status}</Alert>}
                  <TextField
                    fullWidth size="small" label="Nombre" name="name"
                    value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur}
                    error={formik.touched.name && !!formik.errors.name}
                    helperText={formik.touched.name && formik.errors.name}
                  />
                  <TextField
                    fullWidth size="small" label="Email" name="email" type="email"
                    value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur}
                    error={formik.touched.email && !!formik.errors.email}
                    helperText={formik.touched.email && formik.errors.email}
                  />
                  <TextField
                    fullWidth size="small" label="Contraseña" name="password" type="password"
                    value={formik.values.password} onChange={formik.handleChange} onBlur={formik.handleBlur}
                    error={formik.touched.password && !!formik.errors.password}
                    helperText={formik.touched.password && formik.errors.password}
                  />
                  <TextField
                    fullWidth size="small" label="Rol" name="role"
                    select SelectProps={{ native: true }}
                    value={formik.values.role} onChange={formik.handleChange}
                  >
                    <option value="admin">Admin</option>
                    <option value="operator">Operador</option>
                  </TextField>
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button size="small" onClick={() => { setShowForm(false); formik.resetForm(); }} color="inherit">
                      Cancelar
                    </Button>
                    <Button size="small" type="submit" variant="contained" disabled={formik.isSubmitting}>
                      Crear
                    </Button>
                  </Stack>
                </Stack>
              </form>
            </Box>
          )}
        </Box>

        <Stack direction="row" justifyContent="flex-end" mt={2}>
          <Button onClick={onClose} color="inherit">Cerrar</Button>
        </Stack>
      </Box>
    </Modal>
  );
};

TenantUsersModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  company: PropTypes.object,
};
