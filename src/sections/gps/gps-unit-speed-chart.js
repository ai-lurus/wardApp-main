import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Chart } from 'src/components/chart';

export const GpsUnitSpeedChart = ({ samples = [] }) => {
  const theme = useTheme();

  const options = {
    chart: { background: 'transparent', toolbar: { show: false }, zoom: { enabled: false } },
    colors: [theme.palette.primary.main],
    dataLabels: { enabled: false },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0.05 } },
    grid: { borderColor: theme.palette.divider, strokeDashArray: 2 },
    stroke: { width: 2, curve: 'smooth' },
    annotations: {
      yaxis: [
        {
          y: 95,
          borderColor: theme.palette.error.main,
          strokeDashArray: 4,
          label: {
            text: 'Límite 95 km/h',
            style: { color: theme.palette.common.white, background: theme.palette.error.main },
          },
        },
      ],
    },
    xaxis: {
      categories: samples.map((sample) => format(new Date(sample.at), 'HH:mm')),
      tickAmount: 6,
      labels: { style: { colors: theme.palette.text.secondary } },
    },
    yaxis: {
      min: 0,
      max: 120,
      labels: {
        formatter: (value) => `${Math.round(value)} km/h`,
        style: { colors: theme.palette.text.secondary },
      },
    },
    tooltip: { y: { formatter: (value) => (value === null ? 'Sin señal' : `${value} km/h`) } },
  };

  const series = [{ name: 'Velocidad', data: samples.map((sample) => sample.speed) }];

  return (
    <Card>
      <CardHeader title="Velocidad"
subheader="Últimas 6 horas" />
      <CardContent sx={{ pt: 0 }}>
        <Chart height={260}
options={options}
series={series}
type="area"
width="100%" />
      </CardContent>
    </Card>
  );
};

GpsUnitSpeedChart.propTypes = {
  samples: PropTypes.array,
};
