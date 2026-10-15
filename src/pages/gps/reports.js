import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { format, subDays } from 'date-fns';
import ArrowDownTrayIcon from '@heroicons/react/24/solid/ArrowDownTrayIcon';
import MagnifyingGlassIcon from '@heroicons/react/24/solid/MagnifyingGlassIcon';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  InputAdornment,
  Skeleton,
  Stack,
  SvgIcon,
  TextField,
  Typography,
} from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { GpsReportsChart } from 'src/sections/gps/reports/gps-reports-chart';
import { GpsReportsTable } from 'src/sections/gps/reports/gps-reports-table';
import { gpsApi } from 'src/services/apiService';
import { downloadCsv, formatHours, groupByUnit, kmByDay, summarize } from 'src/utils/gps-reports';
import { normalizeSearch } from 'src/utils/gps-search';

const RANGES = [
  { key: 'today', label: 'Hoy', days: 1 },
  { key: '7d', label: '7 días', days: 7 },
  { key: '30d', label: '30 días', days: 30 },
  { key: 'custom', label: 'Personalizado' },
];
const MAX_DAYS_BACK = 29;
const isoDay = (date) => format(date, 'yyyy-MM-dd');

const SummaryCard = ({ label, value, sub, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
      <Typography color="text.secondary"
variant="overline"
display="block"
sx={{ lineHeight: 1.4 }}>
        {label}
      </Typography>
      <Typography variant="h5"
color={color || 'text.primary'}
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

const Page = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('7d');
  const [custom, setCustom] = useState({ from: isoDay(subDays(new Date(), 13)), to: isoDay(new Date()) });
  const [search, setSearch] = useState('');

  useEffect(() => {
    gpsApi
      .listDailyStats()
      .then(setStats)
      .catch((err) => console.error('Error loading GPS reports:', err))
      .finally(() => setLoading(false));
  }, []);

  const period = useMemo(() => {
    if (range === 'custom') return custom.from <= custom.to ? custom : { from: custom.to, to: custom.from };
    const { days } = RANGES.find((item) => item.key === range);
    return { from: isoDay(subDays(new Date(), days - 1)), to: isoDay(new Date()) };
  }, [range, custom]);

  const rows = useMemo(() => {
    const needle = normalizeSearch(search);
    return stats.filter(
      (row) =>
        row.date >= period.from &&
        row.date <= period.to &&
        (!needle || [row.unitEco, row.unitPlate, row.driverName].some((field) => normalizeSearch(field).includes(needle)))
    );
  }, [stats, period, search]);

  const byUnit = useMemo(() => groupByUnit(rows), [rows]);
  const byDay = useMemo(() => kmByDay(rows), [rows]);
  const totals = useMemo(() => summarize(rows), [rows]);

  const handleExport = () => {
    const headers = ['Unidad', 'Placa', 'Operador', 'Km', 'Horas en movimiento', 'Horas detenido', 'Paradas', 'Paradas no autorizadas', 'Excesos de velocidad', 'Diésel estimado (L)', 'Cumplimiento de ruta (%)', 'Retraso promedio (min)', 'Días con operación'];
    const data = byUnit.map((row) => [
      row.unitEco,
      row.unitPlate,
      row.driverName,
      row.km,
      (row.movingMinutes / 60).toFixed(1),
      (row.stoppedMinutes / 60).toFixed(1),
      row.stops,
      row.unauthorizedStops,
      row.speeding,
      row.dieselLiters,
      row.compliancePct ?? '',
      row.avgDelayMinutes ?? '',
      row.activeDays,
    ]);
    downloadCsv(`reporte-gps_${period.from}_a_${period.to}.csv`, headers, data);
  };

  const summary = [
    { label: 'Kilómetros', value: totals.km.toLocaleString('es-MX'), sub: `${totals.activeDays} días-unidad con operación` },
    { label: 'En movimiento', value: formatHours(totals.movingMinutes), sub: `Detenido ${formatHours(totals.stoppedMinutes)}` },
    { label: 'Paradas', value: totals.stops.toLocaleString('es-MX'), sub: `${totals.unauthorizedStops} no autorizadas`, color: totals.unauthorizedStops ? 'error.main' : undefined },
    { label: 'Excesos de velocidad', value: totals.speeding, color: totals.speeding ? 'warning.main' : undefined },
    { label: 'Diésel estimado', value: `${totals.dieselLiters.toLocaleString('es-MX')} L`, sub: 'A 2.6 km/L' },
    { label: 'Cumplimiento de ruta', value: totals.compliancePct === null ? '—' : `${totals.compliancePct}%`, sub: totals.avgDelayMinutes === null ? 'Sin viajes' : `Retraso promedio ${totals.avgDelayMinutes > 0 ? '+' : ''}${totals.avgDelayMinutes} min` },
  ];

  return (
    <>
      <Head>
        <title>Reportes GPS | Ward</title>
      </Head>
      <Box component="main"
sx={{ flexGrow: 1, py: { xs: 4, lg: 3 } }}>
        <Container maxWidth="xl">
          <Stack spacing={2.5}>
            <Stack direction={{ xs: 'column', sm: 'row' }}
justifyContent="space-between"
alignItems={{ sm: 'center' }}
spacing={1.5}>
              <Stack spacing={0.5}>
                <Stack direction="row"
spacing={1.5}
alignItems="center">
                  <Typography variant="h4"
component="h1">Reportes GPS</Typography>
                  <Chip label="Demo"
color="primary"
size="small"
variant="outlined" />
                </Stack>
                <Typography color="text.secondary"
variant="body2">
                  Kilometraje, tiempos, paradas, excesos, diésel y cumplimiento por unidad.
                </Typography>
              </Stack>
              <Button
                variant="contained"
                onClick={handleExport}
                disabled={!byUnit.length}
                startIcon={(
                  <SvgIcon fontSize="small">
                    <ArrowDownTrayIcon />
                  </SvgIcon>
                )}
              >
                Exportar a Excel
              </Button>
            </Stack>

            <Card sx={{ p: 2 }}>
              <Stack direction={{ xs: 'column', md: 'row' }}
spacing={1.5}
alignItems={{ md: 'center' }}>
                <Stack direction="row"
sx={{ gap: 0.75, overflowX: 'auto', flexShrink: 0, pb: { xs: 0.5, md: 0 } }}
role="group"
aria-label="Periodo">
                  {RANGES.map(({ key, label }) => (
                    <Chip
                      key={key}
                      label={label}
                      color={range === key ? 'primary' : 'default'}
                      variant={range === key ? 'filled' : 'outlined'}
                      onClick={() => setRange(key)}
                      aria-pressed={range === key}
                    />
                  ))}
                </Stack>
                {range === 'custom' && (
                  <Stack direction="row"
spacing={1}>
                    {['from', 'to'].map((field) => (
                      <TextField
                        key={field}
                        type="date"
                        size="small"
                        label={field === 'from' ? 'Desde' : 'Hasta'}
                        value={custom[field]}
                        onChange={(event) => setCustom((current) => ({ ...current, [field]: event.target.value }))}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ min: isoDay(subDays(new Date(), MAX_DAYS_BACK)), max: isoDay(new Date()) }}
                      />
                    ))}
                  </Stack>
                )}
                <TextField
                  size="small"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar unidad, placa u operador"
                  inputProps={{ 'aria-label': 'Buscar unidad, placa u operador' }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SvgIcon fontSize="small"
color="action">
                          <MagnifyingGlassIcon />
                        </SvgIcon>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ flexGrow: 1 }}
                />
              </Stack>
            </Card>

            {loading ? (
              <Skeleton variant="rounded"
height={420} />
            ) : (
              <>
                <Box>
                  <Grid container
spacing={2}>
                    {summary.map((item) => (
                      <Grid item
xs={6}
md={4}
xl={2}
key={item.label}>
                        <SummaryCard {...item} />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
                <GpsReportsChart byUnit={byUnit}
byDay={byDay} />
                <Typography variant="h6">Por unidad ({byUnit.length})</Typography>
                {byUnit.length ? (
                  <GpsReportsTable rows={byUnit} />
                ) : (
                  <Card sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">No hay datos para este periodo o búsqueda.</Typography>
                  </Card>
                )}
              </>
            )}
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
