import { Box, Paper, Typography } from '@mui/material';
import PropTypes from 'prop-types';

export default function FallbackCard({ cardType, payload }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, mt: 1 }}>
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
        >
          {cardType}
        </Typography>
        <Box
          component="pre"
          sx={{
            mt: 0.5,
            fontSize: 11,
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            color: 'text.secondary',
            m: 0,
          }}
        >
          {JSON.stringify(payload, null, 2)}
        </Box>
      </Box>
    </Paper>
  );
}

FallbackCard.propTypes = {
  cardType: PropTypes.string,
  payload: PropTypes.object,
};
