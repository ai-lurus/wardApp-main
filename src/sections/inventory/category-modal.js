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
import { useTranslation } from 'react-i18next';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 480,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

export const CategoryModal = ({ open, onClose, onSave, category }) => {
  const { t } = useTranslation();
  const isEdit = Boolean(category);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: category?.name || '',
      description: category?.description || '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required(t('required')),
      description: Yup.string(),
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
          {isEdit ? t('editCategory') : t('newCategory')}
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label={t('categoryName')}
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label={t('description')}
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
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
