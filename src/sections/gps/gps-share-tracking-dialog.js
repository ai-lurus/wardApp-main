import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { TRACKING_VALIDITY, createTrackingToken } from 'src/utils/gps-tracking';

const DEFAULT_OPTIONS = { showEta: true, showDriver: false, validity: '24h' };

// Builds a public tracking link for a trip that a customer can open without logging in.
export const GpsShareTrackingDialog = ({ trip, onClose }) => {
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOptions(DEFAULT_OPTIONS);
    setCopied(false);
  }, [trip]);

  const link = useMemo(() => {
    if (!trip || typeof window === 'undefined') return '';
    return `${window.location.origin}/track/${createTrackingToken({ tripId: trip.id, ...options })}`;
  }, [trip, options]);

  const update = (patch) => {
    setOptions((current) => ({ ...current, ...patch }));
    setCopied(false);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch (err) {
      console.warn('Clipboard unavailable:', err.message);
      setCopied(false);
    }
  };

  return (
    <Dialog open={Boolean(trip)}
onClose={onClose}
fullWidth
maxWidth="sm">
      {trip && (
        <>
          <DialogTitle>Compartir seguimiento</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5}>
              <Typography variant="body2"
color="text.secondary">
                Viaje {trip.id}: {trip.origin} → {trip.destination}. Quien abra el enlace verá el mapa, el estado y el avance,
                sin placas completas ni teléfonos, y sin necesidad de iniciar sesión.
              </Typography>
              <FormControlLabel
                control={<Switch checked={options.showEta}
onChange={(event) => update({ showEta: event.target.checked })} />}
                label="Mostrar hora estimada de llegada"
              />
              <FormControlLabel
                control={<Switch checked={options.showDriver}
onChange={(event) => update({ showDriver: event.target.checked })} />}
                label="Mostrar nombre del operador (solo el nombre de pila)"
              />
              <TextField select
label="Vigencia"
value={options.validity}
onChange={(event) => update({ validity: event.target.value })}>
                {Object.entries(TRACKING_VALIDITY).map(([key, config]) => (
                  <MenuItem key={key}
value={key}>
                    {config.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Enlace"
                value={link}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button size="small"
onClick={copy}>
                        {copied ? 'Copiado' : 'Copiar'}
                      </Button>
                    </InputAdornment>
                  ),
                }}
                onFocus={(event) => event.target.select()}
              />
              {copied && <Alert severity="success">Enlace copiado. Puedes pegarlo en WhatsApp o en un correo.</Alert>}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Cerrar</Button>
            <Button component="a"
href={link}
target="_blank"
rel="noopener noreferrer"
variant="contained">
              Abrir vista del cliente
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

GpsShareTrackingDialog.propTypes = { trip: PropTypes.object, onClose: PropTypes.func };
