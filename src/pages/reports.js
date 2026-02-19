import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import ArrowDownTrayIcon from '@heroicons/react/24/solid/ArrowDownTrayIcon';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Container,
  LinearProgress,
  MenuItem,
  Stack,
  SvgIcon,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import esLocale from 'date-fns/locale/es';
import { subDays, startOfDay, endOfDay, format, isWithinInterval } from 'date-fns';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { inventoryApi } from 'src/services/apiService';

// ApexCharts must be loaded client-side only (no SSR)
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

// ── Helpers ──────────────────────────────────────────────────────────────────

const exportToCsv = (filename, headers, rows) => {
  const lines = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
    ),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const SummaryCard = ({ label, value, color = 'text.primary', sub }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography color="text.secondary" variant="overline" display="block">
        {label}
      </Typography>
      <Typography variant="h4" color={color} sx={{ mt: 0.5 }}>
        {value}
      </Typography>
      {sub && (
        <Typography variant="caption" color="text.secondary">
          {sub}
        </Typography>
      )}
    </CardContent>
  </Card>
);

// ── Tab 1: Movimientos ────────────────────────────────────────────────────────

const MovementsReport = ({ movements, loading }) => {
  const [dateFrom, setDateFrom] = useState(subDays(new Date(), 30));
  const [dateTo, setDateTo] = useState(new Date());
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = useMemo(() => {
    if (!movements.length) return [];
    return movements.filter((m) => {
      const date = new Date(m.movementDate);
      if (isNaN(date.getTime())) return false;
      const inRange = isWithinInterval(date, {
        start: startOfDay(dateFrom || subDays(new Date(), 365)),
        end: endOfDay(dateTo || new Date()),
      });
      const matchesType = typeFilter === 'all' || m.type === typeFilter;
      return inRange && matchesType;
    });
  }, [movements, dateFrom, dateTo, typeFilter]);

  const entries = filtered.filter((m) => m.type === 'entry');
  const exits = filtered.filter((m) => m.type === 'exit');
  const totalEntryQty = entries.reduce((s, m) => s + m.quantity, 0);
  const totalExitQty = exits.reduce((s, m) => s + m.quantity, 0);
  const totalEntryCost = entries.reduce((s, m) => s + (m.totalCost || 0), 0);

  // Build chart series: group by day
  const chartData = useMemo(() => {
    const map = {};
    filtered.forEach((m) => {
      const day = format(new Date(m.movementDate), 'dd/MM/yyyy');
      if (!map[day]) map[day] = { entry: 0, exit: 0 };
      const qty = Number(m.quantity) || 0;
      if (m.type === 'entry') map[day].entry += qty;
      else map[day].exit += qty;
    });
    const days = Object.keys(map).sort((a, b) => {
      const [da, ma, ya] = a.split('/');
      const [db, mb, yb] = b.split('/');
      return new Date(`${ya}-${ma}-${da}`) - new Date(`${yb}-${mb}-${db}`);
    });
    return {
      categories: days,
      entries: days.map((d) => map[d].entry),
      exits: days.map((d) => map[d].exit),
    };
  }, [filtered]);

  const chartOptions = useMemo(() => ({
    chart: { type: 'bar', toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } },
    colors: ['#10B981', '#F59E0B'],
    dataLabels: { enabled: false },
    xaxis: {
      categories: chartData.categories,
      labels: { rotate: -45, style: { fontSize: '11px' } },
    },
    yaxis: { title: { text: 'Cantidad' } },
    legend: { position: 'top' },
    grid: { borderColor: '#f0f0f0' },
    tooltip: {
      y: {
        formatter: (val) => (typeof val !== 'undefined' && val !== null ? `${val} unidades` : val),
      },
    },
  }), [chartData.categories]);

  const chartSeries = useMemo(() => [
    { name: 'Entradas', data: chartData.entries },
    { name: 'Salidas', data: chartData.exits },
  ], [chartData.entries, chartData.exits]);

  const handleExport = () => {
    exportToCsv(
      `movimientos_${format(new Date(), 'yyyyMMdd')}.csv`,
      ['Fecha', 'Material', 'Tipo', 'Cantidad', 'Costo Total', 'Proveedor / Destino', 'Registrado por'],
      filtered.map((m) => [
        format(new Date(m.movementDate), 'dd/MM/yyyy'),
        m.materialName,
        m.type === 'entry' ? 'Entrada' : 'Salida',
        m.quantity,
        m.totalCost ? `$${m.totalCost.toLocaleString()}` : '-',
        m.supplier || m.destination || '-',
        m.createdBy,
      ])
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      {/* Filters */}
      <Card>
        <CardContent>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={esLocale}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
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
              <TextField
                select
                label="Tipo"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                size="small"
                sx={{ minWidth: 160 }}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="entry">Solo entradas</MenuItem>
                <MenuItem value="exit">Solo salidas</MenuItem>
              </TextField>
              <Box sx={{ flexGrow: 1 }} />
              <Button
                variant="outlined"
                size="small"
                startIcon={<SvgIcon fontSize="small"><ArrowDownTrayIcon /></SvgIcon>}
                onClick={handleExport}
                disabled={!filtered.length}
              >
                Exportar CSV
              </Button>
            </Stack>
          </LocalizationProvider>
        </CardContent>
      </Card>

      {/* Summary cards */}
      <Grid container spacing={3}>
        <Grid xs={12} sm={4}>
          <SummaryCard
            label="Total entradas"
            value={totalEntryQty.toLocaleString()}
            color="success.main"
            sub={`${entries.length} movimiento${entries.length !== 1 ? 's' : ''} · $${totalEntryCost.toLocaleString()} invertido`}
          />
        </Grid>
        <Grid xs={12} sm={4}>
          <SummaryCard
            label="Total salidas"
            value={totalExitQty.toLocaleString()}
            color="warning.main"
            sub={`${exits.length} movimiento${exits.length !== 1 ? 's' : ''}`}
          />
        </Grid>
        <Grid xs={12} sm={4}>
          <SummaryCard
            label="Balance neto"
            value={(totalEntryQty - totalExitQty).toLocaleString()}
            color={totalEntryQty >= totalExitQty ? 'success.main' : 'error.main'}
            sub={`${filtered.length} movimientos en el período`}
          />
        </Grid>
      </Grid>

      {/* Chart */}
      {chartData.categories.length > 0 ? (
        <Card>
          <CardHeader title="Entradas vs Salidas por día" />
          <CardContent>
            <Chart
              key={`${chartData.categories.length}-${typeFilter}`}
              type="bar"
              height={300}
              options={chartOptions}
              series={chartSeries}
            />
          </CardContent>
        </Card>
      ) : null}

      {/* Table */}
      <Card>
        <CardHeader
          title="Detalle de movimientos"
          subheader={`${filtered.length} registros en el período seleccionado`}
        />
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Material</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell align="right">Cantidad</TableCell>
                <TableCell align="right">Costo Total</TableCell>
                <TableCell>Proveedor / Destino</TableCell>
                <TableCell>Registrado por</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                      No hay movimientos en el período seleccionado
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((m) => (
                <TableRow key={m.id} hover>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {format(new Date(m.movementDate), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>{m.materialName}</TableCell>
                  <TableCell>
                    <Chip
                      label={m.type === 'entry' ? 'Entrada' : 'Salida'}
                      color={m.type === 'entry' ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">{m.quantity}</TableCell>
                  <TableCell align="right">
                    {m.totalCost ? `$${m.totalCost.toLocaleString()}` : '—'}
                  </TableCell>
                  <TableCell>{m.supplier || m.destination || '—'}</TableCell>
                  <TableCell>{m.createdBy}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Card>
    </Stack>
  );
};

// ── Tab 2: Stock por categoría ────────────────────────────────────────────────

const StockReport = ({ stock, loading }) => {
  const categoryStats = useMemo(() => {
    const map = {};
    stock.forEach((m) => {
      const cat = m.categoryName || 'Sin categoría';
      if (!map[cat]) map[cat] = { materials: 0, totalValue: 0, lowStock: 0 };
      map[cat].materials += 1;
      map[cat].totalValue += (m.currentStock || 0) * (m.referencePrice || 0);
      if (m.currentStock <= m.minStock) map[cat].lowStock += 1;
    });
    return Object.entries(map)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.totalValue - a.totalValue);
  }, [stock]);

  const totalValue = categoryStats.reduce((s, c) => s + c.totalValue, 0);

  const maxValue = categoryStats.length > 0
    ? Math.max(...categoryStats.map((c) => c.totalValue))
    : 1;

  const handleExport = () => {
    exportToCsv(
      `stock_categorias_${format(new Date(), 'yyyyMMdd')}.csv`,
      ['Categoría', 'Materiales', 'Valor Total', 'Con Stock Bajo'],
      categoryStats.map((c) => [
        c.name,
        c.materials,
        `$${c.totalValue.toLocaleString()}`,
        c.lowStock,
      ])
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      {/* Summary */}
      <Grid container spacing={3}>
        <Grid xs={12} sm={4}>
          <SummaryCard
            label="Valor total del inventario"
            value={`$${totalValue.toLocaleString()}`}
            color="success.main"
          />
        </Grid>
        <Grid xs={12} sm={4}>
          <SummaryCard
            label="Total de materiales"
            value={stock.length}
          />
        </Grid>
        <Grid xs={12} sm={4}>
          <SummaryCard
            label="Categorías activas"
            value={categoryStats.length}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Value distribution bars */}
        {categoryStats.length > 0 && (
          <Grid xs={12}>
            <Card>
              <CardHeader title="Valor en inventario por categoría" />
              <CardContent>
                <Stack spacing={2.5}>
                  {categoryStats.map((cat) => (
                    <Box key={cat.name}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="body2">{cat.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          ${cat.totalValue.toLocaleString()}
                          {totalValue > 0 && (
                            <Typography component="span" variant="caption" color="text.disabled" sx={{ ml: 0.5 }}>
                              ({((cat.totalValue / totalValue) * 100).toFixed(1)}%)
                            </Typography>
                          )}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={maxValue > 0 ? (cat.totalValue / maxValue) * 100 : 0}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Table */}
        <Grid xs={12}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="Resumen por categoría"
              action={
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<SvgIcon fontSize="small"><ArrowDownTrayIcon /></SvgIcon>}
                  onClick={handleExport}
                  disabled={!categoryStats.length}
                >
                  Exportar CSV
                </Button>
              }
            />
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Categoría</TableCell>
                    <TableCell align="right">Materiales</TableCell>
                    <TableCell align="right">Valor total</TableCell>
                    <TableCell align="right">% del total</TableCell>
                    <TableCell align="right">Stock bajo</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categoryStats.map((cat) => (
                    <TableRow key={cat.name} hover>
                      <TableCell>{cat.name}</TableCell>
                      <TableCell align="right">{cat.materials}</TableCell>
                      <TableCell align="right">${cat.totalValue.toLocaleString()}</TableCell>
                      <TableCell align="right">
                        {totalValue > 0
                          ? `${((cat.totalValue / totalValue) * 100).toFixed(1)}%`
                          : '—'}
                      </TableCell>
                      <TableCell align="right">
                        {cat.lowStock > 0 ? (
                          <Chip label={cat.lowStock} color="error" size="small" />
                        ) : (
                          <Chip label="0" color="success" size="small" variant="outlined" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
};

// ── Page ─────────────────────────────────────────────────────────────────────

const Page = () => {
  const [tab, setTab] = useState(0);
  const [movements, setMovements] = useState([]);
  const [stock, setStock] = useState([]);
  const [loadingMovements, setLoadingMovements] = useState(true);
  const [loadingStock, setLoadingStock] = useState(true);

  useEffect(() => {
    inventoryApi
      .listMovements({ limit: 1000 })
      .then((r) => setMovements(r.items))
      .catch((err) => console.error('Error fetching movements:', err))
      .finally(() => setLoadingMovements(false));

    inventoryApi
      .getStock()
      .then(setStock)
      .catch((err) => console.error('Error fetching stock:', err))
      .finally(() => setLoadingStock(false));
  }, []);

  return (
    <>
      <Head>
        <title>Reportes | Ward</title>
      </Head>
      <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Typography variant="h4">Reportes</Typography>
            <Tabs value={tab} onChange={(_, v) => setTab(v)}>
              <Tab label="Movimientos" />
              <Tab label="Stock por categoría" />
            </Tabs>
            {tab === 0 && (
              <MovementsReport movements={movements} loading={loadingMovements} />
            )}
            {tab === 1 && (
              <StockReport stock={stock} loading={loadingStock} />
            )}
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
