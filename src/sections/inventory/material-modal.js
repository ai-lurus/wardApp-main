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
import { useTranslation } from 'react-i18next';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 550,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

export const MaterialModal = ({ open, onClose, onSave, material, categories, zones = [] }) => {
  const { t } = useTranslation();
  const isEdit = Boolean(material);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: material?.name || '',
      sku: material?.sku || '',
      location: material?.location || '',
      zoneId: material?.zoneId || '',
      categoryId: material?.categoryId || '',
      unit: material?.unit || 'pieza',
      referencePrice: material?.referencePrice || '',
      minStock: material?.minStock || '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required(t('required')),
      sku: Yup.string().max(20),
      location: Yup.string(),
      categoryId: Yup.string().required(t('required')),
      unit: Yup.string().required(t('required')),
      referencePrice: Yup.number().min(0, t('mustBePositive')).required(t('required')),
      minStock: Yup.number().min(0, t('mustBePositive')).required(t('required')),
    }),
    onSubmit: (values) => {
      onSave(values);
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
          {isEdit ? t('editMaterial') : t('newMaterial')}
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label={t('name')}
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
                label={t('sku')}
                name="sku"
                value={formik.values.sku}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.sku && Boolean(formik.errors.sku)}
                helperText={formik.touched.sku && formik.errors.sku}
                inputProps={{ maxLength: 20 }}
              />
              <TextField
                fullWidth
                select
                label="Zona del almacén"
                name="zoneId"
                value={formik.values.zoneId}
                onChange={formik.handleChange}
              >
                <MenuItem value="">
                  <em>Sin zona</em>
                </MenuItem>
                {zones.map((zone) => (
                  <MenuItem key={zone.id} value={zone.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: zone.color,
                          flexShrink: 0,
                        }}
                      />
                      {zone.name}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <TextField
              fullWidth
              label={t('location')}
              name="location"
              value={formik.values.location}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Ubicación manual (ej. Estante A-3)"
            />
            <TextField
              fullWidth
              select
              label={t('category')}
              name="categoryId"
              value={formik.values.categoryId}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.categoryId && Boolean(formik.errors.categoryId)}
              helperText={formik.touched.categoryId && formik.errors.categoryId}
            >
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              select
              label={t('unit')}
              name="unit"
              value={formik.values.unit}
              onChange={formik.handleChange}
            >
              <MenuItem value="pieza">{t('piece')}</MenuItem>
              <MenuItem value="litro">{t('liter')}</MenuItem>
              <MenuItem value="juego">{t('set')}</MenuItem>
            </TextField>
            <TextField
              fullWidth
              type="number"
              label={t('referencePrice')}
              name="referencePrice"
              value={formik.values.referencePrice}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.referencePrice && Boolean(formik.errors.referencePrice)}
              helperText={formik.touched.referencePrice && formik.errors.referencePrice}
            />
            <TextField
              fullWidth
              type="number"
              label={t('minStock')}
              name="minStock"
              value={formik.values.minStock}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.minStock && Boolean(formik.errors.minStock)}
              helperText={formik.touched.minStock && formik.errors.minStock}
            />
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button onClick={handleClose}>{t('cancel')}</Button>
              <Button type="submit" variant="contained">
                {t('save')}
              </Button>
            </Stack>
          </Stack>
        </form>
      </Box>
    </Modal>
  );
};
