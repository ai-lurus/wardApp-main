import { Box, Chip } from '@mui/material';
import PropTypes from 'prop-types';

const wardenChips = {
  inicio: ['Resumen del día', 'Alertas pendientes', 'Viajes en tránsito', 'Stock bajo'],
  inventario: ['Materiales con stock bajo', 'Últimos movimientos', 'Registrar entrada de aceite', 'Stock de filtros'],
  operaciones: ['Costo viaje MTY a CDMX', 'Viajes de mañana', 'Optimizar ruta', 'Rentabilidad del mes'],
  flotas: ['Unidades en mantenimiento', 'Scoring operador Juan Pérez', 'Próximos servicios', 'Llantas por cambiar'],
  clientes: ['Historial Cementos del Norte', 'Clientes con saldo pendiente', 'Viajes por cliente'],
  finanzas: ['Facturas vencidas', 'Cuentas por cobrar', 'Reporte de diésel', 'Estado de flujo'],
  monitoreo: ['¿Dónde está T-203?', 'Unidades fuera de geocerca', 'Alertas de pánico activas'],
  cumplimiento: ['Permisos por vencer', 'Verificaciones pendientes', 'Operadores con licencia por vencer', 'Reporte SAT pendiente'],
  admin: ['Usuarios activos', 'Roles del sistema', 'Últimos accesos'],
  warden: ['Resumen del día', '¿Qué viajes salen mañana?', 'Materiales por agotarse', 'Facturas vencidas'],
};

export default function SuggestionChips({ moduleId, onSelect }) {
  const chips = wardenChips[moduleId] ?? wardenChips.warden;

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, px: 1, pb: 0.5 }}>
      {chips.map((chip) => (
        <Chip
          key={chip}
          label={chip}
          size="small"
          onClick={() => onSelect(chip)}
          clickable
          sx={{
            fontSize: 12,
            height: 26,
            borderRadius: 1.5,
            bgcolor: 'grey.100',
            '&:hover': { bgcolor: 'grey.200' },
          }}
        />
      ))}
    </Box>
  );
}

SuggestionChips.propTypes = {
  moduleId: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
};
