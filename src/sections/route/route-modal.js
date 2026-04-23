import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Modal,
  Stack,
  TextField,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Autocomplete,
  Alert
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import TrashIcon from '@heroicons/react/24/solid/TrashIcon';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 700,
  maxHeight: '90vh',
  overflowY: 'auto',
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

export const RouteModal = ({ open, onClose, onSave, route, allTollbooths = [], serverError }) => {
  const isEdit = Boolean(route);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: route?.name || '',
      origin: route?.origin || '',
      destination: route?.destination || '',
      distanceKm: route?.distanceKm ?? 0,
      estimatedDurationMin: route?.estimatedDurationMin ?? 0,
      active: route?.active ?? true,
      tollbooths: route?.tollbooths ? [...route.tollbooths].sort((a, b) => a.order - b.order) : [],
    },
    validationSchema: Yup.object({
      name: Yup.string().required('El nombre es requerido'),
      origin: Yup.string().required('El origen es requerido'),
      destination: Yup.string().required('El destino es requerido'),
      distanceKm: Yup.number().min(1, 'No puede ser 0 o negativo').required('Requerido'),
      estimatedDurationMin: Yup.number().min(1, 'No puede ser 0 o negativo').required('Requerido'),
    }),
    onSubmit: (values) => {
      onSave(values);
    },
  });

  const handleAddTollbooth = () => {
    const current = [...formik.values.tollbooths];
    // Find highest order
    const nextOrder = current.length > 0 ? Math.max(...current.map(t => t.order)) + 1 : 1;
    formik.setFieldValue('tollbooths', [
      ...current,
      { id: '', name: '', order: nextOrder }
    ]);
  };

  const handleRemoveTollbooth = (index) => {
    const current = [...formik.values.tollbooths];
    current.splice(index, 1);
    // Re-calculate orders to keep them sequential
    const updated = current.map((t, idx) => ({ ...t, order: idx + 1 }));
    formik.setFieldValue('tollbooths', updated);
  };

  const handleTollboothChange = (index, selectedTb) => {
    const current = [...formik.values.tollbooths];
    if (selectedTb) {
      current[index] = { ...current[index], id: selectedTb.id, name: selectedTb.name };
    } else {
      current[index] = { ...current[index], id: '', name: '' };
    }
    formik.setFieldValue('tollbooths', current);
  };

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
          {isEdit ? 'Editar Ruta' : 'Nueva Ruta'}
        </Typography>

        {serverError && (
          <Alert severity="error"
            sx={{ mb: 3 }}>
            {serverError}
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={3}>
            <Stack direction="row"
              spacing={2}>
              <TextField
                fullWidth
                label="Nombre de la Ruta"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Stack>

            <Stack direction="row"
              spacing={2}>
              <TextField
                fullWidth
                label="Origen"
                name="origin"
                value={formik.values.origin}
                error={formik.touched.origin && Boolean(formik.errors.origin)}
                helperText={formik.touched.origin && formik.errors.origin}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <TextField
                fullWidth
                label="Destino"
                name="destination"
                value={formik.values.destination}
                error={formik.touched.destination && Boolean(formik.errors.destination)}
                helperText={formik.touched.destination && formik.errors.destination}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Stack>

            <Stack direction="row"
              spacing={2}>
              <TextField
                fullWidth
                label="Distancia (km)"
                name="distanceKm"
                type="number"
                value={formik.values.distanceKm}
                error={formik.touched.distanceKm && Boolean(formik.errors.distanceKm)}
                helperText={formik.touched.distanceKm && formik.errors.distanceKm}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <TextField
                fullWidth
                label="Duración Estimada (min)"
                name="estimatedDurationMin"
                type="number"
                value={formik.values.estimatedDurationMin}
                error={formik.touched.estimatedDurationMin && Boolean(formik.errors.estimatedDurationMin)}
                helperText={formik.touched.estimatedDurationMin && formik.errors.estimatedDurationMin}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Stack>

            <Divider />

            <Box>
              <Stack direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={2}>
                <Typography variant="subtitle1">Casetas en la ruta</Typography>
                <Button
                  startIcon={<PlusIcon style={{ width: 20 }} />}
                  onClick={handleAddTollbooth}
                  variant="outlined"
                  size="small"
                >
                  Agregar Caseta
                </Button>
              </Stack>

              <List>
                {formik.values.tollbooths.map((tb, index) => (
                  <ListItem key={index}
                    sx={{ px: 0 }}>
                    <Stack direction="row"
                      spacing={2}
                      width="100%"
                      alignItems="center">
                      <Typography variant="body2"
                        sx={{ width: 30 }}>{tb.order}.</Typography>
                      <Autocomplete
                        fullWidth
                        size="small"
                        options={allTollbooths}
                        getOptionLabel={(option) => option.name || ''}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        value={allTollbooths.find(t => t.id === tb.id) || null}
                        onChange={(event, newValue) => handleTollboothChange(index, newValue)}
                        renderInput={(params) => <TextField {...params}
                          label="Seleccionar Caseta" />}
                      />
                      <IconButton onClick={() => handleRemoveTollbooth(index)}
                        color="error">
                        <TrashIcon style={{ width: 20 }} />
                      </IconButton>
                    </Stack>
                  </ListItem>
                ))}
              </List>
              {formik.values.tollbooths.length === 0 && (
                <Typography variant="body2"
                  color="text.secondary"
                  textAlign="center">
                  No hay casetas asignadas a esta ruta.
                </Typography>
              )}
            </Box>

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
