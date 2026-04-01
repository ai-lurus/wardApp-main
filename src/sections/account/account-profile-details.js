import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  TextField,
} from '@mui/material';
import { authApi } from 'src/services/apiService';

export const AccountProfileDetails = () => {
  const [values, setValues] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (values.newPassword !== values.confirmPassword) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }
    if (values.newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      await authApi.changePassword(values.currentPassword, values.newPassword);
      setSuccess(true);
      setValues({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.error ?
        `${'Error al guardar la contraseña: ' + err.response?.data?.error}` :
        'Error al guardar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form autoComplete="off"
noValidate
onSubmit={handleSubmit}>
      <Card>
        <CardHeader
          title="Cambiar contraseña"
          subheader="Ingresa tu contraseña actual y la nueva"
        />
        <CardContent sx={{ pt: 0 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {success && (
              <Alert severity="success">Contraseña actualizada correctamente</Alert>
            )}
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              fullWidth
              label="Contraseña actual"
              name="currentPassword"
              type="password"
              value={values.currentPassword}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              label="Nueva contraseña"
              name="newPassword"
              type="password"
              value={values.newPassword}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              label="Confirmar nueva contraseña"
              name="confirmPassword"
              type="password"
              value={values.confirmPassword}
              onChange={handleChange}
              required
            />
          </Box>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button variant="contained"
type="submit"
disabled={loading}>
            {loading ? 'Guardando...' : 'Cambiar contraseña'}
          </Button>
        </CardActions>
      </Card>
    </form>
  );
};
