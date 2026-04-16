import { Button, Card, InputAdornment, MenuItem, Stack, SvgIcon, TextField } from '@mui/material';
import MagnifyingGlassIcon from '@heroicons/react/24/solid/MagnifyingGlassIcon';
import XMarkIcon from '@heroicons/react/24/solid/XMarkIcon';

const UNIT_TYPES = [
  { value: 'caja_seca', label: 'Caja Seca' },
  { value: 'refrigerado', label: 'Refrigerado' },
  { value: 'plataforma', label: 'Plataforma' },
  { value: 'volteo', label: 'Volteo' },
  { value: 'pipa', label: 'Pipa' },
  { value: 'otro', label: 'Otro' },
];

const UNIT_STATES = [
  { value: 'disponible', label: 'Disponible' },
  { value: 'mantenimiento', label: 'Mantenimiento' },
  { value: 'en_viaje', label: 'En Viaje' },
  { value: 'inactivo', label: 'Inactivo' },
];

export const UnitsSearch = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
  onClearFilters,
}) => {
  const hasActiveFilters = searchQuery || statusFilter || typeFilter;

  return (
    <Card sx={{ p: 2 }}>
      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
        <TextField
          id="searchQuery"
          name="searchQuery"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por matrícula o VIN"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SvgIcon color="action" fontSize="small">
                  <MagnifyingGlassIcon />
                </SvgIcon>
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400, minWidth: 250 }}
          size="small"
          fullWidth
        />
        <TextField
          select
          name="statusFilter"
          label="Estado"
          InputLabelProps={{ htmlFor: '' }}
          SelectProps={{ inputProps: { id: 'statusFilter-select', name: 'statusFilter' } }}
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          sx={{ minWidth: 180 }}
          size="small"
        >
          <MenuItem value="">Todos los estados</MenuItem>
          {UNIT_STATES.map((stat) => (
            <MenuItem key={stat.value} value={stat.value}>
              {stat.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          name="typeFilter"
          label="Tipo de unidad"
          InputLabelProps={{ htmlFor: '' }}
          SelectProps={{ inputProps: { id: 'typeFilter-select', name: 'typeFilter' } }}
          value={typeFilter}
          onChange={(e) => onTypeChange(e.target.value)}
          sx={{ minWidth: 180 }}
          size="small"
        >
          <MenuItem value="">Todos los tipos</MenuItem>
          {UNIT_TYPES.map((type) => (
            <MenuItem key={type.value} value={type.value}>
              {type.label}
            </MenuItem>
          ))}
        </TextField>
        {hasActiveFilters && onClearFilters && (
          <Button
            startIcon={
              <SvgIcon fontSize="small">
                <XMarkIcon />
              </SvgIcon>
            }
            onClick={onClearFilters}
            size="small"
          >
            Limpiar
          </Button>
        )}
      </Stack>
    </Card>
  );
};
