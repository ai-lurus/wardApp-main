import { useState } from 'react';
import Head from 'next/head';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import ArrowLeftIcon from '@heroicons/react/24/solid/ArrowLeftIcon';
import { Layout as AuthLayout } from 'src/layouts/auth/layout';
import { authApi } from 'src/services/apiService';

const Page = () => {
  const router = useRouter();
  const { token } = router.query;
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);

  const formik = useFormik({
    initialValues: { newPassword: '', confirmPassword: '' },
    validationSchema: Yup.object({
      newPassword: Yup.string().min(6, 'Mínimo 6 caracteres').required('Requerido'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword')], 'Las contraseñas no coinciden')
        .required('Requerido'),
    }),
    onSubmit: async (values, helpers) => {
      if (!token) {
        helpers.setStatus('Token inválido.');
        return;
      }
      try {
        await authApi.resetPassword(token, values.newPassword);
        setDone(true);
      } catch (err) {
        helpers.setStatus(err.response?.data?.error ?
          `${'Error al guardar la contraseña: ' + err.response?.data?.error}` :
          'Error al guardar la contraseña.');
      }
    },
  });

  return (
    <>
      <Head>
        <title>Nueva contraseña | Ward</title>
      </Head>
      <Box
        sx={{
          backgroundColor: 'background.paper',
          flex: '1 1 auto',
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ maxWidth: 480, px: 3, py: { xs: 6, sm: 10 }, width: '100%' }}>
          <Stack spacing={1}
sx={{ mb: 3 }}>
            <Typography variant="h4">Nueva contraseña</Typography>
            <Typography color="text.secondary"
variant="body2">
              Ingresa tu nueva contraseña para completar el restablecimiento.
            </Typography>
          </Stack>

          {done ? (
            <>
              <Alert severity="success"
sx={{ mb: 3 }}>
                Tu contraseña fue actualizada correctamente.
              </Alert>
              <Button
                fullWidth
                variant="contained"
                size="large"
                component={NextLink}
                href="/auth/login"
              >
                Iniciar sesión
              </Button>
            </>
          ) : (
            <form noValidate
onSubmit={formik.handleSubmit}>
              <Stack spacing={3}>
                {formik.status && <Alert severity="error">{formik.status}</Alert>}
                <TextField
                  fullWidth
                  label="Nueva contraseña"
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formik.values.newPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.newPassword && !!formik.errors.newPassword}
                  helperText={formik.touched.newPassword && formik.errors.newPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((p) => !p)}
                          edge="end"
                          size="small"
                          tabIndex={-1}
                        >
                          {showPassword
                            ? <EyeSlashIcon style={{ width: 20, height: 20 }} />
                            : <EyeIcon style={{ width: 20, height: 20 }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label="Confirmar contraseña"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.confirmPassword && !!formik.errors.confirmPassword}
                  helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                />
              </Stack>
              <Button
                fullWidth
                size="large"
                sx={{ mt: 3 }}
                type="submit"
                variant="contained"
                disabled={formik.isSubmitting}
                startIcon={formik.isSubmitting ? <CircularProgress size={18}
color="inherit" /> : null}
              >
                {formik.isSubmitting ? 'Guardando...' : 'Guardar contraseña'}
              </Button>
            </form>
          )}

          <Link
            component={NextLink}
            href="/auth/login"
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 3 }}
            underline="hover"
            variant="body2"
          >
            <ArrowLeftIcon style={{ width: 16, height: 16 }} />
            Volver al inicio de sesión
          </Link>
        </Box>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <AuthLayout>{page}</AuthLayout>;

export default Page;
