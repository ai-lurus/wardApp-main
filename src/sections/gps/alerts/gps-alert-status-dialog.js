import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';
import { ALERT_STATUSES } from 'src/utils/gps-alerts';

const ACTION_LABELS = { in_progress: 'Atender', resolved: 'Resolver', pending: 'Reabrir' };

// Confirms a status change for an alert with an optional note that goes to its history.
export const GpsAlertStatusDialog = ({ request, onClose, onConfirm }) => {
  const [note, setNote] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    setNote('');
    setError(null);
  }, [request]);

  const handleConfirm = async () => {
    try {
      await onConfirm(request.alert.id, request.status, note);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Dialog open={Boolean(request)}
onClose={onClose}
fullWidth
maxWidth="xs">
      {request && (
        <>
          <DialogTitle>
            {ACTION_LABELS[request.status]} alerta
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              {request.alert.unitEco}: {request.alert.title}. Pasará a «{ALERT_STATUSES[request.status].label}».
            </DialogContentText>
            <TextField
              label="Nota (opcional)"
              placeholder={request.status === 'resolved' ? 'Ej. operador confirmó parada por revisión de llanta' : 'Ej. se llamó al operador'}
              multiline
              minRows={2}
              fullWidth
              value={note}
              onChange={(event) => setNote(event.target.value)}
              inputProps={{ maxLength: 300 }}
            />
            {error && <Alert severity="error"
sx={{ mt: 2 }}>{error}</Alert>}
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Cancelar</Button>
            <Button variant="contained"
onClick={handleConfirm}>
              {ACTION_LABELS[request.status]}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

GpsAlertStatusDialog.propTypes = { request: PropTypes.object, onClose: PropTypes.func, onConfirm: PropTypes.func };
