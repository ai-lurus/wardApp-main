import PropTypes from 'prop-types';
import MagnifyingGlassIcon from '@heroicons/react/24/solid/MagnifyingGlassIcon';
import XMarkIcon from '@heroicons/react/24/solid/XMarkIcon';
import {
  Box,
  Button,
  Card,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  Skeleton,
  Stack,
  SvgIcon,
  TextField,
  Typography,
} from '@mui/material';
import { GpsUnitsList } from './gps-units-list';
import { GpsUnitSummary } from './gps-unit-summary';
import { unitStatusMap } from './gps-status';

export const ALERTS_FILTER = 'alerts';

const Kbd = () => (
  <Box
    component="kbd"
    sx={{ px: 0.75, borderRadius: 0.5, border: 1, borderColor: 'divider', fontSize: 12, color: 'text.secondary', fontFamily: 'inherit' }}
  >
    /
  </Box>
);

/**
 * Control panel next to the map: search, status filters (with counts), the selected unit's
 * summary and the unit list. The same filters drive what the map shows.
 */
export const GpsUnitsPanel = (props) => {
  const {
    units,
    counts,
    total,
    search,
    onSearch,
    searchRef,
    statusFilter,
    onStatusFilter,
    selectedUnit,
    onSelect,
    etaByUnit,
    loading,
    height,
  } = props;
  const hasFilters = Boolean(search) || Boolean(statusFilter);
  const filterChips = [
    { key: null, label: 'Todas', count: counts.all },
    ...Object.entries(unitStatusMap).map(([key, config]) => ({ key, label: config.label, count: counts[key] || 0, color: config.color })),
    { key: ALERTS_FILTER, label: 'Con alertas', count: counts.alerts, color: 'error' },
  ];

  return (
    <Card sx={{ height, display: 'flex', flexDirection: 'column' }}>
      <Stack spacing={1.5}
sx={{ p: 2 }}>
        <Stack direction="row"
justifyContent="space-between"
alignItems="baseline">
          <Typography variant="h6">Unidades</Typography>
          <Typography variant="body2"
color="text.secondary">
            {hasFilters ? `${units.length} de ${total}` : `${total} con GPS`}
          </Typography>
        </Stack>
        <TextField
          inputRef={searchRef}
          size="small"
          fullWidth
          value={search}
          onChange={(event) => onSearch(event.target.value)}
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
            endAdornment: (
              <InputAdornment position="end">
                {search ? (
                  <IconButton size="small"
onClick={() => onSearch('')}
aria-label="Borrar búsqueda">
                    <SvgIcon fontSize="small">
                      <XMarkIcon />
                    </SvgIcon>
                  </IconButton>
                ) : (
                  <Kbd />
                )}
              </InputAdornment>
            ),
          }}
        />
        <Stack
          direction="row"
          role="group"
          aria-label="Filtrar por estado"
          // Phones scroll the chips sideways instead of wrapping into several rows.
          sx={{
            flexWrap: { xs: 'nowrap', sm: 'wrap' },
            overflowX: { xs: 'auto', sm: 'visible' },
            gap: 0.75,
            pb: { xs: 0.5, sm: 0 },
            '& .MuiChip-root': { flexShrink: 0 },
          }}
        >
          {filterChips.map(({ key, label, count, color }) => {
            const active = statusFilter === key;
            return (
              <Chip
                key={label}
                size="small"
                label={`${label} (${count})`}
                color={active ? color || 'primary' : 'default'}
                variant={active ? 'filled' : 'outlined'}
                onClick={() => onStatusFilter(key)}
                aria-pressed={active}
              />
            );
          })}
        </Stack>
      </Stack>
      <Divider />
      {selectedUnit && (
        <GpsUnitSummary unit={selectedUnit}
estimate={etaByUnit[selectedUnit.id]}
onClose={() => onSelect(selectedUnit.id)} />
      )}
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {loading && (
          <Stack spacing={1}
sx={{ p: 2 }}>
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i}
variant="rounded"
height={72} />
            ))}
          </Stack>
        )}
        {!loading && units.length === 0 && (
          <Stack spacing={1.5}
alignItems="center"
sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2"
color="text.secondary">
              Ninguna unidad coincide con la búsqueda o el filtro.
            </Typography>
            <Button
              size="small"
              onClick={() => {
                onSearch('');
                onStatusFilter(null);
              }}
            >
              Limpiar filtros
            </Button>
          </Stack>
        )}
        {!loading && (
          <GpsUnitsList units={units}
selectedId={selectedUnit?.id || null}
onSelect={onSelect}
etaByUnit={etaByUnit} />
        )}
      </Box>
    </Card>
  );
};

GpsUnitsPanel.propTypes = {
  units: PropTypes.array,
  counts: PropTypes.object,
  total: PropTypes.number,
  search: PropTypes.string,
  onSearch: PropTypes.func,
  searchRef: PropTypes.object,
  statusFilter: PropTypes.string,
  onStatusFilter: PropTypes.func,
  selectedUnit: PropTypes.object,
  onSelect: PropTypes.func,
  etaByUnit: PropTypes.object,
  loading: PropTypes.bool,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.object]),
};
