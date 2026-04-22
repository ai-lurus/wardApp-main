import PaperAirplaneIcon from '@heroicons/react/24/solid/PaperAirplaneIcon';
import ShieldCheckIcon from '@heroicons/react/24/solid/ShieldCheckIcon';
import { Box, IconButton, InputBase, Paper, SvgIcon } from '@mui/material';
import { usePathname } from 'next/navigation';
import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
import { useWardenContext } from 'src/contexts/warden-context';
import SuggestionChips from './suggestion-chips';

const PATH_TO_MODULE = {
  '/': 'inicio',
  '/materials': 'inventario',
  '/categories': 'inventario',
  '/movements': 'inventario',
  '/alerts': 'inventario',
  '/reports': 'inventario',
  '/warehouse': 'inventario',
  '/routes': 'operaciones',
  '/units': 'flotas',
  '/warden': 'warden',
  '/users': 'admin',
  '/billing': 'admin',
};

const PLACEHOLDERS = {
  inicio: 'Pregúntale a Warden... Resumen del día',
  inventario: '¿Qué materiales están por agotarse?',
  operaciones: 'Calcula costo del viaje MTY a CDMX...',
  flotas: '¿Qué unidades necesitan mantenimiento?',
  finanzas: '¿Cuánto me deben?',
  admin: 'Usuarios activos en el sistema',
  warden: 'Escribe un comando o pregunta...',
};

export default function AiBar({ onSend }) {
  const pathname = usePathname();
  const { openPanel } = useWardenContext();
  const [text, setText] = useState('');

  const moduleId = PATH_TO_MODULE[pathname] ?? 'inicio';
  const placeholder = PLACEHOLDERS[moduleId] ?? PLACEHOLDERS.warden;

  const handleSubmit = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText('');
    openPanel();
    onSend({ text: trimmed, moduleHint: moduleId });
  }, [text, openPanel, onSend, moduleId]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleChipSelect = useCallback(
    (chip) => {
      openPanel();
      onSend({ text: chip, moduleHint: moduleId });
    },
    [openPanel, onSend, moduleId]
  );

  return (
    <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          borderColor: 'divider',
          '&:focus-within': { borderColor: '#6366F1', boxShadow: '0 0 0 2px #6366F140' },
          transition: 'box-shadow 0.2s, border-color 0.2s',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', px: 1.5, py: 0.5 }}>
          <SvgIcon sx={{ fontSize: 20, color: '#6366F1', mr: 1, flexShrink: 0 }}>
            <ShieldCheckIcon />
          </SvgIcon>
          <InputBase
            fullWidth
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            sx={{ fontSize: 14, py: 0.5 }}
          />
          <IconButton
            size="small"
            onClick={handleSubmit}
            disabled={!text.trim()}
            sx={{
              color: text.trim() ? '#6366F1' : 'text.disabled',
              flexShrink: 0,
              ml: 0.5,
            }}
          >
            <SvgIcon fontSize="small">
              <PaperAirplaneIcon />
            </SvgIcon>
          </IconButton>
        </Box>
        <SuggestionChips moduleId={moduleId} onSelect={handleChipSelect} />
      </Paper>
    </Box>
  );
}

AiBar.propTypes = {
  onSend: PropTypes.func.isRequired,
};
