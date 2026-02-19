import {
  Box,
  Button,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import TrashIcon from '@heroicons/react/24/solid/TrashIcon';
import XMarkIcon from '@heroicons/react/24/solid/XMarkIcon';
import { SvgIcon } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const ZONE_COLORS = [
  '#4CAF50', '#2196F3', '#FF9800', '#F44336',
  '#9C27B0', '#00BCD4', '#FF5722', '#607D8B',
];

export const ZonePanel = ({ zone, widthM, heightM, onClose, onSave, onDelete }) => {
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: zone?.name || '',
      description: zone?.description || '',
      color: zone?.color || '#4CAF50',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('El nombre es obligatorio'),
    }),
    onSubmit: (values) => {
      onSave(zone.id, values);
    },
  });

  if (!zone) return null;

  // Calculate real dimensions from percentages
  const realW = zone.wPct * widthM / 100;
  const realH = zone.hPct * heightM / 100;
  const areaM2 = (realW * realH).toFixed(1);

  return (
    <Box
      sx={{
        width: 280,
        height: '100%',
        bgcolor: 'background.paper',
        borderLeft: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Typography variant="subtitle2">Editar zona</Typography>
        <Box
          component="button"
          onClick={onClose}
          sx={{ background: 'none', border: 'none', cursor: 'pointer', p: 0.5, display: 'flex' }}
        >
          <SvgIcon fontSize="small" sx={{ color: 'text.secondary' }}>
            <XMarkIcon />
          </SvgIcon>
        </Box>
      </Stack>

      {/* Form */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              size="small"
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
              size="small"
              label="Descripción"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              multiline
              rows={2}
            />

            {/* Color picker */}
            <Box>
              <Typography variant="caption" color="text.secondary">
                Color
              </Typography>
              <Stack direction="row" spacing={0.75} flexWrap="wrap" gap={0.75} mt={0.5}>
                {ZONE_COLORS.map((c) => (
                  <Box
                    key={c}
                    onClick={() => formik.setFieldValue('color', c)}
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: c,
                      cursor: 'pointer',
                      border: formik.values.color === c ? '2px solid #000' : '2px solid transparent',
                    }}
                  />
                ))}
                <input
                  type="color"
                  value={formik.values.color}
                  onChange={(e) => formik.setFieldValue('color', e.target.value)}
                  style={{ width: 24, height: 24, padding: 0, border: 'none', borderRadius: '50%', cursor: 'pointer' }}
                />
              </Stack>
            </Box>

            {/* Dimensions info */}
            <Box sx={{ bgcolor: 'action.hover', borderRadius: 1, p: 1.5 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Dimensiones reales
              </Typography>
              <Typography variant="body2">
                {realW.toFixed(1)} m × {realH.toFixed(1)} m
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                Área: {areaM2} m²
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Materiales asignados: {zone.materialCount}
              </Typography>
            </Box>

            <Button type="submit" variant="contained" size="small" fullWidth>
              Guardar cambios
            </Button>
          </Stack>
        </form>
      </Box>

      <Divider />
      {/* Delete */}
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          size="small"
          color="error"
          variant="outlined"
          startIcon={
            <SvgIcon fontSize="small">
              <TrashIcon />
            </SvgIcon>
          }
          onClick={() => onDelete(zone.id)}
        >
          Eliminar zona
        </Button>
      </Box>
    </Box>
  );
};
