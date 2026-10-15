import PropTypes from 'prop-types';
import MagnifyingGlassIcon from '@heroicons/react/24/solid/MagnifyingGlassIcon';
import { Card, Chip, InputAdornment, MenuItem, Stack, SvgIcon, TextField, Typography } from '@mui/material';

const ChipGroup = ({ label, options, value, onChange }) => (
  <Stack direction={{ xs: 'column', sm: 'row' }}
spacing={1}
alignItems={{ sm: 'center' }}>
    <Typography variant="body2"
color="text.secondary"
sx={{ minWidth: 80 }}>
      {label}
    </Typography>
    <Stack
      direction="row"
      role="group"
      aria-label={label}
      // Phones scroll the chips sideways instead of wrapping.
      sx={{
        flexWrap: { xs: 'nowrap', sm: 'wrap' },
        overflowX: { xs: 'auto', sm: 'visible' },
        gap: 0.75,
        pb: { xs: 0.5, sm: 0 },
        minWidth: 0,
        '& .MuiChip-root': { flexShrink: 0 },
      }}
    >
      {options.map((option) => {
        const active = value === option.value;
        return (
          <Chip
            key={option.label}
            size="small"
            label={`${option.label} (${option.count})`}
            color={active ? option.color || 'primary' : 'default'}
            variant={active ? 'filled' : 'outlined'}
            onClick={() => onChange(option.value)}
            aria-pressed={active}
          />
        );
      })}
    </Stack>
  </Stack>
);

ChipGroup.propTypes = { label: PropTypes.string, options: PropTypes.array, value: PropTypes.any, onChange: PropTypes.func };

export const GpsAlertsFilters = ({ filters, onChange, statusOptions, severityOptions, typeOptions, unitOptions }) => (
  <Card sx={{ p: 2 }}>
    <Stack spacing={1.5}>
      <Stack direction={{ xs: 'column', md: 'row' }}
spacing={1.5}>
        <TextField
          size="small"
          value={filters.search}
          onChange={(event) => onChange({ search: event.target.value })}
          placeholder="Buscar por alerta, unidad, placa u operador"
          inputProps={{ 'aria-label': 'Buscar alertas' }}
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
        <TextField
          select
          size="small"
          label="Unidad"
          value={filters.unitId}
          onChange={(event) => onChange({ unitId: event.target.value })}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">Todas las unidades</MenuItem>
          {unitOptions.map((unit) => (
            <MenuItem key={unit.value}
value={unit.value}>
              {unit.label} ({unit.count})
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Orden"
          value={filters.sort}
          onChange={(event) => onChange({ sort: event.target.value })}
          sx={{ minWidth: 170 }}
        >
          <MenuItem value="newest">Más recientes</MenuItem>
          <MenuItem value="oldest">Más antiguas</MenuItem>
        </TextField>
      </Stack>
      <ChipGroup label="Estado"
options={statusOptions}
value={filters.status}
onChange={(status) => onChange({ status })} />
      <ChipGroup label="Severidad"
options={severityOptions}
value={filters.severity}
onChange={(severity) => onChange({ severity })} />
      <ChipGroup label="Tipo"
options={typeOptions}
value={filters.type}
onChange={(type) => onChange({ type })} />
    </Stack>
  </Card>
);

GpsAlertsFilters.propTypes = {
  filters: PropTypes.object,
  onChange: PropTypes.func,
  statusOptions: PropTypes.array,
  severityOptions: PropTypes.array,
  typeOptions: PropTypes.array,
  unitOptions: PropTypes.array,
};
