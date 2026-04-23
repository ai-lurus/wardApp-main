import { useState } from 'react';
import MagnifyingGlassIcon from '@heroicons/react/24/solid/MagnifyingGlassIcon';
import { Card, InputAdornment, SvgIcon, TextField, Stack, MenuItem, Button } from '@mui/material';

export const RoutesSearch = ({ onSearch }) => {
  const [searchValue, setSearchValue] = useState('');
  const [active, setActive] = useState('all');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  const handleSearchClick = () => {
    onSearch({
      search: searchValue,
      active: active === 'all' ? undefined : active === 'true',
      origin: origin,
      destination: destination
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };

  return (
    <Card sx={{ p: 2 }}>
      <Stack 
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', sm: 'center' }}
      >
        <TextField
          fullWidth
          placeholder="Buscar ruta por nombre..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleKeyPress}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SvgIcon color="action" fontSize="small">
                  <MagnifyingGlassIcon />
                </SvgIcon>
              </InputAdornment>
            )
          }}
          sx={{ maxWidth: { sm: 500 } }}
          size="small"
        />
        <TextField
          select
          label="Estado"
          size="small"
          sx={{ minWidth: { sm: 150 } }}
          value={active}
          onChange={(e) => setActive(e.target.value)}
        >
          <MenuItem value="all">Todos</MenuItem>
          <MenuItem value="true">Activa</MenuItem>
          <MenuItem value="false">Inactiva</MenuItem>
        </TextField>
        <TextField
          label="Origen"
          size="small"
          sx={{ minWidth: { sm: 120 } }}
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
        />
        <TextField
          label="Destino"
          size="small"
          sx={{ minWidth: { sm: 120 } }}
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
        <Button
          variant="contained"
          onClick={handleSearchClick}
          startIcon={(
            <SvgIcon fontSize="small">
              <MagnifyingGlassIcon />
            </SvgIcon>
          )}
          sx={{ 
            height: { sm: 40 },
            whiteSpace: 'nowrap',
            flexShrink: 0 
          }}
        >
          Buscar
        </Button>
      </Stack>
    </Card>
  );
};
