import PropTypes from 'prop-types';
import NextLink from 'next/link';
import { Box, Stack, Typography, Unstable_Grid2 as Grid } from '@mui/material';
import { Logo } from 'src/components/logo';
import {
  ArchiveBoxIcon,
  ArrowsRightLeftIcon,
  BellAlertIcon
} from '@heroicons/react/24/solid';

const features = [
  {
    icon: ArchiveBoxIcon,
    text: 'Gestión completa de materiales y categorías de inventario',
  },
  {
    icon: ArrowsRightLeftIcon,
    text: 'Registro de entradas y salidas con historial detallado',
  },
  {
    icon: BellAlertIcon,
    text: 'Alertas automáticas cuando el stock está por debajo del mínimo',
  },
];

export const Layout = (props) => {
  const { children } = props;

  return (
    <Box
      component="main"
      sx={{ display: 'flex', flex: '1 1 auto' }}
    >
      <Grid
        container
        sx={{ flex: '1 1 auto' }}
      >
        {/* Left panel — form */}
        <Grid
          xs={12}
          lg={6}
          sx={{
            backgroundColor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
          }}
        >
          <Box
            component="header"
            sx={{ left: 0, p: 3, position: 'fixed', top: 0, width: '100%' }}
          >
            <Box
              component={NextLink}
              href="/"
              sx={{ display: 'inline-flex', height: 32, width: 32 }}
            >
              <Logo />
            </Box>
          </Box>
          {children}
        </Grid>

        {/* Right panel — branding */}
        <Grid
          xs={12}
          lg={6}
          sx={{
            alignItems: 'center',
            background: 'radial-gradient(50% 50% at 50% 50%, #122647 0%, #090E23 100%)',
            color: 'white',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Box sx={{ p: 5, maxWidth: 460 }}>
            {/* Logo */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 5 }}>
              <img
                src="/assets/logos/ward-logo-white.png"
                alt="Ward.io"
                style={{ width: '100%', maxWidth: 320, objectFit: 'contain' }}
              />
            </Box>

            {/* Headline */}
            <Typography
              align="center"
              color="inherit"
              sx={{ fontSize: '30px', lineHeight: '38px', fontWeight: 700, mb: 2 }}
              variant="h1"
            >
              Gestiona tu inventario{' '}
              <Box component="span" sx={{ color: '#15B79E' }}>
                con claridad
              </Box>
            </Typography>

            {/* Subtitle */}
            <Typography
              align="center"
              variant="body1"
              sx={{ mb: 5, opacity: 0.7, lineHeight: 1.7 }}
            >
              Plataforma diseñada para empresas de transporte de carga. Todo lo que necesitas para controlar tu inventario en un solo lugar.
            </Typography>

            {/* Feature list */}
            <Stack spacing={3}>
              {features.map(({ icon: Icon, text }) => (
                <Box
                  key={text}
                  sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}
                >
                  <Box
                    sx={{
                      bgcolor: 'rgba(21, 183, 158, 0.15)',
                      border: '1px solid rgba(21, 183, 158, 0.3)',
                      borderRadius: '8px',
                      p: 0.9,
                      display: 'flex',
                      flexShrink: 0,
                      mt: 0.2,
                    }}
                  >
                    <Icon style={{ width: 18, height: 18, color: '#15B79E' }} />
                  </Box>
                  <Typography variant="body2" sx={{ opacity: 0.85, lineHeight: 1.6 }}>
                    {text}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

Layout.propTypes = {
  children: PropTypes.node
};
