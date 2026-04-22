import ChatBubbleOvalLeftIcon from '@heroicons/react/24/solid/ChatBubbleOvalLeftIcon';
import MagnifyingGlassIcon from '@heroicons/react/24/solid/MagnifyingGlassIcon';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import { Box, Button, Divider, InputBase, SvgIcon, Typography } from '@mui/material';
import { format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useWardenContext } from 'src/contexts/warden-context';

function formatConvTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isToday(date)) return `Hoy, ${format(date, 'HH:mm')}`;
  if (isYesterday(date)) return `Ayer, ${format(date, 'HH:mm')}`;
  return format(date, 'd MMM, HH:mm', { locale: es });
}

export default function ConversationList({ onNewConversation }) {
  const { conversations, activeConversationId, setActiveConversation } = useWardenContext();
  const [search, setSearch] = useState('');

  const filtered = conversations.filter((c) =>
    (c.preview || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box
      sx={{
        width: 260,
        flexShrink: 0,
        borderRight: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ px: 2, pt: 2, pb: 1.5 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={
            <SvgIcon fontSize="small">
              <PlusIcon />
            </SvgIcon>
          }
          onClick={onNewConversation}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            bgcolor: '#6366F1',
            '&:hover': { bgcolor: '#4F46E5' },
            boxShadow: 'none',
            py: 1.25,
          }}
        >
          Nueva conversación
        </Button>
      </Box>

      <Box sx={{ px: 2, pb: 1.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 0.75,
            borderRadius: 2,
            bgcolor: 'grey.100',
          }}
        >
          <SvgIcon sx={{ fontSize: 16, color: 'text.disabled', flexShrink: 0 }}>
            <MagnifyingGlassIcon />
          </SvgIcon>
          <InputBase
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar conversaciones..."
            sx={{ fontSize: 13 }}
          />
        </Box>
      </Box>

      <Divider />

      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {filtered.length === 0 ? (
          <Box sx={{ px: 2, py: 4, textAlign: 'center' }}>
            <SvgIcon sx={{ fontSize: 36, color: 'text.disabled', mb: 1 }}>
              <ChatBubbleOvalLeftIcon />
            </SvgIcon>
            <Typography variant="body2" color="text.secondary">
              Sin conversaciones aún
            </Typography>
          </Box>
        ) : (
          filtered.map((conv) => {
            const isActive = conv.id === activeConversationId;
            const title = conv.title || conv.preview?.slice(0, 35) || 'Conversación';
            const preview = conv.preview || '';
            return (
              <Box
                key={conv.id}
                onClick={() => setActiveConversation(conv.id)}
                sx={{
                  px: 2,
                  py: 1.5,
                  cursor: 'pointer',
                  bgcolor: isActive ? '#EEF2FF' : 'transparent',
                  borderLeft: isActive ? '3px solid #6366F1' : '3px solid transparent',
                  '&:hover': { bgcolor: isActive ? '#EEF2FF' : 'grey.50' },
                  transition: 'background-color 0.15s',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 0.25,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: isActive ? '#6366F1' : 'text.primary',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1,
                      mr: 1,
                    }}
                  >
                    {title}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    sx={{ flexShrink: 0, fontSize: 11 }}
                  >
                    {formatConvTime(conv.createdAt)}
                  </Typography>
                </Box>
                {preview && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {preview}
                  </Typography>
                )}
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
}

ConversationList.propTypes = {
  onNewConversation: PropTypes.func.isRequired,
};
