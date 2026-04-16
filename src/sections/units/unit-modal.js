import { Box, Button, MenuItem, Modal, Stack, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
// import { useEffect } from 'react';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 650,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const UNIT_TYPES = [
  { value: 'caja_seca', label: 'Caja Seca' },
  { value: 'refrigerado', label: 'Refrigerado' },
  { value: 'plataforma', label: 'Plataforma' },
  { value: 'volteo', label: 'Volteo' },
  { value: 'pipa', label: 'Pipa' },
  { value: 'otro', label: 'Otro' },
];

export const UnitModal = ({ open, onClose, onSave, unit }) => {
  const isEdit = Boolean(unit);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      matricula: unit?.matricula || '',
      marca: unit?.marca || '',
      modelo: unit?.modelo || '',
      year: unit?.year ? String(unit.year) : '',
      type: unit?.type || '',
      axesNumber: unit?.axesNumber ? String(unit.axesNumber) : '',
      vin: unit?.vin || '',
      fuelEfficiency: unit?.fuelEfficiency ? String(unit.fuelEfficiency) : '',
      insuranceExpiration: unit?.insuranceExpiration ? unit.insuranceExpiration.split('T')[0] : '',
      lastMaintenance: unit?.lastMaintenance ? unit.lastMaintenance.split('T')[0] : '',
      notes: unit?.notes || '',
    },
    validationSchema: Yup.object({
      matricula: Yup.string().required('La matrícula es requerida'),
      marca: Yup.string(),
      modelo: Yup.string(),
      year: Yup.number().nullable(),
      type: Yup.string(),
      axesNumber: Yup.number().min(2, 'Min 2').max(9, 'Max 9').required('El número de ejes es requerido'),
      vin: Yup.string().length(17, 'El VIN debe tener exactamente 17 caracteres').nullable(),
      fuelEfficiency: Yup.number().nullable(),
      insuranceExpiration: Yup.string().nullable(),
      lastMaintenance: Yup.string().nullable(),
      notes: Yup.string().nullable(),
    }),
    onSubmit: (values) => {
      onSave(values);
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
          {isEdit ? 'Editar Unidad' : 'Nueva Unidad'}
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              id="matricula"
              label="Matrícula"
              name="matricula"
              value={formik.values.matricula}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.matricula && Boolean(formik.errors.matricula)}
              helperText={formik.touched.matricula && formik.errors.matricula}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                id="marca"
                label="Marca"
                name="marca"
                value={formik.values.marca}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <TextField
                fullWidth
                id="modelo"
                label="Modelo"
                name="modelo"
                value={formik.values.modelo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <TextField
                fullWidth
                id="year"
                label="Año"
                type="number"
                name="year"
                value={formik.values.year}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                select
                label="Tipo de unidad"
                name="type"
                InputLabelProps={{ htmlFor: '' }}
                SelectProps={{ inputProps: { id: 'type-select', name: 'type' } }}
                value={formik.values.type}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <MenuItem value="">Seleccione</MenuItem>
                {UNIT_TYPES.map((t) => (
                  <MenuItem key={t.value} value={t.value}>
                    {t.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                select
                label="Número de ejes"
                name="axesNumber"
                InputLabelProps={{ htmlFor: '' }}
                SelectProps={{ inputProps: { id: 'axesNumber-select', name: 'axesNumber' } }}
                value={formik.values.axesNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.axesNumber && Boolean(formik.errors.axesNumber)}
                helperText={formik.touched.axesNumber && formik.errors.axesNumber}
              >
                <MenuItem value="">Seleccione</MenuItem>
                {[2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <MenuItem key={num} value={String(num)}>
                    {num}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            <TextField
              fullWidth
              id="vin"
              label="VIN"
              name="vin"
              value={formik.values.vin}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />

            <TextField
              fullWidth
              id="fuelEfficiency"
              label="Rendimiento (km/l)"
              type="number"
              inputProps={{ step: "0.1" }}
              name="fuelEfficiency"
              value={formik.values.fuelEfficiency}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />

            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                id="insuranceExpiration"
                label="Vencimiento de seguro"
                type="date"
                InputLabelProps={{ shrink: true }}
                name="insuranceExpiration"
                value={formik.values.insuranceExpiration}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <TextField
                fullWidth
                id="lastMaintenance"
                label="Fecha último mantenimiento"
                type="date"
                InputLabelProps={{ shrink: true }}
                name="lastMaintenance"
                value={formik.values.lastMaintenance}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Stack>

            <TextField
              fullWidth
              id="notes"
              label="Notas"
              multiline
              rows={3}
              name="notes"
              value={formik.values.notes}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button onClick={handleClose}>Cancelar</Button>
              <Button type="submit" variant="contained">
                Guardar
              </Button>
            </Stack>
          </Stack>
        </form>
      </Box>
    </Modal>
  );
};
