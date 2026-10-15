import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { isValidImei } from 'src/utils/gps-devices';

const findByImei = (devices, imei) => devices.find((device) => device.imei === imei);

const buildSchema = (devices) =>
  Yup.object({
    unitId: Yup.string().required('Elige una unidad'),
    mode: Yup.string().oneOf(['stock', 'imei']),
    deviceId: Yup.string().when('mode', {
      is: 'stock',
      then: (schema) => schema.required('Elige un dispositivo'),
    }),
    imei: Yup.string().when('mode', {
      is: 'imei',
      then: (schema) =>
        schema
          .required('Ingresa o escanea el IMEI')
          .matches(/^\d{15}$/, 'El IMEI tiene 15 dígitos')
          .test('luhn', 'IMEI inválido: el dígito verificador no coincide', isValidImei)
          .test('registered', 'IMEI no registrado. Regístralo primero en "Registrar dispositivo".', (value) =>
            Boolean(findByImei(devices, value))
          )
          .test('fault', 'Este dispositivo tiene una falla reportada', (value) => findByImei(devices, value)?.status !== 'fault'),
    }),
    note: Yup.string().max(200, 'Máximo 200 caracteres'),
  });

/**
 * Assign or reassign a GPS device to a unit. The device can be picked from stock
 * or typed/scanned by IMEI (a USB barcode reader types into the field).
 */
export const GpsDeviceAssignDialog = ({ open, onClose, onSubmit, units = [], devices = [], initialUnitId = '', initialDeviceId = '' }) => {
  const stockDevices = useMemo(
    () => devices.filter((device) => !device.unitId && device.status !== 'fault'),
    [devices]
  );
  const validationSchema = useMemo(() => buildSchema(devices), [devices]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      unitId: initialUnitId,
      mode: initialDeviceId || stockDevices.length ? 'stock' : 'imei',
      deviceId: initialDeviceId,
      imei: '',
      note: '',
    },
    validationSchema,
    onSubmit: async (values, helpers) => {
      const device = values.mode === 'imei' ? findByImei(devices, values.imei) : devices.find((d) => d.id === values.deviceId);
      const unit = units.find((item) => item.id === values.unitId);
      try {
        await onSubmit({ deviceId: device.id, unitId: unit.id, unitLabel: unit.label, note: values.note });
        helpers.resetForm();
      } catch (err) {
        helpers.setStatus(err.message);
      }
    },
  });

  const { values, errors, touched } = formik;
  const isReassign = Boolean(devices.find((d) => d.id === initialDeviceId)?.unitId);
  const selectedDevice =
    values.mode === 'imei' ? findByImei(devices, values.imei) : devices.find((d) => d.id === values.deviceId);
  const unitDevice = devices.find((device) => device.unitId === values.unitId);
  // A reassigned device keeps its own entry in the list even though it is not in stock.
  const deviceOptions = initialDeviceId
    ? [devices.find((d) => d.id === initialDeviceId), ...stockDevices].filter(Boolean)
    : stockDevices;

  const fieldProps = (name) => ({
    name,
    value: values[name],
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    error: Boolean(touched[name] && errors[name]),
    helperText: touched[name] && errors[name],
    fullWidth: true,
  });

  return (
    <Dialog open={open}
onClose={onClose}
fullWidth
maxWidth="sm">
      <form onSubmit={formik.handleSubmit}
noValidate>
        <DialogTitle>{isReassign ? 'Reasignar GPS a otra unidad' : 'Asignar GPS a una unidad'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5}
sx={{ pt: 1 }}>
            <TextField select
label="Unidad"
{...fieldProps('unitId')}>
              {units.map((unit) => (
                <MenuItem key={unit.id}
value={unit.id}>
                  {unit.label}
                  {unit.deviceImei ? ` (GPS actual …${unit.deviceImei.slice(-5)})` : ' (sin GPS)'}
                </MenuItem>
              ))}
            </TextField>

            {!initialDeviceId && (
              <ToggleButtonGroup
                exclusive
                size="small"
                color="primary"
                value={values.mode}
                onChange={(event, mode) => mode && formik.setFieldValue('mode', mode)}
              >
                <ToggleButton value="stock">Elegir del almacén</ToggleButton>
                <ToggleButton value="imei">Ingresar o escanear IMEI</ToggleButton>
              </ToggleButtonGroup>
            )}

            {values.mode === 'stock' ? (
              <TextField select
label="Dispositivo"
disabled={Boolean(initialDeviceId)}
{...fieldProps('deviceId')}>
                {deviceOptions.map((device) => (
                  <MenuItem key={device.id}
value={device.id}>
                    {device.imei} · {device.model} · SIM {device.carrier}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField
                label="IMEI"
                placeholder="15 dígitos"
                autoFocus
                inputProps={{ inputMode: 'numeric', maxLength: 15 }}
                {...fieldProps('imei')}
                helperText={(touched.imei && errors.imei) || 'Puedes usar un lector de código de barras: escanea la etiqueta del equipo.'}
              />
            )}

            {selectedDevice?.unitId && selectedDevice.unitId !== values.unitId && (
              <Alert severity="warning">
                Este GPS está instalado en {selectedDevice.unitLabel}. Al guardar se desvincula de esa unidad.
              </Alert>
            )}
            {unitDevice && unitDevice.id !== selectedDevice?.id && (
              <Alert severity="info">
                La unidad ya tiene el GPS {unitDevice.imei}; regresará al almacén.
              </Alert>
            )}

            <TextField label="Nota (opcional)"
multiline
minRows={2}
{...fieldProps('note')}
placeholder="Ej. instalado por Taller Monterrey, orden 4512" />

            {formik.status && <Alert severity="error">{formik.status}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit"
variant="contained"
disabled={formik.isSubmitting}>
            {isReassign ? 'Reasignar' : 'Asignar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

GpsDeviceAssignDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  units: PropTypes.array,
  devices: PropTypes.array,
  initialUnitId: PropTypes.string,
  initialDeviceId: PropTypes.string,
};
