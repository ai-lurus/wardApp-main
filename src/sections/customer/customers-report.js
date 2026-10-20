import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import ArrowDownTrayIcon from '@heroicons/react/24/solid/ArrowDownTrayIcon';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  LinearProgress,
  Stack,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import esLocale from 'date-fns/locale/es';
import { endOfDay, format, startOfDay, subMonths } from 'date-fns';
import { customersApi } from 'src/services/apiService';
import { exportToCsv } from 'src/utils/export-csv';
import { formatCurrency } from 'src/utils/format-currency';

// ApexCharts must be loaded client-side only (no SSR)
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const TOP_N = 10;

const SummaryCard = ({ label, value, color = 'text.primary', sub }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography color="text.secondary"
        variant="overline"
        display="block">
        {label}
      </Typography>
      <Typography variant="h4"
        color={color}
        sx={{ mt: 0.5 }}>
        {value}
      </Typography>
      {sub && (
        <Typography variant="caption"
          color="text.secondary">
          {sub}
        </Typography>
      )}
    </CardContent>
  </Card>
);

export const CustomersReport = () => {
  const [dateFrom, setDateFrom] = useState(subMonths(new Date(), 12));
  const [dateTo, setDateTo] = useState(new Date());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    customersApi
      .report({
        fromDate: dateFrom ? startOfDay(dateFrom).toISOString() : undefined,
        toDate: dateTo ? endOfDay(dateTo).toISOString() : undefined,
      })
      .then((data) => { if (!cancelled) setReport(data); })
      .catch((err) => {
        console.error('Error fetching customer report:', err);
        if (!cancelled) setError('No se pudo cargar el reporte de clientes');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [dateFrom, dateTo]);

  const items = useMemo(() => report?.items || [], [report]);
  const totals = report?.totals;

  const topByRevenue = useMemo(
    () => [...items].filter((i) => i.revenue > 0).sort((a, b) => b.revenue - a.revenue).slice(0, TOP_N),
    [items]
  );

  const mostFrequent = items.slice(0, TOP_N);
  const maxTrips = mostFrequent.length > 0 ? mostFrequent[0].tripCount : 1;

  const chartOptions = useMemo(() => ({
    chart: { type: 'bar', toolbar: { show: false } },
    plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '60%' } },
    colors: ['#6366F1', '#10B981'],
    dataLabels: { enabled: false },
    xaxis: {
      categories: topByRevenue.map((i) => i.name),
      labels: { formatter: (val) => `$${Number(val).toLocaleString('es-MX')}` },
    },
    legend: { position: 'top' },
    grid: { borderColor: '#f0f0f0' },
    tooltip: { y: { formatter: (val) => formatCurrency(val) } },
  }), [topByRevenue]);

  const chartSeries = useMemo(() => [
    { name: 'Ingresos', data: topByRevenue.map((i) => i.revenue) },
    { name: 'Utilidad', data: topByRevenue.map((i) => i.profit) },
  ], [topByRevenue]);

  const handleExport = () => {
    exportToCsv(
      `reporte_clientes_${format(new Date(), 'yyyyMMdd')}.csv`,
      ['Cliente', 'Teléfono', 'Correo', 'Viajes', 'Completados', 'Ingresos', 'Costos', 'Utilidad', 'Margen %', 'Último viaje'],
      items.map((i) => [
        i.name,
        i.phone,
        i.email,
        i.tripCount,
        i.completedCount,
        i.revenue.toFixed(2),
        i.cost.toFixed(2),
        i.profit.toFixed(2),
        i.margin.toFixed(1),
        i.lastTripDate ? format(new Date(i.lastTripDate), 'dd/MM/yyyy') : '',
      ])
    );
  };

  return (
    <Stack spacing={3}>
      {/* Filters */}
      <Card>
        <CardContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}
            adapterLocale={esLocale}>
            <Stack direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems="center">
              <DatePicker
                label="Desde"
                value={dateFrom}
                onChange={setDateFrom}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    sx={{ minWidth: 160 }}
                    InputLabelProps={{ ...params.InputLabelProps, shrink: true }}
                  />
                )}
              />
              <DatePicker
                label="Hasta"
                value={dateTo}
                onChange={setDateTo}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    sx={{ minWidth: 160 }}
                    InputLabelProps={{ ...params.InputLabelProps, shrink: true }}
                  />
                )}
              />
              <Box sx={{ flexGrow: 1 }} />
              <Button
                variant="outlined"
                size="small"
                startIcon={<SvgIcon fontSize="small"><ArrowDownTrayIcon /></SvgIcon>}
                onClick={handleExport}
                disabled={!items.length}
              >
                Exportar CSV
              </Button>
            </Stack>
          </LocalizationProvider>
        </CardContent>
      </Card>

      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : totals && (
        <>
          {/* Summary */}
          <Grid container
            spacing={3}>
            <Grid xs={12}
              sm={6}
              lg={3}>
              <SummaryCard
                label="Clientes con viajes"
                value={totals.customersWithTrips}
                sub={`${totals.tripCount} viajes en el periodo`}
              />
            </Grid>
            <Grid xs={12}
              sm={6}
              lg={3}>
              <SummaryCard
                label="Ingresos"
                value={formatCurrency(totals.revenue)}
                sub={`${totals.completedCount} viajes completados`}
              />
            </Grid>
            <Grid xs={12}
              sm={6}
              lg={3}>
              <SummaryCard
                label="Utilidad"
                value={formatCurrency(totals.profit)}
                color={totals.profit < 0 ? 'error.main' : 'success.main'}
                sub={`Costos: ${formatCurrency(totals.cost)}`}
              />
            </Grid>
            <Grid xs={12}
              sm={6}
              lg={3}>
              <SummaryCard
                label="Margen"
                value={`${totals.margin.toFixed(1)}%`}
              />
            </Grid>
          </Grid>

          <Grid container
            spacing={3}>
            {/* Revenue / profit chart */}
            <Grid xs={12}
              lg={7}>
              <Card sx={{ height: '100%' }}>
                <CardHeader title="Ingresos y utilidad por cliente"
                  subheader={`Top ${TOP_N} por ingresos`} />
                <CardContent>
                  {topByRevenue.length > 0 ? (
                    <Chart
                      options={chartOptions}
                      series={chartSeries}
                      type="bar"
                      height={Math.max(260, topByRevenue.length * 48)}
                    />
                  ) : (
                    <Typography color="text.secondary"
                      sx={{ py: 4, textAlign: 'center' }}>
                      No hay viajes completados con ingreso en este periodo.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Most frequent */}
            <Grid xs={12}
              lg={5}>
              <Card sx={{ height: '100%' }}>
                <CardHeader title="Clientes más frecuentes" />
                <CardContent>
                  {mostFrequent.length > 0 ? (
                    <Stack spacing={2.5}>
                      {mostFrequent.map((c) => (
                        <Box key={c.customerId}>
                          <Stack direction="row"
                            justifyContent="space-between"
                            sx={{ mb: 0.5 }}>
                            <Typography variant="body2">{c.name}</Typography>
                            <Typography variant="body2"
                              color="text.secondary">
                              {c.tripCount} {c.tripCount === 1 ? 'viaje' : 'viajes'}
                            </Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={maxTrips > 0 ? (c.tripCount / maxTrips) * 100 : 0}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Typography color="text.secondary"
                      sx={{ py: 4, textAlign: 'center' }}>
                      No hay viajes ligados a clientes en este periodo.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Detail table */}
            <Grid xs={12}>
              <Card>
                <CardHeader title="Detalle por cliente" />
                <Box sx={{ overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Cliente</TableCell>
                        <TableCell align="right">Viajes</TableCell>
                        <TableCell align="right">Completados</TableCell>
                        <TableCell align="right">Ingresos</TableCell>
                        <TableCell align="right">Costos</TableCell>
                        <TableCell align="right">Utilidad</TableCell>
                        <TableCell align="right">Margen</TableCell>
                        <TableCell align="right">Último viaje</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8}
                            align="center"
                            sx={{ py: 3 }}>
                            <Typography color="text.secondary">Sin datos en este periodo.</Typography>
                          </TableCell>
                        </TableRow>
                      ) : items.map((i) => (
                        <TableRow key={i.customerId}
                          hover>
                          <TableCell>
                            {i.name}
                            {!i.active && (
                              <Chip label="Eliminado"
                                size="small"
                                variant="outlined"
                                sx={{ ml: 1 }} />
                            )}
                          </TableCell>
                          <TableCell align="right">{i.tripCount}</TableCell>
                          <TableCell align="right">{i.completedCount}</TableCell>
                          <TableCell align="right">{formatCurrency(i.revenue)}</TableCell>
                          <TableCell align="right">{formatCurrency(i.cost)}</TableCell>
                          <TableCell align="right">
                            <Typography variant="body2"
                              color={i.profit < 0 ? 'error.main' : 'success.main'}>
                              {formatCurrency(i.profit)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">{`${i.margin.toFixed(1)}%`}</TableCell>
                          <TableCell align="right">
                            {i.lastTripDate ? format(new Date(i.lastTripDate), 'dd/MM/yyyy') : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Stack>
  );
};
