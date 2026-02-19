import Head from 'next/head';
import NextLink from 'next/link';
import { Box, Button, Link, Stack, Typography, Alert } from '@mui/material';
import { Layout as AuthLayout } from 'src/layouts/auth/layout';

const Page = () => {
  return (
    <>
      <Head>
        <title>
          Registro | Ward
        </title>
      </Head>
      <Box
        sx={{
          flex: '1 1 auto',
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <Box
          sx={{
            maxWidth: 550,
            px: 3,
            py: '100px',
            width: '100%'
          }}
        >
          <div>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
              <img
                src="/assets/logos/ward-logo.png"
                alt="Ward.io"
                style={{ height: 48, objectFit: 'contain' }}
              />
            </Box>
            <Stack
              spacing={1}
              sx={{ mb: 3 }}
            >
              <Typography variant="h4">
                Registro
              </Typography>
              <Typography
                color="text.secondary"
                variant="body2"
              >
                ¿Ya tienes cuenta?
                &nbsp;
                <Link
                  component={NextLink}
                  href="/auth/login"
                  underline="hover"
                  variant="subtitle2"
                >
                  Inicia sesión
                </Link>
              </Typography>
            </Stack>
            <Alert severity="warning" sx={{ mb: 2 }}>
              El registro de nuevas cuentas no está disponible en este momento. Contacta al administrador para obtener acceso.
            </Alert>
            <Button
              component={NextLink}
              href="/auth/login"
              fullWidth
              size="large"
              variant="outlined"
            >
              Volver al inicio de sesión
            </Button>
          </div>
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
