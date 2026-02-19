import { Button, Card, FormControlLabel, InputAdornment, MenuItem, Stack, SvgIcon, Switch, TextField } from '@mui/material';
import MagnifyingGlassIcon from '@heroicons/react/24/solid/MagnifyingGlassIcon';
import XMarkIcon from '@heroicons/react/24/solid/XMarkIcon';
import { useTranslation } from 'react-i18next';

export const MaterialsSearch = ({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  categories,
  locationFilter,
  onLocationChange,
  locations,
  onClearFilters,
  showInactive,
  onShowInactiveChange,
}) => {
  const { t } = useTranslation();
  const hasActiveFilters = searchQuery || categoryFilter || locationFilter || showInactive;

  return (
    <Card sx={{ p: 2 }}>
      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
        <TextField
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('searchBySku')}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SvgIcon color="action" fontSize="small">
                  <MagnifyingGlassIcon />
                </SvgIcon>
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
          size="small"
          fullWidth
        />
        <TextField
          select
          label={t('category')}
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          sx={{ minWidth: 180 }}
          size="small"
        >
          <MenuItem value="">{t('allCategories')}</MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              {cat.name}
            </MenuItem>
          ))}
        </TextField>
        {locations && locations.length > 0 && (
          <TextField
            select
            label={t('location')}
            value={locationFilter || ''}
            onChange={(e) => onLocationChange(e.target.value)}
            sx={{ minWidth: 220 }}
            size="small"
          >
            <MenuItem value="">{t('allLocations')}</MenuItem>
            {locations.map((loc) => (
              <MenuItem key={loc} value={loc}>
                {loc}
              </MenuItem>
            ))}
          </TextField>
        )}
        <FormControlLabel
          control={
            <Switch
              checked={!!showInactive}
              onChange={(e) => onShowInactiveChange(e.target.checked)}
              size="small"
              color="warning"
            />
          }
          label="Inactivos"
          sx={{ ml: 0.5, '& .MuiFormControlLabel-label': { fontSize: 14 } }}
        />
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
            {t('clearFilters')}
          </Button>
        )}
      </Stack>
    </Card>
  );
};
