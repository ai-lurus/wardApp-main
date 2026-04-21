import { Box, Button, Modal, Stack, TextField, Typography, Alert } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

export const TollboothModal = ({ open, onClose, onSave, tollbooth, serverError }) => {
  const isEdit = Boolean(tollbooth);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: tollbooth?.name || '',
      cost2Axles: tollbooth?.cost2Axles ?? 0,
      cost3Axles: tollbooth?.cost3Axles ?? 0,
      cost4Axles: tollbooth?.cost4Axles ?? 0,
      cost5Axles: tollbooth?.cost5Axles ?? 0,
      cost6Axles: tollbooth?.cost6Axles ?? 0,
      cost7PlusAxles: tollbooth?.cost7PlusAxles ?? 0,
      active: tollbooth?.active ?? true,
    },
    validationSchema: Yup.object({
      name: Yup.string().required('El nombre es requerido'),
      cost2Axles: Yup.number().min(1, 'No puede ser 0 o negativo').required('Requerido'),
      cost3Axles: Yup.number().min(1, 'No puede ser 0 o negativo'),
      cost4Axles: Yup.number().min(1, 'No puede ser 0 o negativo'),
      cost5Axles: Yup.number().min(1, 'No puede ser 0 o negativo'),
      cost6Axles: Yup.number().min(1, 'No puede ser 0 o negativo'),
      cost7PlusAxles: Yup.number().min(1, 'No puede ser 0 o negativo'),
    }),
    onSubmit: (values) => {
      onSave(values);
    },
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
          {isEdit ? 'Editar Caseta' : 'Nueva Caseta'}
        </Typography>

        {serverError && (
          <Alert severity="error"
            sx={{ mb: 3 }}>
            {serverError}
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              id="name"
              label="Nombre de la Caseta"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />

            <Typography variant="subtitle2"
              sx={{ mt: 2 }}>Tarifas por número de ejes</Typography>

            <Stack direction="row"
              spacing={2}>
              <TextField
                fullWidth
                label="2 Ejes"
                name="cost2Axles"
                type="number"
                value={formik.values.cost2Axles}
                error={formik.touched.cost2Axles && Boolean(formik.errors.cost2Axles)}
                helperText={formik.touched.cost2Axles && formik.errors.cost2Axles}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <TextField
                fullWidth
                label="3 Ejes"
                name="cost3Axles"
                type="number"
                value={formik.values.cost3Axles}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.cost3Axles && Boolean(formik.errors.cost3Axles)}
                helperText={formik.touched.cost3Axles && formik.errors.cost3Axles}
              />
            </Stack>

            <Stack direction="row"
              spacing={2}>
              <TextField
                fullWidth
                label="4 Ejes"
                name="cost4Axles"
                type="number"
                value={formik.values.cost4Axles}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.cost4Axles && Boolean(formik.errors.cost4Axles)}
                helperText={formik.touched.cost4Axles && formik.errors.cost4Axles}
              />
              <TextField
                fullWidth
                label="5 Ejes"
                name="cost5Axles"
                type="number"
                value={formik.values.cost5Axles}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.cost5Axles && Boolean(formik.errors.cost5Axles)}
                helperText={formik.touched.cost5Axles && formik.errors.cost5Axles}
              />
            </Stack>

            <Stack direction="row"
              spacing={2}>
              <TextField
                fullWidth
                label="6 Ejes"
                name="cost6Axles"
                type="number"
                value={formik.values.cost6Axles}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.cost6Axles && Boolean(formik.errors.cost6Axles)}
                helperText={formik.touched.cost6Axles && formik.errors.cost6Axles}
              />
              <TextField
                fullWidth
                label="7+ Ejes"
                name="cost7PlusAxles"
                type="number"
                value={formik.values.cost7PlusAxles}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.cost7PlusAxles && Boolean(formik.errors.cost7PlusAxles)}
                helperText={formik.touched.cost7PlusAxles && formik.errors.cost7PlusAxles}
              />
            </Stack>

            <Stack direction="row"
              spacing={2}
              justifyContent="flex-end"
              sx={{ mt: 3 }}>
              <Button onClick={handleClose}>Cancelar</Button>
              <Button type="submit"
                variant="contained">
                Guardar
              </Button>
            </Stack>
          </Stack>
        </form>
      </Box>
    </Modal>
  );
};
