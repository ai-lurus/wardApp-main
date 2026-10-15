import { useState } from 'react';
import PropTypes from 'prop-types';
import { format, parseISO } from 'date-fns';
import es from 'date-fns/locale/es';
import { Card, CardContent, CardHeader, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Chart } from 'src/components/chart';

// Bar chart of kilometers, by unit or by day.
export const GpsReportsChart = ({ byUnit = [], byDay = [] }) => {
  const theme = useTheme();
  const [mode, setMode] = useState('unit');
  const categories = mode === 'unit' ? byUnit.map((row) => row.unitEco) : byDay.map(([day]) => format(parseISO(day), 'dd MMM', { locale: es }));
  const data = mode === 'unit' ? byUnit.map((row) => row.km) : byDay.map(([, km]) => km);

  const options = {
    chart: { background: 'transparent', toolbar: { show: false } },
    colors: [theme.palette.primary.main],
    dataLabels: { enabled: false },
    grid: { borderColor: theme.palette.divider, strokeDashArray: 2 },
    plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } },
    xaxis: { categories, labels: { style: { colors: theme.palette.text.secondary }, rotate: -45, hideOverlappingLabels: true } },
    yaxis: { labels: { formatter: (value) => `${Math.round(value).toLocaleString('es-MX')} km`, style: { colors: theme.palette.text.secondary } } },
    tooltip: { y: { formatter: (value) => `${value.toLocaleString('es-MX')} km` } },
  };

  return (
    <Card>
      <CardHeader
        title="Kilómetros recorridos"
        action={(
          <ToggleButtonGroup exclusive
size="small"
value={mode}
onChange={(event, value) => value && setMode(value)}
aria-label="Agrupar gráfica">
            <ToggleButton value="unit">Por unidad</ToggleButton>
            <ToggleButton value="day">Por día</ToggleButton>
          </ToggleButtonGroup>
        )}
        sx={{ flexWrap: 'wrap', gap: 1 }}
      />
      <CardContent sx={{ pt: 0 }}>
        <Chart height={280}
options={options}
series={[{ name: 'Kilómetros', data }]}
type="bar"
width="100%" />
      </CardContent>
    </Card>
  );
};

GpsReportsChart.propTypes = { byUnit: PropTypes.array, byDay: PropTypes.array };
