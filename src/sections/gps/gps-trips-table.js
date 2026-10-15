import PropTypes from 'prop-types';
import NextLink from 'next/link';
import ShareIcon from '@heroicons/react/24/solid/ShareIcon';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import {
  Box,
  Card,
  IconButton,
  SvgIcon,
  Tooltip,
  LinearProgress,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Divider,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';
import { delayInfo, formatDuration } from 'src/utils/gps-insights';
import { TripStatusPill, tripStatusMap } from './gps-status';

const formatDate = (value) => format(new Date(value), 'dd/MM HH:mm');

// Estimated arrival with traffic, the planned time and the difference against plan.
const EtaCell = ({ trip }) => {
  if (trip.status === 'delivered') {
    return (
      <>
        <Typography variant="body2">{formatDate(trip.eta)}</Typography>
        <Typography variant="caption"
color="text.secondary">Entregado</Typography>
      </>
    );
  }
  const delay = delayInfo(trip.delayMinutes);
  return (
    <>
      <Typography variant="body2">{formatDate(trip.eta)}</Typography>
      <Typography variant="caption"
color="text.secondary"
display="block">
        Plan {formatDate(trip.plannedEta)}
      </Typography>
      <Typography variant="caption"
color={`${delay.color}.main`}
display="block">
        {delay.label}
      </Typography>
      {trip.trafficMinutes > 0 && (
        <Typography variant="caption"
color="warning.main"
display="block">
          Tráfico +{formatDuration(trip.trafficMinutes)}
        </Typography>
      )}
    </>
  );
};

EtaCell.propTypes = { trip: PropTypes.object };

// Phones get one card per trip instead of the wide table.
const TripCards = ({ items, onOpen, onShare }) => (
  <Stack divider={<Divider />}>
    {items.map((trip) => {
      const progress = Math.round(trip.progress * 100);
      return (
        <Box
          key={trip.id}
          role="button"
          tabIndex={0}
          onClick={() => onOpen(trip)}
          onKeyDown={(event) => event.key === 'Enter' && onOpen(trip)}
          sx={{ px: 2, py: 1.5, cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
        >
          <Stack direction="row"
justifyContent="space-between"
alignItems="center"
spacing={1}>
            <Typography variant="subtitle2">{trip.id}</Typography>
            <TripStatusPill status={trip.status} />
          </Stack>
          <Typography variant="body2"
sx={{ mt: 0.5 }}>
            {trip.origin.split(',')[0]} → {trip.destination.split(',')[0]}
          </Typography>
          <Typography variant="caption"
color="text.secondary"
display="block">
            {trip.unitEco} · {trip.driverName} · {trip.client}
          </Typography>
          <Stack direction="row"
spacing={1}
alignItems="center"
sx={{ mt: 1 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              color={tripStatusMap[trip.status]?.color || 'primary'}
              sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
            />
            <Typography variant="caption">{progress}%</Typography>
          </Stack>
          <Stack direction="row"
justifyContent="space-between"
alignItems="center"
sx={{ mt: 1 }}>
            <Box>
              <EtaCell trip={trip} />
            </Box>
            <IconButton
              aria-label={`Compartir seguimiento del viaje ${trip.id}`}
              sx={{ width: 44, height: 44 }}
              onClick={(event) => {
                event.stopPropagation();
                onShare(trip);
              }}
            >
              <SvgIcon fontSize="small">
                <ShareIcon />
              </SvgIcon>
            </IconButton>
          </Stack>
        </Box>
      );
    })}
  </Stack>
);

TripCards.propTypes = { items: PropTypes.array, onOpen: PropTypes.func, onShare: PropTypes.func };

export const GpsTripsTable = (props) => {
  const {
    count = 0,
    items = [],
    onPageChange = () => {},
    onRowsPerPageChange,
    page = 0,
    rowsPerPage = 0,
    onShare = () => {},
  } = props;
  const router = useRouter();
  const isPhone = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const unitHref = (trip) => `/gps/units/${trip.unitId}?from=trips`;

  return (
    <Card>
      {isPhone ? (
        <TripCards items={items}
onOpen={(trip) => router.push(unitHref(trip))}
onShare={onShare} />
      ) : (
      <Scrollbar>
        <Box sx={{ minWidth: 1100 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Viaje</TableCell>
                <TableCell>Cliente / Carga</TableCell>
                <TableCell>Ruta</TableCell>
                <TableCell>Unidad</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell sx={{ minWidth: 160 }}>Avance</TableCell>
                <TableCell>Salida</TableCell>
                <TableCell>ETA estimada / Entrega</TableCell>
                <TableCell align="right">Seguimiento</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((trip) => {
                const progress = Math.round(trip.progress * 100);
                return (
                  <TableRow
                    hover
                    key={trip.id}
                    onClick={() => router.push(unitHref(trip))}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Typography variant="subtitle2">{trip.id}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{trip.client}</Typography>
                      <Typography variant="caption"
color="text.secondary">
                        {trip.cargo} · {trip.weightTon} t
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {trip.origin.split(',')[0]} → {trip.destination.split(',')[0]}
                      </Typography>
                      <Typography variant="caption"
color="text.secondary">
                        {trip.distanceKm} km
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Link
                        component={NextLink}
                        href={unitHref(trip)}
                        onClick={(event) => event.stopPropagation()}
                        underline="hover"
                        variant="subtitle2"
                      >
                        {trip.unitEco}
                      </Link>
                      <Typography variant="caption"
color="text.secondary"
display="block">
                        {trip.driverName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <TripStatusPill status={trip.status} />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row"
spacing={1}
alignItems="center">
                        <LinearProgress
                          variant="determinate"
                          value={progress}
                          color={tripStatusMap[trip.status]?.color || 'primary'}
                          sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                        />
                        <Typography variant="caption">{progress}%</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(trip.departedAt)}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <EtaCell trip={trip} />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Compartir seguimiento">
                        <IconButton
                          aria-label={`Compartir seguimiento del viaje ${trip.id}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            onShare(trip);
                          }}
                        >
                          <SvgIcon fontSize="small">
                            <ShareIcon />
                          </SvgIcon>
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      </Scrollbar>
      )}
      <TablePagination
        component="div"
        count={count}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage="Filas por página"
      />
    </Card>
  );
};

GpsTripsTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
  onShare: PropTypes.func,
};
