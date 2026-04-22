import ShieldCheckIcon from '@heroicons/react/24/solid/ShieldCheckIcon';
import { Avatar, Box, SvgIcon, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import AlertCard from './cards/alert-card';
import FallbackCard from './cards/fallback-card';
import OperatorCard from './cards/operator-card';
import ReportCard from './cards/report-card';

function CardRenderer({ card }) {
  switch (card.cardType) {
    case 'reporte':
      return <ReportCard payload={card.payload} />;
    case 'alerta':
      return <AlertCard payload={card.payload} />;
    case 'operador':
      return <OperatorCard payload={card.payload} />;
    default:
      return <FallbackCard cardType={card.cardType} payload={card.payload} />;
  }
}

CardRenderer.propTypes = {
  card: PropTypes.shape({
    cardType: PropTypes.string,
    payload: PropTypes.object,
  }),
};

function StreamingDots() {
  return (
    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', py: 0.5 }}>
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            bgcolor: 'text.disabled',
            animation: 'warden-bounce 1.2s infinite',
            animationDelay: `${i * 0.2}s`,
            '@keyframes warden-bounce': {
              '0%, 80%, 100%': { transform: 'scale(0.7)', opacity: 0.4 },
              '40%': { transform: 'scale(1)', opacity: 1 },
            },
          }}
        />
      ))}
    </Box>
  );
}

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
        <Box
          sx={{
            maxWidth: '75%',
            bgcolor: 'grey.100',
            borderRadius: 2,
            borderBottomRightRadius: 0.5,
            px: 2,
            py: 1,
          }}
        >
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {message.text}
          </Typography>
        </Box>
      </Box>
    );
  }

  const isStreaming = message.status === 'streaming';
  const hasText = Boolean(message.text);
  const cards = message.cards ?? [];

  return (
    <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5, alignItems: 'flex-start' }}>
      <Avatar
        sx={{
          width: 28,
          height: 28,
          bgcolor: '#6366F1',
          flexShrink: 0,
          mt: 0.25,
        }}
      >
        <SvgIcon sx={{ fontSize: 16 }}>
          <ShieldCheckIcon />
        </SvgIcon>
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        {isStreaming && !hasText ? (
          <StreamingDots />
        ) : (
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
            {message.text}
          </Typography>
        )}
        {cards.map((card, i) => (
          <CardRenderer key={i} card={card} />
        ))}
      </Box>
    </Box>
  );
}

MessageBubble.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.string,
    role: PropTypes.oneOf(['user', 'warden']),
    text: PropTypes.string,
    status: PropTypes.string,
    cards: PropTypes.array,
  }),
};
