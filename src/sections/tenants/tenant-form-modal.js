import {
  Alert,
  Box,
  Button,
  Divider,
  Modal,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { adminApi } from 'src/services/apiService';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 480,
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: 1,
  p: 3,
};

const createSchema = Yup.object({
  name: Yup.string().required('Requerido'),
  slug: Yup.string()
    .matches(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones')
    .required('Requerido'),
  adminEmail: Yup.string().email('Email inválido').required('Requerido'),
  adminName: Yup.string().required('Requerido'),
  adminPassword: Yup.string().min(8, 'Mínimo 8 caracteres').required('Requerido'),
});

const editSchema = Yup.object({
  name: Yup.string().required('Requerido'),
  slug: Yup.string()
    .matches(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones')
    .required('Requerido'),
  active: Yup.boolean(),
});

export const TenantFormModal = ({ open, onClose, onSaved, company }) => {
  const isEdit = !!company;

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: isEdit
      ? { name: company.name, slug: company.slug, active: company.active }
      : { name: '', slug: '', adminEmail: '', adminName: '', adminPassword: '' },
    validationSchema: isEdit ? editSchema : createSchema,
    onSubmit: async (values, helpers) => {
      try {
        if (isEdit) {
          await adminApi.updateCompany(company.id, values);
        } else {
          await adminApi.createCompany(values);
        }
        onSaved();
        onClose();
      } catch (err) {
        helpers.setStatus(err.response?.data?.message ?? 'Error al guardar');
      }
    },
  });

  const autoSlug = (name) =>
    name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" mb={2}>
          {isEdit ? 'Editar empresa' : 'Nueva empresa'}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={2}>
            {formik.status && <Alert severity="error">{formik.status}</Alert>}
            <TextField
              fullWidth
              label="Nombre"
              name="name"
              value={formik.values.name}
              onChange={(e) => {
                formik.handleChange(e);
                if (!isEdit && !formik.touched.slug) {
                  formik.setFieldValue('slug', autoSlug(e.target.value));
                }
              }}
              onBlur={formik.handleBlur}
              error={formik.touched.name && !!formik.errors.name}
              helperText={formik.touched.name && formik.errors.name}
            />
            <TextField
              fullWidth
              label="Slug"
              name="slug"
              value={formik.values.slug}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.slug && !!formik.errors.slug}
              helperText={formik.touched.slug && formik.errors.slug}
            />
            {!isEdit && (
              <>
                <Divider>Admin inicial</Divider>
                <TextField
                  fullWidth
                  label="Email del admin"
                  name="adminEmail"
                  type="email"
                  value={formik.values.adminEmail}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.adminEmail && !!formik.errors.adminEmail}
                  helperText={formik.touched.adminEmail && formik.errors.adminEmail}
                />
                <TextField
                  fullWidth
                  label="Nombre del admin"
                  name="adminName"
                  value={formik.values.adminName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.adminName && !!formik.errors.adminName}
                  helperText={formik.touched.adminName && formik.errors.adminName}
                />
                <TextField
                  fullWidth
                  label="Contraseña del admin"
                  name="adminPassword"
                  type="password"
                  value={formik.values.adminPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.adminPassword && !!formik.errors.adminPassword}
                  helperText={formik.touched.adminPassword && formik.errors.adminPassword}
                />
              </>
            )}
          </Stack>
          <Stack direction="row" spacing={1} justifyContent="flex-end" mt={3}>
            <Button onClick={onClose} color="inherit">Cancelar</Button>
            <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
              {isEdit ? 'Guardar' : 'Crear empresa'}
            </Button>
          </Stack>
        </form>
      </Box>
    </Modal>
  );
};

TenantFormModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
  company: PropTypes.object,
};
