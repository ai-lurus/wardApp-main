import ExclamationTriangleIcon from '@heroicons/react/24/solid/ExclamationTriangleIcon';
import { Box, Chip, Paper, SvgIcon, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const SEVERITY_CONFIG = {
  critical: { label: 'Crítica', color: '#EF4444', bg: '#FEF2F2' },
  warning: { label: 'Media', color: '#F59E0B', bg: '#FFFBEB' },
  info: { label: 'Info', color: '#3B82F6', bg: '#EFF6FF' },
};

export default function AlertCard({ payload }) {
  const { severity = 'warning', title, description, suggestedAction } = payload ?? {};
  const cfg = SEVERITY_CONFIG[severity] ?? SEVERITY_CONFIG.warning;

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
            bgcolor: cfg.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <SvgIcon sx={{ fontSize: 18, color: cfg.color }}>
            <ExclamationTriangleIcon />
          </SvgIcon>
        </Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>
          {title ?? 'Alerta'}
        </Typography>
        <Chip
          label={cfg.label}
          size="small"
          sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: 11, height: 22 }}
        />
      </Box>

      <Box sx={{ px: 2, py: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {description && (
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
            >
              Descripción
            </Typography>
            <Typography variant="body2">{description}</Typography>
          </Box>
        )}
        {suggestedAction && (
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
            >
              Acción sugerida
            </Typography>
            <Typography variant="body2" sx={{ color: '#6366F1' }}>
              {suggestedAction}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
}

AlertCard.propTypes = {
  payload: PropTypes.shape({
    severity: PropTypes.oneOf(['critical', 'warning', 'info']),
    title: PropTypes.string,
    description: PropTypes.string,
    suggestedAction: PropTypes.string,
  }),
};
