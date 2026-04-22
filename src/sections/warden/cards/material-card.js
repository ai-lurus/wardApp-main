import CubeIcon from '@heroicons/react/24/solid/CubeIcon';
import { Box, Chip, Divider, Paper, SvgIcon, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const ESTADO_CONFIG = {
  ok:      { label: 'OK',      color: '#10B981', bg: '#ECFDF5' },
  bajo:    { label: 'Bajo',    color: '#F59E0B', bg: '#FFFBEB' },
  critico: { label: 'Crítico', color: '#EF4444', bg: '#FEF2F2' },
  agotado: { label: 'Agotado', color: '#7F1D1D', bg: '#FEE2E2' },
};

function Stat({ label, value, highlight }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 10 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: highlight ? 700 : 400, color: highlight ? 'text.primary' : 'text.secondary' }}>
        {value}
      </Typography>
    </Box>
  );
}

export default function MaterialCard({ payload }) {
  const {
    nombre,
    unidad,
    stock_actual,
    stock_minimo,
    estado = 'ok',
    valor_estimado,
    consumo_diario_promedio,
    dias_cobertura,
    ultima_entrada_dias,
  } = payload ?? {};

  const cfg = ESTADO_CONFIG[estado] ?? ESTADO_CONFIG.ok;

  const formatStock = (n) =>
    n != null ? n.toLocaleString('es-MX') : '—';

  const coberturaTxt = (() => {
    if (dias_cobertura == null) return '—';
    if (dias_cobertura >= 365) return `+1 año`;
    if (dias_cobertura >= 30) return `~${Math.floor(dias_cobertura / 30)} mes${Math.floor(dias_cobertura / 30) !== 1 ? 'es' : ''}`;
    return `${dias_cobertura} día${dias_cobertura !== 1 ? 's' : ''}`;
  })();

  const ultimaEntradaTxt = (() => {
    if (ultima_entrada_dias == null) return 'Sin registro';
    if (ultima_entrada_dias === 0) return 'Hoy';
    if (ultima_entrada_dias === 1) return 'Ayer';
    return `Hace ${ultima_entrada_dias} días`;
  })();

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
            <CubeIcon />
          </SvgIcon>
        </Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>
          {nombre ?? 'Material'}
        </Typography>
        <Chip
          label={cfg.label}
          size="small"
          sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: 11, height: 22 }}
        />
      </Box>

      <Box sx={{ px: 2, py: 1.5 }}>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 1.5 }}>
          <Stat label="Stock actual" value={`${formatStock(stock_actual)} ${unidad ?? ''}`} highlight />
          <Stat label="Mínimo config." value={`${formatStock(stock_minimo)} ${unidad ?? ''}`} />
          {valor_estimado && <Stat label="Valor estimado" value={valor_estimado} />}
        </Box>

        {(consumo_diario_promedio != null || dias_cobertura != null || ultima_entrada_dias != null) && (
          <>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              {dias_cobertura != null && (
                <Stat label="Días de cobertura" value={coberturaTxt} highlight={dias_cobertura < 14} />
              )}
              {consumo_diario_promedio != null && (
                <Stat
                  label="Consumo promedio/día"
                  value={`${consumo_diario_promedio.toLocaleString('es-MX')} ${unidad ?? ''}`}
                />
              )}
              {ultima_entrada_dias != null && (
                <Stat label="Última entrada" value={ultimaEntradaTxt} />
              )}
            </Box>
          </>
        )}
      </Box>
    </Paper>
  );
}

MaterialCard.propTypes = {
  payload: PropTypes.shape({
    nombre: PropTypes.string,
    unidad: PropTypes.string,
    stock_actual: PropTypes.number,
    stock_minimo: PropTypes.number,
    estado: PropTypes.oneOf(['ok', 'bajo', 'critico', 'agotado']),
    valor_estimado: PropTypes.string,
    consumo_diario_promedio: PropTypes.number,
    dias_cobertura: PropTypes.number,
    ultima_entrada_dias: PropTypes.number,
  }),
};
