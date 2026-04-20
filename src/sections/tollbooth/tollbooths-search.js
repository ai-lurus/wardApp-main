import { useState } from 'react';
import MagnifyingGlassIcon from '@heroicons/react/24/solid/MagnifyingGlassIcon';
import { Card, InputAdornment, SvgIcon, TextField, Stack, Button } from '@mui/material';

export const TollboothsSearch = ({ onSearch }) => {
  const [searchValue, setSearchValue] = useState('');

  const handleSearchClick = () => {
    onSearch(searchValue);
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
          placeholder="Buscar caseta por nombre..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleKeyPress}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SvgIcon
                  color="action"
                  fontSize="small"
                >
                  <MagnifyingGlassIcon />
                </SvgIcon>
              </InputAdornment>
            )
          }}
          sx={{ maxWidth: { sm: 500 } }}
          size="small"
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
