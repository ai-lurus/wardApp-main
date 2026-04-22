import ChartBarSquareIcon from '@heroicons/react/24/solid/ChartBarSquareIcon';
import { Box, Paper, SvgIcon, Typography } from '@mui/material';
import PropTypes from 'prop-types';

export default function ReportCard({ payload }) {
  const { title, period, kpis = [] } = payload ?? {};

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', mt: 1 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'grey.50',
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1,
            bgcolor: '#EEF2FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <SvgIcon sx={{ fontSize: 18, color: '#6366F1' }}>
            <ChartBarSquareIcon />
          </SvgIcon>
        </Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>

      <Box sx={{ px: 2, py: 1.5 }}>
        {period && (
          <Box sx={{ mb: 1.5 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
            >
              Periodo
            </Typography>
            <Typography variant="body2">{period}</Typography>
          </Box>
        )}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {kpis.map((kpi, i) => (
            <Box key={i}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
              >
                {kpi.label}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {kpi.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
}

ReportCard.propTypes = {
  payload: PropTypes.shape({
    title: PropTypes.string,
    period: PropTypes.string,
    kpis: PropTypes.arrayOf(
      PropTypes.shape({ label: PropTypes.string, value: PropTypes.string })
    ),
  }),
};
