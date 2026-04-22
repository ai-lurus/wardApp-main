import { Card, CardContent, Box, Stack, Typography, Avatar, SvgIcon } from '@mui/material';
import TruckIcon from '@heroicons/react/24/solid/TruckIcon';
import ArrowsRightLeftIcon from '@heroicons/react/24/solid/ArrowsRightLeftIcon';
import CheckCircleIcon from '@heroicons/react/24/solid/CheckCircleIcon';
import ArrowTrendingUpIcon from '@heroicons/react/24/solid/ArrowTrendingUpIcon';
import ArrowTrendingDownIcon from '@heroicons/react/24/solid/ArrowTrendingDownIcon';

export const TripsSummary = ({ trips = [] }) => {
  // Calculos de ejemplo usando los datos de la tabla
  const totalViajes = trips.length;
  const enTransito = trips.filter(t => t.status === 'en_curso').length;
  const completados = trips.filter(t => t.status === 'completado').length;

  // Eficiencia de Costos: Diferencia entre presupuesto estimado y costo real de la operación
  let eficiencia = 0;
  const tripsConCostoReal = trips.filter(t => t.status === 'completado' && t.actualCost && t.estimatedCost);

  if (tripsConCostoReal.length > 0) {
    const totalEst = tripsConCostoReal.reduce((acc, t) => acc + (t.estimatedCost?.total || 0), 0);
    const totalReal = tripsConCostoReal.reduce((acc, t) => acc + (t.actualCost?.total || 0), 0);
    
    if (totalEst > 0) {
      eficiencia = ((totalEst - totalReal) / totalEst) * 100;
    }
  }

  const signo = eficiencia > 0 ? '+' : '';
  const eficienciaFormatted = tripsConCostoReal.length > 0 ? `${signo}${eficiencia.toFixed(1)}%` : '0.0%';

  const metrics = [
    {
      title: 'TOTAL VIAJES',
      value: totalViajes.toString(),
      icon: <TruckIcon />,
      color: 'secondary' // primary=indigo, secondary=purple usually. We will use hex colors to match the exact requirement
    },
    {
      title: 'EN TRÁNSITO',
      value: enTransito.toString(),
      icon: <ArrowsRightLeftIcon />,
      color: 'info'
    },
    {
      title: 'COMPLETADOS',
      value: completados.toString(),
      icon: <CheckCircleIcon />,
      color: 'success'
    },
    {
      title: 'EFICIENCIA DE COSTOS',
      value: eficienciaFormatted,
      icon: eficiencia >= 0 ? <ArrowTrendingUpIcon /> : <ArrowTrendingDownIcon />,
      color: eficiencia >= 0 ? 'success' : 'error'
    }
  ];

  const getColorStyles = (color) => {
    switch (color) {
      case 'secondary':
        return {
          bgcolor: 'rgba(156, 39, 176, 0.1)',
          color: '#9c27b0'
        };
      case 'info':
        return {
          bgcolor: 'rgba(33, 150, 243, 0.1)',
          color: '#2196f3'
        };
      case 'success':
        return {
          bgcolor: 'rgba(76, 175, 80, 0.1)',
          color: '#4caf50'
        };
      case 'error':
        return {
          bgcolor: 'rgba(244, 67, 54, 0.1)',
          color: '#f44336'
        };
      default:
        return {
          bgcolor: 'rgba(99, 102, 241, 0.1)',
          color: '#6366f1'
        };
    }
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 3,
        gridTemplateColumns: {
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(4, 1fr)'
        }
      }}
    >
      {metrics.map((metric, idx) => {
        const styles = getColorStyles(metric.color);
        return (
          <Card
            key={idx}
            sx={{
              height: '100%',
              borderRadius: 3,
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)',
              transition: 'box-shadow 0.3s ease, transform 0.3s ease',
              '&:hover': {
                boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.08)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Stack direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={3}>
                <Stack spacing={1}>
                  <Typography
                    color="text.secondary"
                    variant="overline"
                    sx={{
                      fontWeight: 600,
                      letterSpacing: 1.2,
                      opacity: 0.8
                    }}
                  >
                    {metric.title}
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      color: 'text.primary',
                      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'
                    }}
                  >
                    {metric.value}
                  </Typography>
                </Stack>
                <Avatar
                  sx={{
                    backgroundColor: styles.bgcolor,
                    color: styles.color,
                    height: 56,
                    width: 56
                  }}
                >
                  <SvgIcon sx={{ fontSize: 28 }}>
                    {metric.icon}
                  </SvgIcon>
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
};
