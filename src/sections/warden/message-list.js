import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import MessageBubble from './message-bubble';

export default function MessageList({ messages = [] }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Box
      sx={{
        flex: 1,
        overflowY: 'auto',
        px: 2,
        py: 2,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      <Box ref={bottomRef} />
    </Box>
  );
}

MessageList.propTypes = {
  messages: PropTypes.array,
};
