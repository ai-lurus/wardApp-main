import { useState } from 'react';
import PropTypes from 'prop-types';
import Square3Stack3DIcon from '@heroicons/react/24/solid/Square3Stack3DIcon';
import { Button, Checkbox, ListItemIcon, ListItemText, Menu, MenuItem, SvgIcon } from '@mui/material';

const LAYER_OPTIONS = [
  { key: 'geofences', label: 'Geocercas' },
  { key: 'hotspots', label: 'Ruta caliente' },
  { key: 'traffic', label: 'Tráfico' },
];

// Compact "Capas" button with a checklist of map layers.
export const GpsLayerControl = ({ layers, onToggle }) => {
  const [anchor, setAnchor] = useState(null);
  const activeCount = LAYER_OPTIONS.filter(({ key }) => layers[key]).length;

  return (
    <>
      <Button
        size="small"
        variant="contained"
        color="inherit"
        onClick={(event) => setAnchor(event.currentTarget)}
        aria-haspopup="true"
        aria-expanded={Boolean(anchor)}
        startIcon={(
          <SvgIcon fontSize="small">
            <Square3Stack3DIcon />
          </SvgIcon>
        )}
        sx={{ backgroundColor: 'background.paper', boxShadow: 1, '&:hover': { backgroundColor: 'neutral.50' }, '@media (pointer: coarse)': { minHeight: 44 } }}
      >
        Capas ({activeCount})
      </Button>
      <Menu anchorEl={anchor}
open={Boolean(anchor)}
onClose={() => setAnchor(null)}>
        {LAYER_OPTIONS.map(({ key, label }) => (
          <MenuItem key={key}
onClick={() => onToggle(key)}
role="menuitemcheckbox"
aria-checked={layers[key]}>
            <ListItemIcon>
              <Checkbox edge="start"
size="small"
checked={layers[key]}
tabIndex={-1}
disableRipple />
            </ListItemIcon>
            <ListItemText>{label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

GpsLayerControl.propTypes = { layers: PropTypes.object, onToggle: PropTypes.func };
