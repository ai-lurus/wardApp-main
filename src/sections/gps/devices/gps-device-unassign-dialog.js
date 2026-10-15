import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';

// Confirms unlinking a device from its unit and records the reason in the assignment history.
export const GpsDeviceUnassignDialog = ({ device, onClose, onConfirm }) => {
  const [note, setNote] = useState('');

  const handleConfirm = async () => {
    await onConfirm({ deviceId: device.id, note });
    setNote('');
  };

  return (
    <Dialog open={Boolean(device)}
onClose={onClose}
fullWidth
maxWidth="xs">
      <DialogTitle>Desvincular GPS</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          {device && `El GPS ${device.imei} dejará de reportar para ${device.unitLabel} y regresará al almacén.`}
        </DialogContentText>
        <TextField
          label="Motivo"
          placeholder="Ej. unidad a taller, cambio de equipo"
          fullWidth
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button color="error"
variant="contained"
onClick={handleConfirm}>
          Desvincular
        </Button>
      </DialogActions>
    </Dialog>
  );
};

GpsDeviceUnassignDialog.propTypes = { device: PropTypes.object, onClose: PropTypes.func, onConfirm: PropTypes.func };
