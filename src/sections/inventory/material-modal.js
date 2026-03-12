import {
  Box,
  Button,
  MenuItem,
  Modal,
  Stack,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useState, useRef } from 'react';
import { uploadFileToGCS } from 'src/utils/upload';
import { SecureImage } from 'src/components/secure-image';

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
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(material?.imageUrl || '');

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
      imageUrl: material?.imageUrl || '',
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
    setPreviewUrl('');
    onClose();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const token = window.sessionStorage.getItem('token');
      // Upload to GCS now returns the relative bucket path (e.g. materials/timestamp-file.png)
      const path = await uploadFileToGCS(file, token, 'materials');

      // We can preview it instantly by assigning a Object URL locally before saving
      setPreviewUrl(URL.createObjectURL(file));
      formik.setFieldValue('imageUrl', path);
    } catch (err) {
      console.error('Error uploading image', err);
      // You may use the parent's snackbar to show this error
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl('');
    formik.setFieldValue('imageUrl', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" mb={3}>
          {isEdit ? t('editMaterial') : t('newMaterial')}
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={2}>
            {/* Image Upload Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: 1,
                  bgcolor: 'neutral.100',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  position: 'relative',
                  border: '1px dashed',
                  borderColor: 'neutral.300',
                }}
              >
                {formik.values.imageUrl || previewUrl ? (
                  <>
                    {previewUrl && !previewUrl.startsWith('http') && !previewUrl.startsWith('blob:') ? (
                      <SecureImage path={previewUrl} sx={{ width: '100%', height: '100%', borderRadius: 0 }} />
                    ) : (
                      <img src={previewUrl} alt="Material" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}

                    <IconButton
                      size="small"
                      onClick={handleRemoveImage}
                      sx={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        bgcolor: 'rgba(0,0,0,0.5)',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                      }}
                    >
                      <XMarkIcon style={{ width: 14, height: 14, color: '#fff' }} />
                    </IconButton>
                  </>
                ) : (
                  <PhotoIcon style={{ width: 32, height: 32, color: '#9CA3AF' }} />
                )}
              </Box>
              <Box>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? 'Subiendo...' : 'Subir Imagen'}
                </Button>
                <Typography variant="caption" display="block" color="text.secondary" mt={0.5}>
                  Formatos recomendados: JPG, PNG. Max 5MB.
                </Typography>
              </Box>
            </Box>

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
