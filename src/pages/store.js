import { useEffect, useState } from 'react';
import Head from 'next/head';
import NextLink from 'next/link';
import ArchiveBoxIcon from '@heroicons/react/24/solid/ArchiveBoxIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/solid/ExclamationTriangleIcon';
import CurrencyDollarIcon from '@heroicons/react/24/solid/CurrencyDollarIcon';
import ArrowsRightLeftIcon from '@heroicons/react/24/solid/ArrowsRightLeftIcon';
import ArrowDownOnSquareIcon from '@heroicons/react/24/solid/ArrowDownOnSquareIcon';
import ArrowUpOnSquareIcon from '@heroicons/react/24/solid/ArrowUpOnSquareIcon';
import ArrowRightIcon from '@heroicons/react/24/solid/ArrowRightIcon';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Container,
  Stack,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { dashboardApi, inventoryApi } from 'src/services/apiService';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalMaterials: 0, lowStockCount: 0, totalValue: 0, recentMovementsCount: 0 });
  const [recentMovements, setRecentMovements] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, movResult, alertsData] = await Promise.all([
          dashboardApi.getStats(),
          inventoryApi.listMovements({ limit: 5 }),
          inventoryApi.getAlerts(),
        ]);

        setStats({
          totalMaterials: statsData.totalMaterials,
          lowStockCount: statsData.lowStockCount,
          totalValue: statsData.totalInventoryValue,
          recentMovementsCount: statsData.recentMovementsCount,
        });
        setRecentMovements(movResult.items);
        setAlerts(alertsData);
      } catch (err) {
        console.error('Error fetching store data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Head>
        <title>Almacén | Ward</title>
      </Head>
      <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Typography variant="h4">{t('store')}</Typography>

            {/* KPI Cards */}
            <Grid container spacing={3}>
              <Grid xs={12} sm={6} lg={3}>
                <KpiCard
                  title={t('totalMaterials')}
                  value={stats.totalMaterials}
                  icon={<ArchiveBoxIcon />}
                  color="primary.main"
                />
              </Grid>
              <Grid xs={12} sm={6} lg={3}>
                <KpiCard
                  title={t('lowStock')}
                  value={stats.lowStockCount}
                  icon={<ExclamationTriangleIcon />}
                  color="warning.main"
                />
              </Grid>
              <Grid xs={12} sm={6} lg={3}>
                <KpiCard
                  title={t('inventoryValue')}
                  value={`$${stats.totalValue.toLocaleString()}`}
                  icon={<CurrencyDollarIcon />}
                  color="success.main"
                />
              </Grid>
              <Grid xs={12} sm={6} lg={3}>
                <KpiCard
                  title={t('recentMovements')}
                  value={stats.recentMovementsCount}
                  icon={<ArrowsRightLeftIcon />}
                  color="info.main"
                />
              </Grid>
            </Grid>

            {/* Quick Actions */}
            <Card>
              <CardHeader title="Acciones Rápidas" />
              <CardContent>
                <Stack direction="row" spacing={2}>
                  <Button
                    component={NextLink}
                    href="/movements"
                    startIcon={
                      <SvgIcon fontSize="small">
                        <ArrowDownOnSquareIcon />
                      </SvgIcon>
                    }
                    variant="contained"
                    color="success"
                  >
                    {t('registerEntry')}
                  </Button>
                  <Button
                    component={NextLink}
                    href="/movements"
                    startIcon={
                      <SvgIcon fontSize="small">
                        <ArrowUpOnSquareIcon />
                      </SvgIcon>
                    }
                    variant="contained"
                    color="warning"
                  >
                    {t('registerExit')}
                  </Button>
                  <Button
                    component={NextLink}
                    href="/materials"
                    startIcon={
                      <SvgIcon fontSize="small">
                        <ArchiveBoxIcon />
                      </SvgIcon>
                    }
                    variant="outlined"
                  >
                    {t('materials')}
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            <Grid container spacing={3}>
              {/* Recent Movements */}
              <Grid xs={12} lg={8}>
                <Card sx={{ height: '100%' }}>
                  <CardHeader
                    title="Últimos Movimientos"
                    action={
                      <Button
                        component={NextLink}
                        href="/movements"
                        color="inherit"
                        endIcon={
                          <SvgIcon fontSize="small">
                            <ArrowRightIcon />
                          </SvgIcon>
                        }
                        size="small"
                      >
                        Ver todos
                      </Button>
                    }
                  />
                  <Box sx={{ overflowX: 'auto' }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Material</TableCell>
                          <TableCell>Tipo</TableCell>
                          <TableCell>Cantidad</TableCell>
                          <TableCell>Usuario</TableCell>
                          <TableCell>Fecha</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recentMovements.map((mov) => (
                          <TableRow key={mov.id} hover>
                            <TableCell>{mov.materialName}</TableCell>
                            <TableCell>
                              <Chip
                                label={mov.type === 'entry' ? t('entry') : t('exit')}
                                color={mov.type === 'entry' ? 'success' : 'warning'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{mov.quantity}</TableCell>
                            <TableCell>{mov.createdBy}</TableCell>
                            <TableCell>
                              {new Date(mov.movementDate).toLocaleDateString('es-MX')}
                            </TableCell>
                          </TableRow>
                        ))}
                        {recentMovements.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} align="center">
                              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                                Sin movimientos recientes
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </Box>
                </Card>
              </Grid>

              {/* Low Stock Alerts */}
              <Grid xs={12} lg={4}>
                <Card sx={{ height: '100%' }}>
                  <CardHeader
                    title="Stock Bajo"
                    subheader={`${alerts.length} materiales`}
                    action={
                      <Button
                        component={NextLink}
                        href="/alerts"
                        color="inherit"
                        endIcon={
                          <SvgIcon fontSize="small">
                            <ArrowRightIcon />
                          </SvgIcon>
                        }
                        size="small"
                      >
                        Ver todos
                      </Button>
                    }
                  />
                  <CardContent>
                    <Stack spacing={2}>
                      {alerts.slice(0, 5).map((alert) => (
                        <Stack
                          key={alert.id}
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          spacing={2}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" noWrap>
                              {alert.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {alert.categoryName}
                            </Typography>
                          </Box>
                          <Chip
                            label={`${alert.currentStock} / ${alert.minStock}`}
                            color="error"
                            size="small"
                            variant="outlined"
                          />
                        </Stack>
                      ))}
                      {alerts.length === 0 && (
                        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                          Sin alertas de stock bajo
                        </Typography>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
