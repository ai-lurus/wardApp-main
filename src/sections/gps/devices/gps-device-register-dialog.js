import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material';
import { DEVICE_MODELS, SIM_CARRIERS, isValidIccid, isValidImei } from 'src/utils/gps-devices';

const validationSchema = Yup.object({
  imei: Yup.string()
    .required('Ingresa el IMEI')
    .matches(/^\d{15}$/, 'El IMEI tiene 15 dígitos')
    .test('luhn', 'IMEI inválido: el dígito verificador no coincide', isValidImei),
  model: Yup.string().required('Elige el modelo'),
  iccid: Yup.string().required('Ingresa el ICCID de la SIM').test('iccid', 'El ICCID empieza con 89 y tiene 19 o 20 dígitos', isValidIccid),
  carrier: Yup.string().required('Elige el operador'),
});

// Adds a new GPS device to stock so it can later be assigned to a unit.
export const GpsDeviceRegisterDialog = ({ open, onClose, onSubmit }) => {
  const formik = useFormik({
    initialValues: { imei: '', model: DEVICE_MODELS[0], iccid: '', carrier: SIM_CARRIERS[0] },
    validationSchema,
    onSubmit: async (values, helpers) => {
      try {
        await onSubmit(values);
        helpers.resetForm();
      } catch (err) {
        helpers.setStatus(err.message);
      }
    },
  });

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
        <DialogTitle>Registrar dispositivo GPS</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5}
sx={{ pt: 1 }}>
            <TextField label="IMEI"
autoFocus
inputProps={{ inputMode: 'numeric', maxLength: 15 }}
{...fieldProps('imei')} />
            <TextField select
label="Modelo"
{...fieldProps('model')}>
              {DEVICE_MODELS.map((model) => (
                <MenuItem key={model}
value={model}>
                  {model}
                </MenuItem>
              ))}
            </TextField>
            <TextField label="ICCID de la SIM"
inputProps={{ inputMode: 'numeric', maxLength: 20 }}
{...fieldProps('iccid')} />
            <TextField select
label="Operador"
{...fieldProps('carrier')}>
              {SIM_CARRIERS.map((carrier) => (
                <MenuItem key={carrier}
value={carrier}>
                  {carrier}
                </MenuItem>
              ))}
            </TextField>
            {formik.status && <Alert severity="error">{formik.status}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit"
variant="contained"
disabled={formik.isSubmitting}>
            Registrar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

GpsDeviceRegisterDialog.propTypes = { open: PropTypes.bool, onClose: PropTypes.func, onSubmit: PropTypes.func };
