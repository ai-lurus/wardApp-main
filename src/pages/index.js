import { useEffect, useState } from 'react';
import Head from 'next/head';
import NextLink from 'next/link';
import ArchiveBoxIcon from '@heroicons/react/24/solid/ArchiveBoxIcon';
import ArrowDownOnSquareIcon from '@heroicons/react/24/solid/ArrowDownOnSquareIcon';
import ArrowUpOnSquareIcon from '@heroicons/react/24/solid/ArrowUpOnSquareIcon';
import ArrowsRightLeftIcon from '@heroicons/react/24/solid/ArrowsRightLeftIcon';
import CheckCircleIcon from '@heroicons/react/24/solid/CheckCircleIcon';
import CurrencyDollarIcon from '@heroicons/react/24/solid/CurrencyDollarIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/solid/ExclamationTriangleIcon';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Stack,
  SvgIcon,
  Typography,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { useAuth } from 'src/hooks/use-auth';
import { dashboardApi, inventoryApi } from 'src/services/apiService';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
};

const getFormattedDate = () =>
  new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const KpiCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Stack alignItems="flex-start" direction="row" justifyContent="space-between" spacing={3}>
        <Stack spacing={1}>
          <Typography color="text.secondary" variant="overline">
            {title}
          </Typography>
          <Typography variant="h4">{value}</Typography>
        </Stack>
        <Avatar sx={{ backgroundColor: color, height: 56, width: 56 }}>
          <SvgIcon>{icon}</SvgIcon>
        </Avatar>
      </Stack>
    </CardContent>
  </Card>
);

const Page = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalMaterials: 0, lowStockCount: 0, totalInventoryValue: 0, recentMovementsCount: 0 });
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    Promise.all([
      dashboardApi.getStats(),
      inventoryApi.getAlerts(),
    ])
      .then(([statsData, alertsData]) => {
        setStats(statsData);
        setAlertCount(alertsData.length);
      })
      .catch((err) => console.error('Error fetching dashboard data:', err))
      .finally(() => setLoading(false));
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'usuario';
  const hasAlerts = alertCount > 0;

  return (
    <>
      <Head>
        <title>Inicio | Ward</title>
      </Head>
      <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Stack spacing={4}>

            {/* Greeting */}
            <Box>
              <Typography variant="h4" gutterBottom>
                {getGreeting()}, {firstName}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                {getFormattedDate()}
              </Typography>
            </Box>

            {/* Health banner */}
            {!loading && (
              hasAlerts ? (
                <Alert
                  severity="warning"
                  icon={<SvgIcon fontSize="small"><ExclamationTriangleIcon /></SvgIcon>}
                  action={
                    <Chip
                      component={NextLink}
                      href="/alerts"
                      label="Ver alertas"
                      size="small"
                      color="warning"
                      clickable
                    />
                  }
                >
                  Hay <strong>{alertCount} material{alertCount !== 1 ? 'es' : ''}</strong> con stock bajo que requieren atención.
                </Alert>
              ) : (
                <Alert severity="success" icon={<SvgIcon fontSize="small"><CheckCircleIcon /></SvgIcon>}>
                  El inventario está en buen estado. No hay alertas de stock bajo.
                </Alert>
              )
            )}

            {/* KPIs */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3}>
                <Grid xs={12} sm={6} lg={3}>
                  <KpiCard
                    title="Total materiales"
                    value={stats.totalMaterials}
                    icon={<ArchiveBoxIcon />}
                    color="primary.main"
                  />
                </Grid>
                <Grid xs={12} sm={6} lg={3}>
                  <KpiCard
                    title="Stock bajo"
                    value={stats.lowStockCount}
                    icon={<ExclamationTriangleIcon />}
                    color="warning.main"
                  />
                </Grid>
                <Grid xs={12} sm={6} lg={3}>
                  <KpiCard
                    title="Valor del inventario"
                    value={`$${(stats.totalInventoryValue ?? 0).toLocaleString()}`}
                    icon={<CurrencyDollarIcon />}
                    color="success.main"
                  />
                </Grid>
                <Grid xs={12} sm={6} lg={3}>
                  <KpiCard
                    title="Movimientos recientes"
                    value={stats.recentMovementsCount}
                    icon={<ArrowsRightLeftIcon />}
                    color="info.main"
                  />
                </Grid>
              </Grid>
            )}

            <Divider />

            {/* Quick actions */}
            <Card>
              <CardHeader title="Acciones rápidas" />
              <CardContent>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    component={NextLink}
                    href="/movements"
                    startIcon={<SvgIcon fontSize="small"><ArrowDownOnSquareIcon /></SvgIcon>}
                    variant="contained"
                    color="success"
                  >
                    Registrar entrada
                  </Button>
                  <Button
                    component={NextLink}
                    href="/movements"
                    startIcon={<SvgIcon fontSize="small"><ArrowUpOnSquareIcon /></SvgIcon>}
                    variant="contained"
                    color="warning"
                  >
                    Registrar salida
                  </Button>
                  <Button
                    component={NextLink}
                    href="/materials"
                    startIcon={<SvgIcon fontSize="small"><ArchiveBoxIcon /></SvgIcon>}
                    variant="outlined"
                  >
                    Nuevo material
                  </Button>
                </Stack>
              </CardContent>
            </Card>

          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
