import MagnifyingGlassIcon from '@heroicons/react/24/solid/MagnifyingGlassIcon';
import { Card, InputAdornment, OutlinedInput, SvgIcon } from '@mui/material';

export const CustomersToolbar = ({ search, onSearchChange }) => {
  return (
    <Card sx={{ p: 2 }}>
      <OutlinedInput
        value={search}
        fullWidth
        placeholder="Buscar por nombre, teléfono o correo..."
        onChange={(e) => onSearchChange(e.target.value)}
        startAdornment={(
          <InputAdornment position="start">
            <SvgIcon color="action"
              fontSize="small">
              <MagnifyingGlassIcon />
            </SvgIcon>
          </InputAdornment>
        )}
        sx={{ maxWidth: 500 }}
      />
    </Card>
  );
};
