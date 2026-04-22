import UserCircleIcon from '@heroicons/react/24/solid/UserCircleIcon';
import { Box, Chip, Paper, SvgIcon, Typography } from '@mui/material';
import PropTypes from 'prop-types';

function getColor(score) {
  if (score >= 85) return '#10B981';
  if (score >= 70) return '#F59E0B';
  return '#EF4444';
}

export default function OperatorCard({ payload }) {
  const { nombre, scoring, viajesActivos = 0, licencia, trend } = payload ?? {};
  const color = getColor(scoring ?? 0);

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
            bgcolor: '#F0FDF4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <SvgIcon sx={{ fontSize: 18, color: '#10B981' }}>
            <UserCircleIcon />
          </SvgIcon>
        </Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>
          {nombre ?? 'Operador'}
        </Typography>
        {scoring != null && (
          <Chip
            label={`${scoring} pts`}
            size="small"
            sx={{ bgcolor: `${color}20`, color, fontWeight: 700, fontSize: 11, height: 22 }}
          />
        )}
      </Box>

      <Box sx={{ px: 2, py: 1.5, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {scoring != null && (
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
            >
              Scoring
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color, lineHeight: 1.2 }}>
              {scoring}/100
            </Typography>
          </Box>
        )}
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
          >
            Viajes activos
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {viajesActivos}
          </Typography>
        </Box>
        {licencia && (
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
            >
              Licencia
            </Typography>
            <Typography variant="body2">{licencia}</Typography>
          </Box>
        )}
        {trend && (
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
            >
              Tendencia
            </Typography>
            <Typography variant="body2">
              {trend === 'up' ? '↑ Mejorando' : trend === 'down' ? '↓ Bajando' : '→ Estable'}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
}

OperatorCard.propTypes = {
  payload: PropTypes.shape({
    nombre: PropTypes.string,
    scoring: PropTypes.number,
    viajesActivos: PropTypes.number,
    licencia: PropTypes.string,
    trend: PropTypes.oneOf(['up', 'down', 'stable']),
  }),
};
