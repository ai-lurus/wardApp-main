import MagnifyingGlassIcon from '@heroicons/react/24/solid/MagnifyingGlassIcon';
import { Card, InputAdornment, SvgIcon, TextField } from '@mui/material';

export const CompaniesSearch = () => (
  <Card sx={{ p: 2 }}>
    <TextField
      defaultValue=""
      fullWidth
      placeholder="Search company"
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
      sx={{ maxWidth: 500 }}
      size="small"
    />
  </Card>
);
