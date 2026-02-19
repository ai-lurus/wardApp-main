import {
  Box,
  Button,
  MenuItem,
  Modal,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 480,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const roles = [
  { value: 'almacenista', label: 'Almacenista' },
  { value: 'admin', label: 'Admin' },
];

export const UserModal = ({ open, onClose, onSave, user }) => {
  const isEdit = Boolean(user);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      role: user?.role || 'almacenista',
      password: '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Campo requerido'),
      email: Yup.string().email('Correo inválido').required('Campo requerido'),
      role: Yup.string().required('Campo requerido'),
      password: isEdit
        ? Yup.string().min(6, 'Mínimo 6 caracteres')
        : Yup.string().min(6, 'Mínimo 6 caracteres').required('Campo requerido'),
    }),
    onSubmit: (values) => {
      const payload = { name: values.name, email: values.email, role: values.role };
      if (values.password) payload.password = values.password;
      onSave(payload);
      formik.resetForm();
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" mb={3}>
          {isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Nombre"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
            <TextField
              fullWidth
              label="Correo electrónico"
              name="email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
            <TextField
              fullWidth
              select
              label="Rol"
              name="role"
              value={formik.values.role}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.role && Boolean(formik.errors.role)}
              helperText={formik.touched.role && formik.errors.role}
            >
              {roles.map((r) => (
                <MenuItem key={r.value} value={r.value}>
                  {r.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label={isEdit ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
              name="password"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
            />
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button onClick={handleClose}>Cancelar</Button>
              <Button type="submit" variant="contained">
                Guardar
              </Button>
            </Stack>
          </Stack>
        </form>
      </Box>
    </Modal>
  );
};
