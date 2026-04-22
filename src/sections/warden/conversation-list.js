import ChatBubbleOvalLeftIcon from '@heroicons/react/24/solid/ChatBubbleOvalLeftIcon';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import { Box, Button, Divider, IconButton, SvgIcon, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useWardenContext } from 'src/contexts/warden-context';

export default function ConversationList({ onNewConversation }) {
  const { conversations, activeConversationId, setActiveConversation } = useWardenContext();

  return (
    <Box
      sx={{
        width: 240,
        flexShrink: 0,
        borderRight: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Box sx={{ px: 2, py: 1.5 }}>
        <Button
          fullWidth
          variant="outlined"
          size="small"
          startIcon={
            <SvgIcon fontSize="small">
              <PlusIcon />
            </SvgIcon>
          }
          onClick={onNewConversation}
          sx={{ borderRadius: 1.5, textTransform: 'none' }}
        >
          Nueva conversación
        </Button>
      </Box>

      <Divider />

      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {conversations.length === 0 ? (
          <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
            <SvgIcon sx={{ fontSize: 32, color: 'text.disabled', mb: 1 }}>
              <ChatBubbleOvalLeftIcon />
            </SvgIcon>
            <Typography variant="body2" color="text.secondary">
              Sin conversaciones aún
            </Typography>
          </Box>
        ) : (
          conversations.map((conv) => {
            const isActive = conv.id === activeConversationId;
            return (
              <Box
                key={conv.id}
                onClick={() => setActiveConversation(conv.id)}
                sx={{
                  px: 2,
                  py: 1.25,
                  cursor: 'pointer',
                  bgcolor: isActive ? '#EEF2FF' : 'transparent',
                  borderLeft: isActive ? '3px solid #6366F1' : '3px solid transparent',
                  '&:hover': { bgcolor: isActive ? '#EEF2FF' : 'grey.50' },
                  transition: 'background-color 0.15s',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#6366F1' : 'text.primary',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {conv.preview || 'Conversación'}
                </Typography>
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
