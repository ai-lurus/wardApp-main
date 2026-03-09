import { useState } from 'react';
import Head from 'next/head';
import NextLink from 'next/link';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ArrowLeftIcon from '@heroicons/react/24/solid/ArrowLeftIcon';
import { Layout as AuthLayout } from 'src/layouts/auth/layout';
import { authApi } from 'src/services/apiService';

const Page = () => {
  const [sent, setSent] = useState(false);

  const formik = useFormik({
    initialValues: { email: '' },
    validationSchema: Yup.object({
      email: Yup.string().email('Correo inválido').required('Requerido'),
    }),
    onSubmit: async (values, helpers) => {
      try {
        await authApi.forgotPassword(values.email);
        setSent(true);
      } catch {
        helpers.setStatus('Ocurrió un error. Intenta de nuevo.');
      }
    },
  });

  return (
    <>
      <Head>
        <title>Recuperar contraseña | Ward</title>
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
          <Stack spacing={1} sx={{ mb: 3 }}>
            <Typography variant="h4">Recuperar contraseña</Typography>
            <Typography color="text.secondary" variant="body2">
              Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
            </Typography>
          </Stack>

          {sent ? (
            <Alert severity="success" sx={{ mb: 3 }}>
              Si el correo está registrado, recibirás un enlace en breve. Revisa tu bandeja de entrada.
            </Alert>
          ) : (
            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={3}>
                {formik.status && <Alert severity="error">{formik.status}</Alert>}
                <TextField
                  fullWidth
                  label="Correo electrónico"
                  name="email"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && !!formik.errors.email}
                  helperText={formik.touched.email && formik.errors.email}
                />
              </Stack>
              <Button
                fullWidth
                size="large"
                sx={{ mt: 3 }}
                type="submit"
                variant="contained"
                disabled={formik.isSubmitting}
                startIcon={formik.isSubmitting ? <CircularProgress size={18} color="inherit" /> : null}
              >
                {formik.isSubmitting ? 'Enviando...' : 'Enviar enlace'}
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
