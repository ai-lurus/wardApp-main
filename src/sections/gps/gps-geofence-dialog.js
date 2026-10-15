import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { GEOFENCE_TYPES } from 'src/utils/gps-insights';

const validationSchema = Yup.object({
  name: Yup.string().trim().required('Ponle un nombre').max(80, 'Máximo 80 caracteres'),
  type: Yup.string().oneOf(Object.keys(GEOFENCE_TYPES)).required(),
  radiusKm: Yup.number().typeError('Escribe un número').min(0.2, 'Mínimo 0.2 km').max(100, 'Máximo 100 km').required('Escribe el radio'),
  dwellEnabled: Yup.boolean(),
  dwellMinutes: Yup.number().when('dwellEnabled', {
    is: true,
    then: (schema) => schema.typeError('Escribe los minutos').min(1, 'Mínimo 1 minuto').required('Escribe los minutos'),
  }),
});

// Name, type, radius and alert rules for a geofence.
export const GpsGeofenceDialog = ({ open, geofence = null, draft = null, onClose, onSubmit }) => {
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: geofence?.name || '',
      type: geofence?.type || 'client',
      radiusKm: geofence?.radiusKm ?? draft?.radiusKm ?? 5,
      alertEntry: geofence?.alerts?.entry ?? true,
      alertExit: geofence?.alerts?.exit ?? true,
      dwellEnabled: Boolean(geofence?.alerts?.dwellMinutes),
      dwellMinutes: geofence?.alerts?.dwellMinutes || 60,
    },
    validationSchema,
    onSubmit: async (values, helpers) => {
      try {
        await onSubmit({
          name: values.name.trim(),
          type: values.type,
          radiusKm: Number(values.radiusKm),
          alerts: {
            entry: values.alertEntry,
            exit: values.alertExit,
            dwellMinutes: values.dwellEnabled ? Number(values.dwellMinutes) : null,
          },
        });
        helpers.resetForm();
      } catch (err) {
        helpers.setStatus(err.message);
      }
    },
  });

  const { values } = formik;
  const fieldProps = (name) => ({
    name,
    value: values[name],
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    error: Boolean(formik.touched[name] && formik.errors[name]),
    helperText: formik.touched[name] && formik.errors[name],
    fullWidth: true,
  });
  const checkbox = (name, label) => (
    <FormControlLabel control={<Checkbox name={name}
checked={values[name]}
onChange={formik.handleChange} />}
label={label} />
  );

  return (
    <Dialog open={open}
onClose={onClose}
fullWidth
maxWidth="sm">
      <form onSubmit={formik.handleSubmit}
noValidate>
        <DialogTitle>{geofence ? 'Editar geocerca' : 'Nueva geocerca'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5}
sx={{ pt: 1 }}>
            <TextField label="Nombre"
autoFocus
placeholder="Ej. CEDIS Apodaca"
{...fieldProps('name')} />
            <TextField select
label="Tipo"
{...fieldProps('type')}>
              {Object.entries(GEOFENCE_TYPES).map(([key, config]) => (
                <MenuItem key={key}
value={key}>
                  {config.label}
                  {config.stopAllowed ? '' : ' (cualquier parada genera alerta)'}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Radio"
              type="number"
              inputProps={{ step: 0.1, min: 0.2 }}
              InputProps={{ endAdornment: <InputAdornment position="end">km</InputAdornment> }}
              {...fieldProps('radiusKm')}
            />
            <Stack spacing={0.5}>
              <Typography variant="subtitle2">Alertas</Typography>
              <FormGroup>
                {checkbox('alertEntry', 'Al entrar')}
                {checkbox('alertExit', 'Al salir')}
                <Stack direction="row"
alignItems="center"
spacing={1}>
                  {checkbox('dwellEnabled', 'Si permanece más de')}
                  <TextField
                    size="small"
                    type="number"
                    disabled={!values.dwellEnabled}
                    sx={{ width: 140 }}
                    InputProps={{ endAdornment: <InputAdornment position="end">min</InputAdornment> }}
                    {...fieldProps('dwellMinutes')}
                    fullWidth={false}
                  />
                </Stack>
              </FormGroup>
            </Stack>
            {formik.status && <Alert severity="error">{formik.status}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit"
variant="contained"
disabled={formik.isSubmitting}>
            Guardar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

GpsGeofenceDialog.propTypes = {
  open: PropTypes.bool,
  geofence: PropTypes.object,
  draft: PropTypes.object,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
};
