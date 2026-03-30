import { useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  Divider,
  Modal,
  Stack,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
  FormGroup,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { adminApi } from 'src/services/apiService';
import { MODULES } from 'src/constants/modules';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 540,
  maxHeight: '90vh',
  overflowY: 'auto',
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: 1,
  p: 3,
};

const ALL_MODULES = [
  { id: MODULES.INVENTARIO, name: 'Inventario' },
  { id: MODULES.OPERACIONES, name: 'Operaciones' },
  { id: MODULES.FLOTAS, name: 'Flotas' },
  { id: MODULES.CLIENTES, name: 'Clientes' },
  { id: MODULES.FINANZAS, name: 'Finanzas' },
];

const createSchema = Yup.object({
  name: Yup.string().required('Requerido'),
  slug: Yup.string()
    .matches(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones')
    .required('Requerido'),
  active_modules: Yup.array()
    .of(Yup.string())
    .min(1, 'Seleccione al menos un módulo')
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
  active_modules: Yup.array()
    .of(Yup.string())
    .min(1, 'Seleccione al menos un módulo')
    .required('Requerido'),
});

export const TenantFormModal = ({ open, onClose, onSaved, company }) => {
  const isEdit = !!company;

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: isEdit
      ? { name: company.name, slug: company.slug, active: company.active, active_modules: (company.activeModules && company.activeModules.length > 0) ? company.activeModules : [MODULES.INVENTARIO] }
      : { name: '', slug: '', adminEmail: '', adminName: '', adminPassword: '', active_modules: [MODULES.INVENTARIO] },
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

  useEffect(() => {
    if (open) {
      formik.resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const autoSlug = (name) =>
    name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  return (
    <Modal open={open}
      onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6"
          mb={2}>
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
            <Divider>Módulos Asignados</Divider>
            <FormGroup>
              {ALL_MODULES.map((mod) => (
                <FormControlLabel
                  key={mod.id}
                  control={
                    <Checkbox
                      checked={formik.values.active_modules?.includes(mod.id)}
                      onChange={(e) => {
                        formik.setFieldTouched('active_modules', true);
                        const prev = formik.values.active_modules || [];
                        if (e.target.checked) {
                          formik.setFieldValue('active_modules', [...prev, mod.id]);
                        } else {
                          formik.setFieldValue(
                            'active_modules',
                            prev.filter((m) => m !== mod.id)
                          );
                        }
                      }}
                    />
                  }
                  label={mod.name}
                />
              ))}
            </FormGroup>
            {(formik.touched.active_modules || formik.submitCount > 0) && !!formik.errors.active_modules && (
              <Typography variant="caption"
                color="error"
                sx={{ ml: 2, mt: 1 }}>
                {formik.errors.active_modules}
              </Typography>
            )}
          </Stack>
          <Stack direction="row"
            spacing={1}
            justifyContent="flex-end"
            mt={3}>
            <Button onClick={onClose}
              color="inherit">Cancelar</Button>
            <Button type="submit"
              variant="contained"
              disabled={formik.isSubmitting}>
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
