import { Card, InputAdornment, SvgIcon, Stack, MenuItem, TextField } from '@mui/material';
import MagnifyingGlassIcon from '@heroicons/react/24/solid/MagnifyingGlassIcon';
import { useState } from 'react';

export const TripsSearch = ({ onSearch, routes, units }) => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [routeId, setRouteId] = useState('');
  const [unitId, setUnitId] = useState('');

  const handleChange = (field, value) => {
    if (field === 'query') setQuery(value);
    if (field === 'status') setStatus(value);
    if (field === 'routeId') setRouteId(value);
    if (field === 'unitId') setUnitId(value);
    
    onSearch({
      query: field === 'query' ? value : query,
      status: field === 'status' ? value : status,
      routeId: field === 'routeId' ? value : routeId,
      unitId: field === 'unitId' ? value : unitId
    });
  };

  return (
    <Card sx={{ p: 2 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField
          fullWidth
          placeholder="Buscar viaje..."
          value={query}
          onChange={(e) => handleChange('query', e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SvgIcon color="action" fontSize="small">
                  <MagnifyingGlassIcon />
                </SvgIcon>
              </InputAdornment>
            )
          }}
          sx={{ flexGrow: 1 }}
        />
        
        <TextField
          select
          label="Estado"
          value={status}
          onChange={(e) => handleChange('status', e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="programado">Programado</MenuItem>
          <MenuItem value="en_curso">En Curso</MenuItem>
          <MenuItem value="completado">Completado</MenuItem>
          <MenuItem value="cancelado">Cancelado</MenuItem>
        </TextField>

        <TextField
          select
          label="Ruta"
          value={routeId}
          onChange={(e) => handleChange('routeId', e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">Todas</MenuItem>
          {routes.map(r => (
            <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Unidad"
          value={unitId}
          onChange={(e) => handleChange('unitId', e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">Todas</MenuItem>
          {units.map(u => (
            <MenuItem key={u.id} value={u.id}>{u.plate || u.matricula}</MenuItem>
          ))}
        </TextField>
      </Stack>
    </Card>
  );
};
