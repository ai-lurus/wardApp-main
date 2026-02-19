import { useState } from 'react';
import {
  Autocomplete,
  Box,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Tooltip,
  Typography,
  SvgIcon,
} from '@mui/material';
import XMarkIcon from '@heroicons/react/24/solid/XMarkIcon';

export const ZoneMaterialsPanel = ({
  zone,
  allMaterials,
  onAssign,
  onUnassign,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [assigning, setAssigning] = useState(false);

  if (!zone) {
    return (
      <Box
        sx={{
          width: 300,
          height: '100%',
          bgcolor: 'background.paper',
          borderLeft: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="body2" color="text.secondary" textAlign="center" px={3}>
          Haz clic en una zona del mapa para ver sus materiales
        </Typography>
      </Box>
    );
  }

  // Materials not yet assigned to this zone (for the add dropdown)
  const unassigned = allMaterials.filter(
    (m) => m.active && m.zoneId !== zone.id
  );

  const handleAssign = async (material) => {
    if (!material) return;
    try {
      setAssigning(true);
      await onAssign(material.id, zone.id);
      setInputValue('');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Box
      sx={{
        width: 300,
        height: '100%',
        bgcolor: 'background.paper',
        borderLeft: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: zone.color,
              flexShrink: 0,
            }}
          />
          <Typography variant="subtitle2" noWrap>
            {zone.name}
          </Typography>
        </Stack>
      </Stack>

      {/* Add material */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
          Agregar material a esta zona
        </Typography>
        <Autocomplete
          size="small"
          options={unassigned}
          getOptionLabel={(o) => `${o.name}${o.sku ? ` (${o.sku})` : ''}`}
          inputValue={inputValue}
          onInputChange={(_, v) => setInputValue(v)}
          onChange={(_, value) => handleAssign(value)}
          loading={assigning}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Buscar material..."
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {assigning && <CircularProgress size={14} />}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          noOptionsText="Sin resultados"
        />
      </Box>

      {/* Materials list */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {zone.materials.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No hay materiales en esta zona
            </Typography>
          </Box>
        ) : (
          <List dense disablePadding>
            {zone.materials.map((m) => {
              const isLowStock = m.currentStock <= m.minStock;
              return (
                <ListItem
                  key={m.id}
                  secondaryAction={
                    <Tooltip title="Desasignar de esta zona">
                      <IconButton
                        size="small"
                        edge="end"
                        onClick={() => onUnassign(m.id)}
                      >
                        <SvgIcon fontSize="small" sx={{ color: 'text.disabled' }}>
                          <XMarkIcon />
                        </SvgIcon>
                      </IconButton>
                    </Tooltip>
                  }
                  sx={{
                    borderLeft: '3px solid',
                    borderColor: isLowStock ? 'warning.main' : 'transparent',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <ListItemText
                    primary={
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>
                          {m.name}
                        </Typography>
                        {isLowStock && (
                          <Chip label="Stock bajo" size="small" color="warning" sx={{ height: 18, fontSize: 10 }} />
                        )}
                      </Stack>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        Stock: {m.currentStock} {m.unit}
                        {m.sku ? ` · ${m.sku}` : ''}
                      </Typography>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        )}
      </Box>

      <Divider />
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {zone.materials.length} material{zone.materials.length !== 1 ? 'es' : ''}
        </Typography>
      </Box>
    </Box>
  );
};
