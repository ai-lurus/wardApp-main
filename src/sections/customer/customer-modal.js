import { Box, Button, Modal, Stack, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import PropTypes from 'prop-types';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 560 },
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

export const CustomerModal = ({ open, onClose, customer, onSave }) => {
  const isEdit = Boolean(customer);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: customer?.name || '',
      phone: customer?.phone || '',
      email: customer?.email || '',
      notes: customer?.notes || '',
    },
    validationSchema: Yup.object({
      name: Yup.string().trim().max(255).required('El nombre es requerido'),
      phone: Yup.string().trim().max(50).required('El teléfono es requerido'),
      email: Yup.string().email('Debe ser un correo válido').max(255),
      notes: Yup.string().max(1000),
    }),
    onSubmit: async (values, helpers) => {
      try {
        await onSave(values, isEdit ? customer.id : null);
        helpers.setStatus({ success: true });
        formik.resetForm();
      } catch (err) {
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: err.response?.data?.error || err.message });
      } finally {
        helpers.setSubmitting(false);
      }
    }
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Modal open={open}
      onClose={handleClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6"
          mb={3}>
          {isEdit ? 'Editar Cliente' : 'Nuevo Cliente'}
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              required
              id="name"
              label="Nombre"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }}
              spacing={2}>
              <TextField
                fullWidth
                required
                id="phone"
                label="Teléfono"
                name="phone"
                value={formik.values.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9+\s-]/g, '');
                  formik.setFieldValue('phone', value);
                }}
                onBlur={formik.handleBlur}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
              />
              <TextField
                fullWidth
                id="email"
                label="Correo (opcional)"
                name="email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Stack>

            <TextField
              fullWidth
              multiline
              minRows={2}
              id="notes"
              label="Notas"
              name="notes"
              value={formik.values.notes}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.notes && Boolean(formik.errors.notes)}
              helperText={formik.touched.notes && formik.errors.notes}
            />

            {formik.errors.submit && (
              <Typography color="error"
                variant="body2">
                {formik.errors.submit}
              </Typography>
            )}

            <Stack direction="row"
              spacing={2}
              justifyContent="flex-end">
              <Button onClick={handleClose}>Cancelar</Button>
              <Button type="submit"
                variant="contained"
                disabled={formik.isSubmitting}>
                {isEdit ? 'Guardar' : 'Crear'}
              </Button>
            </Stack>
          </Stack>
        </form>
      </Box>
    </Modal>
  );
};

CustomerModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  customer: PropTypes.object,
  onSave: PropTypes.func.isRequired
};
