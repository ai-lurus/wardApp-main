import {
  Box,
  Button,
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
  width: 420,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const ZONE_COLORS = [
  '#4CAF50', '#2196F3', '#FF9800', '#F44336',
  '#9C27B0', '#00BCD4', '#FF5722', '#607D8B',
];

export const ZoneCreateModal = ({ open, onClose, onSave, rect }) => {
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: '',
      description: '',
      color: '#4CAF50',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('El nombre es obligatorio'),
    }),
    onSubmit: (values, { resetForm }) => {
      if (rect) {
        onSave({
          name: values.name,
          description: values.description,
          color: values.color,
          xPct: rect.xPct,
          yPct: rect.yPct,
          wPct: rect.wPct,
          hPct: rect.hPct,
        });
      }
      resetForm();
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
          Nueva zona
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Nombre de la zona"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              autoFocus
            />
            <TextField
              fullWidth
              label="Descripción (opcional)"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              multiline
              rows={2}
            />
            <Box>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Color de la zona
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                {ZONE_COLORS.map((c) => (
                  <Box
                    key={c}
                    onClick={() => formik.setFieldValue('color', c)}
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: c,
                      cursor: 'pointer',
                      border: formik.values.color === c ? '3px solid #000' : '3px solid transparent',
                      transition: 'border-color 0.15s',
                    }}
                  />
                ))}
                <input
                  type="color"
                  value={formik.values.color}
                  onChange={(e) => formik.setFieldValue('color', e.target.value)}
                  style={{ width: 32, height: 32, padding: 0, border: 'none', borderRadius: '50%', cursor: 'pointer' }}
                />
              </Stack>
            </Box>
            {rect && (
              <Typography variant="caption" color="text.secondary">
                Posición: ({rect.xPct.toFixed(1)}%, {rect.yPct.toFixed(1)}%) —
                Tamaño: {rect.wPct.toFixed(1)}% × {rect.hPct.toFixed(1)}%
              </Typography>
            )}
            <Stack direction="row" spacing={2} justifyContent="flex-end" pt={1}>
              <Button onClick={handleClose}>Cancelar</Button>
              <Button type="submit" variant="contained">
                Crear zona
              </Button>
            </Stack>
          </Stack>
        </form>
      </Box>
    </Modal>
  );
};
