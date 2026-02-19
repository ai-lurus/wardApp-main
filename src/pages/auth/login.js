import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { useAuth } from 'src/hooks/use-auth';
import { Layout as AuthLayout } from 'src/layouts/auth/layout';

const Page = () => {
  const router = useRouter();
  const auth = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: 'admin@demo.com',
      password: 'demo123',
      submit: null
    },
    validationSchema: Yup.object({
      email: Yup
        .string()
        .email('Ingresa un correo válido')
        .max(255)
        .required('El correo es obligatorio'),
      password: Yup
        .string()
        .max(255)
        .required('La contraseña es obligatoria')
    }),
    onSubmit: async (values, helpers) => {
      try {
        await auth.signIn(values.email, values.password);
        router.push('/');
      } catch (err) {
        helpers.setStatus({ success: false });
        const message = err.response?.data?.message || err.message || 'Error al iniciar sesión';
        helpers.setErrors({ submit: message });
        helpers.setSubmitting(false);
      }
    }
  });

  return (
    <>
      <Head>
        <title>Iniciar sesión | Ward</title>
      </Head>
      <Box
        sx={{
          backgroundColor: 'background.paper',
          flex: '1 1 auto',
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <Box
          sx={{
            maxWidth: 480,
            px: 3,
            py: { xs: 6, sm: 10 },
            width: '100%'
          }}
        >
          <Stack spacing={1} sx={{ mb: 3 }}>
            <Typography variant="h4">
              Iniciar sesión
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Ingresa con las credenciales de tu cuenta.
            </Typography>
          </Stack>

          <form noValidate onSubmit={formik.handleSubmit}>
            <Stack spacing={3}>
              <TextField
                error={!!(formik.touched.email && formik.errors.email)}
                fullWidth
                helperText={formik.touched.email && formik.errors.email}
                label="Correo electrónico"
                name="email"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                type="email"
                value={formik.values.email}
              />
              <TextField
                error={!!(formik.touched.password && formik.errors.password)}
                fullWidth
                helperText={formik.touched.password && formik.errors.password}
                label="Contraseña"
                name="password"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                type={showPassword ? 'text' : 'password'}
                value={formik.values.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                        size="small"
                        tabIndex={-1}
                      >
                        {showPassword
                          ? <EyeSlashIcon style={{ width: 20, height: 20 }} />
                          : <EyeIcon style={{ width: 20, height: 20 }} />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Stack>

            {formik.errors.submit && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {formik.errors.submit}
              </Alert>
            )}

            <Button
              fullWidth
              size="large"
              sx={{ mt: 3 }}
              type="submit"
              variant="contained"
              disabled={formik.isSubmitting}
              startIcon={formik.isSubmitting
                ? <CircularProgress size={18} color="inherit" />
                : null}
            >
              {formik.isSubmitting ? 'Ingresando...' : 'Ingresar'}
            </Button>

            <Alert severity="info" sx={{ mt: 2 }}>
              Demo: <b>admin@demo.com</b> / <b>demo123</b>
            </Alert>
          </form>
        </Box>
      </Box>
    </>
  );
};

Page.getLayout = (page) => (
  <AuthLayout>
    {page}
  </AuthLayout>
);

export default Page;
