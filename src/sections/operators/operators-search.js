import MagnifyingGlassIcon from '@heroicons/react/24/solid/MagnifyingGlassIcon';
import { Card, InputAdornment, OutlinedInput, SvgIcon, Select, MenuItem, Box } from '@mui/material';

export const OperatorsSearch = ({ filters, onFilterChange }) => {
  return (
    <Card sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
      <OutlinedInput
        defaultValue=""
        fullWidth
        placeholder="Buscar por nombre, licencia o correo..."
        onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
        startAdornment={(
          <InputAdornment position="start">
            <SvgIcon color="action" fontSize="small">
              <MagnifyingGlassIcon />
            </SvgIcon>
          </InputAdornment>
        )}
        sx={{ maxWidth: 500, flexGrow: 1 }}
      />
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Select
          value={filters.status || ''}
          onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
          displayEmpty
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">Todos los estados</MenuItem>
          <MenuItem value="disponible">Disponible</MenuItem>
          <MenuItem value="en_viaje">En viaje</MenuItem>
          <MenuItem value="no_disponible">No disponible</MenuItem>
          <MenuItem value="inactivo">Inactivo</MenuItem>
        </Select>
      </Box>
    </Card>
  );
};
