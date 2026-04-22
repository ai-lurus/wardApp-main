import ArchiveBoxIcon from '@heroicons/react/24/solid/ArchiveBoxIcon';
import BanknotesIcon from '@heroicons/react/24/solid/BanknotesIcon';
import MapIcon from '@heroicons/react/24/solid/MapIcon';
import PaperAirplaneIcon from '@heroicons/react/24/solid/PaperAirplaneIcon';
import ShieldCheckIcon from '@heroicons/react/24/solid/ShieldCheckIcon';
import TruckIcon from '@heroicons/react/24/solid/TruckIcon';
import WrenchIcon from '@heroicons/react/24/solid/WrenchIcon';
import {
  Box,
  IconButton,
  InputBase,
  Paper,
  SvgIcon,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
import { useWardenContext } from 'src/contexts/warden-context';
import ConversationList from './conversation-list';
import MessageList from './message-list';

const SUGGEST_CATEGORIES = [
  {
    title: 'Inventario',
    icon: <ArchiveBoxIcon />,
    items: ['¿Qué materiales están por agotarse?', 'Stock actual de filtros', 'Registrar entrada de 50L aceite'],
  },
  {
    title: 'Operaciones',
    icon: <TruckIcon />,
    items: ['Calcula costo del viaje MTY a CDMX', '¿Qué viajes salen mañana?', 'Optimiza la ruta a Manzanillo'],
  },
  {
    title: 'Flotas',
    icon: <WrenchIcon />,
    items: ['¿Qué unidades necesitan mantenimiento?', 'Scoring del operador Juan Pérez', 'Agenda cambio de llantas T-105'],
  },
  {
    title: 'Finanzas',
    icon: <BanknotesIcon />,
    items: ['¿Cuánto me deben?', 'Facturas vencidas hace más de 30 días', 'Reporte de diésel de febrero'],
  },
  {
    title: 'Monitoreo GPS',
    icon: <MapIcon />,
    items: ['¿Dónde está T-203?', 'Unidades fuera de geocerca', 'Alertas de pánico activas'],
  },
  {
    title: 'Cumplimiento',
    icon: <ShieldCheckIcon />,
    items: ['¿Qué permisos vencen este mes?', 'Verificaciones pendientes', 'Operadores con licencia por vencer'],
  },
];

function EmptyState({ onAsk }) {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflowY: 'auto',
        px: 3,
        py: 4,
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: 2,
          bgcolor: '#6366F1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
        }}
      >
        <SvgIcon sx={{ fontSize: 32, color: 'white' }}>
          <ShieldCheckIcon />
        </SvgIcon>
      </Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Hola, soy Warden
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Tu guardián inteligente de operaciones
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 2,
          width: '100%',
          maxWidth: 800,
        }}
      >
        {SUGGEST_CATEGORIES.map((cat) => (
          <Paper key={cat.title} variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 1.25,
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: 'grey.50',
              }}
            >
              <SvgIcon sx={{ fontSize: 16, color: '#6366F1' }}>{cat.icon}</SvgIcon>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {cat.title}
              </Typography>
            </Box>
            <Box sx={{ px: 2, py: 1 }}>
              {cat.items.map((item) => (
                <Typography
                  key={item}
                  variant="body2"
                  onClick={() => onAsk(item)}
                  sx={{
                    py: 0.5,
                    cursor: 'pointer',
                    color: 'text.secondary',
                    '&:hover': { color: '#6366F1' },
                    transition: 'color 0.15s',
                  }}
                >
                  {item}
                </Typography>
              ))}
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

EmptyState.propTypes = { onAsk: PropTypes.func.isRequired };

export default function WardenPageView({ onSend, streamStatus }) {
  const { conversations, activeConversationId, setActiveConversation, addConversation } =
    useWardenContext();
  const [inputText, setInputText] = useState('');

  const activeConversation = conversations.find((c) => c.id === activeConversationId) ?? null;
  const messages = activeConversation?.messages ?? [];
  const hasMessages = messages.length > 0;

  const handleSubmit = useCallback(
    (text) => {
      const trimmed = (text ?? inputText).trim();
      if (!trimmed || streamStatus === 'streaming') return;
      setInputText('');
      onSend({ text: trimmed, conversationId: activeConversationId, moduleHint: 'warden' });
    },
    [inputText, streamStatus, onSend, activeConversationId]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleNewConversation = useCallback(() => {
    setActiveConversation(null);
  }, [setActiveConversation]);

  return (
    <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <ConversationList onNewConversation={handleNewConversation} />

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {hasMessages ? (
          <MessageList messages={messages} />
        ) : (
          <EmptyState onAsk={(text) => handleSubmit(text)} />
        )}

        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderTop: '1px solid',
            borderColor: 'divider',
            flexShrink: 0,
          }}
        >
          <Paper
            variant="outlined"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              '&:focus-within': { borderColor: '#6366F1', boxShadow: '0 0 0 2px #6366F140' },
              transition: 'box-shadow 0.2s, border-color 0.2s',
            }}
          >
            <InputBase
              fullWidth
              multiline
              maxRows={5}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un comando o pregunta..."
              sx={{ fontSize: 14, py: 0.25 }}
            />
            <IconButton
              size="small"
              onClick={() => handleSubmit()}
              disabled={!inputText.trim() || streamStatus === 'streaming'}
              sx={{ color: inputText.trim() ? '#6366F1' : 'text.disabled', flexShrink: 0 }}
            >
              <SvgIcon fontSize="small">
                <PaperAirplaneIcon />
              </SvgIcon>
            </IconButton>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

WardenPageView.propTypes = {
  onSend: PropTypes.func.isRequired,
  streamStatus: PropTypes.string,
};
