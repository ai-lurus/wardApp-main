import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import NextLink from 'next/link';
import {
  Box,
  Card,
  Divider,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';
import { formatHours } from 'src/utils/gps-reports';

const fmt = (value) => (value === null || value === undefined ? '—' : value.toLocaleString('es-MX'));
const delayText = (minutes) => (minutes === null ? '—' : minutes > 0 ? `+${minutes} min` : `${minutes} min`);
const delayColor = (minutes) => (minutes > 10 ? 'error.main' : 'success.main');

export const REPORT_COLUMNS = [
  { key: 'unitEco', label: 'Unidad' },
  { key: 'km', label: 'Km', align: 'right' },
  { key: 'movingMinutes', label: 'En movimiento', align: 'right' },
  { key: 'stoppedMinutes', label: 'Detenido', align: 'right' },
  { key: 'stops', label: 'Paradas', align: 'right' },
  { key: 'speeding', label: 'Excesos', align: 'right' },
  { key: 'dieselLiters', label: 'Diésel (L)', align: 'right' },
  { key: 'compliancePct', label: 'Cumplimiento', align: 'right' },
  { key: 'avgDelayMinutes', label: 'Retraso prom.', align: 'right' },
];

const cellValue = (row, key) => {
  switch (key) {
    case 'movingMinutes':
    case 'stoppedMinutes':
      return formatHours(row[key]);
    case 'stops':
      return `${row.stops}${row.unauthorizedStops ? ` (${row.unauthorizedStops} no aut.)` : ''}`;
    case 'compliancePct':
      return row.compliancePct === null ? '—' : `${row.compliancePct}%`;
    case 'avgDelayMinutes':
      return delayText(row.avgDelayMinutes);
    default:
      return fmt(row[key]);
  }
};

const UnitLabel = ({ row }) => (
  <>
    <Link component={NextLink}
href={`/gps/units/${row.unitId}`}
underline="hover"
variant="subtitle2">
      {row.unitEco}
    </Link>
    <Typography variant="caption"
color="text.secondary"
display="block">
      {row.unitPlate} · {row.driverName}
    </Typography>
  </>
);

UnitLabel.propTypes = { row: PropTypes.object };

// Phones get one card per unit instead of a wide table.
const ReportCards = ({ rows }) => (
  <Card>
    <Stack divider={<Divider />}>
      {rows.map((row) => (
        <Box key={row.unitId}
sx={{ px: 2, py: 1.5 }}>
          <UnitLabel row={row} />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 2, rowGap: 0.5, mt: 1 }}>
            {REPORT_COLUMNS.slice(1).map(({ key, label }) => (
              <Typography key={key}
variant="body2">
                <Typography component="span"
variant="body2"
color="text.secondary">
                  {label}:{' '}
                </Typography>
                <Typography component="span"
variant="body2"
color={key === 'avgDelayMinutes' && row.avgDelayMinutes !== null ? delayColor(row.avgDelayMinutes) : 'text.primary'}>
                  {cellValue(row, key)}
                </Typography>
              </Typography>
            ))}
          </Box>
        </Box>
      ))}
    </Stack>
  </Card>
);

ReportCards.propTypes = { rows: PropTypes.array };

export const GpsReportsTable = ({ rows = [] }) => {
  const isPhone = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const [sort, setSort] = useState({ key: 'km', direction: 'desc' });

  const sorted = useMemo(() => {
    const factor = sort.direction === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = a[sort.key] ?? -Infinity;
      const bv = b[sort.key] ?? -Infinity;
      return (typeof av === 'string' ? av.localeCompare(bv) : av - bv) * factor;
    });
  }, [rows, sort]);

  const toggleSort = (key) =>
    setSort((current) => ({ key, direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc' }));

  if (isPhone) return <ReportCards rows={sorted} />;

  return (
    <Card>
      <Scrollbar>
        <Box sx={{ minWidth: 1000 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {REPORT_COLUMNS.map(({ key, label, align }) => (
                  <TableCell key={key}
align={align}
sortDirection={sort.key === key ? sort.direction : false}>
                    <TableSortLabel active={sort.key === key}
direction={sort.key === key ? sort.direction : 'desc'}
onClick={() => toggleSort(key)}>
                      {label}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sorted.map((row) => (
                <TableRow hover
key={row.unitId}>
                  <TableCell>
                    <UnitLabel row={row} />
                  </TableCell>
                  {REPORT_COLUMNS.slice(1).map(({ key, align }) => (
                    <TableCell
                      key={key}
                      align={align}
                      sx={{
                        whiteSpace: 'nowrap',
                        ...(key === 'avgDelayMinutes' && row.avgDelayMinutes !== null && { color: delayColor(row.avgDelayMinutes) }),
                        ...(key === 'stops' && row.unauthorizedStops && { color: 'error.main' }),
                      }}
                    >
                      {cellValue(row, key)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Scrollbar>
    </Card>
  );
};

GpsReportsTable.propTypes = { rows: PropTypes.array };
