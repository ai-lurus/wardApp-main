import { useEffect } from 'react';
import {
  Alert,
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
  width: 520,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

export const MovementModal = ({ open, onClose, onSave, type, materials, preselectedMaterialId }) => {
  const { t } = useTranslation();
  const isEntry = type === 'entry';

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      materialId: preselectedMaterialId || '',
      quantity: '',
      unitCost: '',
      supplier: '',
      invoiceNumber: '',
      destination: '',
      reason: '',
      notes: '',
    },
    validationSchema: Yup.object({
      materialId: Yup.string().required(t('required')),
      quantity: Yup.number().min(1, t('mustBePositive')).required(t('required')),
      unitCost: isEntry
        ? Yup.number().min(0, t('mustBePositive')).required(t('required'))
        : Yup.number().notRequired(),
      supplier: isEntry ? Yup.string().required(t('required')) : Yup.string().notRequired(),
      destination: !isEntry ? Yup.string().required(t('required')) : Yup.string().notRequired(),
      reason: !isEntry ? Yup.string().required(t('required')) : Yup.string().notRequired(),
    }),
    onSubmit: (values) => {
      onSave({ ...values, type });
      formik.resetForm();
    },
  });

  useEffect(() => {
    if (open && preselectedMaterialId) {
      formik.setFieldValue('materialId', preselectedMaterialId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, preselectedMaterialId]);

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  const selectedMaterial = materials.find((m) => m.id === formik.values.materialId);
  const totalCost = (Number(formik.values.quantity) || 0) * (Number(formik.values.unitCost) || 0);

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" mb={3}>
          {isEntry ? t('registerEntry') : t('registerExit')}
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              select
              label={t('material')}
              name="materialId"
              value={formik.values.materialId}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.materialId && Boolean(formik.errors.materialId)}
              helperText={formik.touched.materialId && formik.errors.materialId}
            >
              {materials.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  {m.name} {!isEntry ? `(${t('stock')}: ${m.currentStock})` : ''}
                </MenuItem>
              ))}
            </TextField>

            {!isEntry && selectedMaterial && (
              <Alert severity={selectedMaterial.currentStock <= selectedMaterial.minStock ? 'warning' : 'info'}>
                {t('availableStock')}: {selectedMaterial.currentStock} {selectedMaterial.unit}
              </Alert>
            )}

            <TextField
              fullWidth
              type="number"
              label={t('quantity')}
              name="quantity"
              value={formik.values.quantity}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.quantity && Boolean(formik.errors.quantity)}
              helperText={formik.touched.quantity && formik.errors.quantity}
            />

            {isEntry && (
              <>
                <TextField
                  fullWidth
                  type="number"
                  label={t('unitCost')}
                  name="unitCost"
                  value={formik.values.unitCost}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.unitCost && Boolean(formik.errors.unitCost)}
                  helperText={formik.touched.unitCost && formik.errors.unitCost}
                />
                {totalCost > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    {t('totalCost')}: ${totalCost.toLocaleString()}
                  </Typography>
                )}
                <TextField
                  fullWidth
                  label={t('supplier')}
                  name="supplier"
                  value={formik.values.supplier}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.supplier && Boolean(formik.errors.supplier)}
                  helperText={formik.touched.supplier && formik.errors.supplier}
                />
                <TextField
                  fullWidth
                  label={t('invoiceNumber')}
                  name="invoiceNumber"
                  value={formik.values.invoiceNumber}
                  onChange={formik.handleChange}
                />
              </>
            )}

            {!isEntry && (
              <>
                <TextField
                  fullWidth
                  label={t('destination')}
                  name="destination"
                  value={formik.values.destination}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.destination && Boolean(formik.errors.destination)}
                  helperText={formik.touched.destination && formik.errors.destination}
                />
                <TextField
                  fullWidth
                  label={t('reason')}
                  name="reason"
                  value={formik.values.reason}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.reason && Boolean(formik.errors.reason)}
                  helperText={formik.touched.reason && formik.errors.reason}
                />
              </>
            )}

            <TextField
              fullWidth
              multiline
              rows={2}
              label={t('notes')}
              name="notes"
              value={formik.values.notes}
              onChange={formik.handleChange}
            />

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button onClick={handleClose}>{t('cancel')}</Button>
              <Button type="submit" variant="contained" color={isEntry ? 'success' : 'warning'}>
                {isEntry ? t('registerEntry') : t('registerExit')}
              </Button>
            </Stack>
          </Stack>
        </form>
      </Box>
    </Modal>
  );
};
