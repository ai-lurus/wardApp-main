import PaperAirplaneIcon from '@heroicons/react/24/solid/PaperAirplaneIcon';
import ShieldCheckIcon from '@heroicons/react/24/solid/ShieldCheckIcon';
import XMarkIcon from '@heroicons/react/24/solid/XMarkIcon';
import {
  Box,
  Drawer,
  IconButton,
  InputBase,
  Paper,
  SvgIcon,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
import { useWardenContext } from 'src/contexts/warden-context';
import MessageList from './message-list';

const PANEL_WIDTH = 400;

export default function WardenPanel({ onSend, streamStatus }) {
  const { panelOpen, closePanel, conversations, activeConversationId } = useWardenContext();
  const [inputText, setInputText] = useState('');

  const activeConversation = conversations.find((c) => c.id === activeConversationId) ?? null;
  const messages = activeConversation?.messages ?? [];

  const handleSubmit = useCallback(() => {
    const trimmed = inputText.trim();
    if (!trimmed || streamStatus === 'streaming') return;
    setInputText('');
    onSend({ text: trimmed, conversationId: activeConversationId });
  }, [inputText, streamStatus, onSend, activeConversationId]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <Drawer
      anchor="right"
      open={panelOpen}
      onClose={closePanel}
      PaperProps={{
        sx: { width: PANEL_WIDTH, display: 'flex', flexDirection: 'column' },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1.5,
            bgcolor: '#6366F1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SvgIcon sx={{ fontSize: 20, color: 'white' }}>
            <ShieldCheckIcon />
          </SvgIcon>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            Warden
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Tu guardián inteligente
          </Typography>
        </Box>
        <IconButton size="small" onClick={closePanel}>
          <SvgIcon fontSize="small">
            <XMarkIcon />
          </SvgIcon>
        </IconButton>
      </Box>

      {/* Messages */}
      <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <MessageList messages={messages} />
      </Box>

      {/* Input */}
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
            maxRows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu pregunta..."
            sx={{ fontSize: 14, py: 0.25 }}
          />
          <IconButton
            size="small"
            onClick={handleSubmit}
            disabled={!inputText.trim() || streamStatus === 'streaming'}
            sx={{ color: inputText.trim() ? '#6366F1' : 'text.disabled', flexShrink: 0 }}
          >
            <SvgIcon fontSize="small">
              <PaperAirplaneIcon />
            </SvgIcon>
          </IconButton>
        </Paper>
      </Box>
    </Drawer>
  );
}

WardenPanel.propTypes = {
  onSend: PropTypes.func.isRequired,
  streamStatus: PropTypes.string,
};
