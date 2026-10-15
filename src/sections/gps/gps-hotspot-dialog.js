import PropTypes from 'prop-types';
import { addDays, format } from 'date-fns';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material';
import { HOTSPOT_LEVELS } from 'src/utils/gps-insights';

const REASONS = [
  'Robo a transporte',
  'Bloqueos o manifestaciones',
  'Obra en carretera',
  'Paradas no autorizadas',
  'Zona sin cobertura celular',
  'Accidentes frecuentes',
];

// Validity options in days; 0 means it never expires and -1 keeps the current expiry when editing.
const KEEP_VALIDITY = -1;
const VALIDITY_OPTIONS = [
  { days: 7, label: '7 días' },
  { days: 30, label: '30 días' },
  { days: 90, label: '90 días' },
  { days: 0, label: 'Sin vencimiento' },
];

const validationSchema = Yup.object({
  name: Yup.string().trim().required('Ponle un nombre al tramo').max(80, 'Máximo 80 caracteres'),
  level: Yup.string().oneOf(Object.keys(HOTSPOT_LEVELS)).required(),
  reason: Yup.string().required('Elige el motivo'),
  validityDays: Yup.number().required(),
  note: Yup.string().max(200, 'Máximo 200 caracteres'),
});

// Name, level, reason and validity for a hot route drawn by hand on the map.
export const GpsHotspotDialog = ({ open, hotspot = null, onClose, onSubmit }) => {
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: hotspot?.name || '',
      level: hotspot?.level || 'high',
      reason: hotspot?.reason || REASONS[0],
      validityDays: hotspot ? (hotspot.validUntil ? KEEP_VALIDITY : 0) : 30,
      note: hotspot?.note || '',
    },
    validationSchema,
    onSubmit: async ({ validityDays, ...values }, helpers) => {
      try {
        await onSubmit({
          ...values,
          validUntil:
            validityDays === KEEP_VALIDITY
              ? hotspot.validUntil
              : validityDays
                ? addDays(new Date(), validityDays).toISOString()
                : null,
        });
        helpers.resetForm();
      } catch (err) {
        helpers.setStatus(err.message);
      }
    },
  });

  const validityOptions = hotspot?.validUntil
    ? [{ days: KEEP_VALIDITY, label: `Mantener (hasta ${format(new Date(hotspot.validUntil), 'dd/MM/yyyy')})` }, ...VALIDITY_OPTIONS]
    : VALIDITY_OPTIONS;

  const fieldProps = (name) => ({
    name,
    value: formik.values[name],
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    error: Boolean(formik.touched[name] && formik.errors[name]),
    helperText: formik.touched[name] && formik.errors[name],
    fullWidth: true,
  });

  return (
    <Dialog open={open}
onClose={onClose}
fullWidth
maxWidth="sm">
      <form onSubmit={formik.handleSubmit}
noValidate>
        <DialogTitle>{hotspot ? 'Editar ruta caliente' : 'Nueva ruta caliente'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5}
sx={{ pt: 1 }}>
            <TextField label="Nombre del tramo"
autoFocus
placeholder="Ej. Libramiento Saltillo"
{...fieldProps('name')} />
            <TextField select
label="Nivel de riesgo"
{...fieldProps('level')}>
              {Object.entries(HOTSPOT_LEVELS).map(([key, config]) => (
                <MenuItem key={key}
value={key}>
                  {config.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField select
label="Motivo"
{...fieldProps('reason')}>
              {REASONS.map((reason) => (
                <MenuItem key={reason}
value={reason}>
                  {reason}
                </MenuItem>
              ))}
            </TextField>
            <TextField select
label="Vigencia"
{...fieldProps('validityDays')}>
              {validityOptions.map(({ days, label }) => (
                <MenuItem key={days}
value={days}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
            <TextField label="Nota (opcional)"
multiline
minRows={2}
{...fieldProps('note')} />
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

GpsHotspotDialog.propTypes = {
  open: PropTypes.bool,
  hotspot: PropTypes.object,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
};
