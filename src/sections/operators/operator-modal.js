import { Box, Button, MenuItem, Modal, Stack, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import PropTypes from 'prop-types';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 650,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

export const OperatorModal = ({ open, onClose, operator, onSave }) => {
  const isEdit = Boolean(operator);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: operator?.name || '',
      licenseNumber: operator?.licenseNumber || '',
      licenseType: operator?.licenseType || '',
      licenseExpiry: operator?.licenseExpiry ? operator.licenseExpiry.split('T')[0] : '',
      phone: operator?.phone || '',
      email: operator?.email || '',
    },
    validationSchema: Yup.object({
      name: Yup.string().max(255).required('El nombre es requerido'),
      licenseNumber: Yup.string().max(255).required('El número de licencia es requerido'),
      licenseType: Yup.string().oneOf(['A', 'B', 'C', 'D', 'E']).required('El tipo de licencia es requerido'),
      licenseExpiry: Yup.string().required('La vigencia es requerida'),
      phone: Yup.string().max(50),
      email: Yup.string().email('Debe ser un email válido').max(255),
    }),
    onSubmit: async (values, helpers) => {
      try {
        await onSave(values, isEdit ? operator.id : null);
        helpers.setStatus({ success: true });
        formik.resetForm();
      } catch (err) {
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: err.message });
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
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" mb={3}>
          {isEdit ? 'Editar Operador' : 'Nuevo Operador'}
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

            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                required
                id="licenseNumber"
                label="No. Licencia"
                name="licenseNumber"
                value={formik.values.licenseNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.licenseNumber && Boolean(formik.errors.licenseNumber)}
                helperText={formik.touched.licenseNumber && formik.errors.licenseNumber}
              />

              <TextField
                fullWidth
                select
                required
                label="Tipo de Licencia"
                name="licenseType"
                InputLabelProps={{ htmlFor: '' }}
                SelectProps={{ inputProps: { id: 'licenseType-select', name: 'licenseType' } }}
                value={formik.values.licenseType}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.licenseType && Boolean(formik.errors.licenseType)}
                helperText={formik.touched.licenseType && formik.errors.licenseType}
              >
                <MenuItem value="">Seleccione</MenuItem>
                <MenuItem value="A">Tipo A</MenuItem>
                <MenuItem value="B">Tipo B</MenuItem>
                <MenuItem value="C">Tipo C</MenuItem>
                <MenuItem value="D">Tipo D</MenuItem>
                <MenuItem value="E">Tipo E</MenuItem>
              </TextField>

              <TextField
                fullWidth
                required
                id="licenseExpiry"
                label="Vigencia Licencia"
                type="date"
                InputLabelProps={{ shrink: true }}
                name="licenseExpiry"
                value={formik.values.licenseExpiry}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.licenseExpiry && Boolean(formik.errors.licenseExpiry)}
                helperText={formik.touched.licenseExpiry && formik.errors.licenseExpiry}
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                id="phone"
                label="Teléfono"
                name="phone"
                value={formik.values.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  formik.setFieldValue('phone', value);
                }}
                onBlur={formik.handleBlur}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
              />
              <TextField
                fullWidth
                id="email"
                label="Correo Electrónico"
                name="email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Stack>

            {formik.errors.submit && (
              <Typography color="error" variant="body2">
                {formik.errors.submit}
              </Typography>
            )}

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button onClick={handleClose}>Cancelar</Button>
              <Button type="submit" variant="contained">
                {isEdit ? 'Guardar' : 'Crear'}
              </Button>
            </Stack>
          </Stack>
        </form>
      </Box>
    </Modal>
  );
};

OperatorModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  operator: PropTypes.object,
  onSave: PropTypes.func.isRequired
};
