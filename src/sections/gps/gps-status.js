import PropTypes from 'prop-types';
import { SeverityPill } from 'src/components/severity-pill';

export const unitStatusMap = {
  moving: { label: 'En ruta', color: 'success' },
  stopped: { label: 'Detenida', color: 'warning' },
  idle: { label: 'En base', color: 'info' },
  offline: { label: 'Sin señal', color: 'error' },
};

export const tripStatusMap = {
  in_transit: { label: 'En tránsito', color: 'success' },
  delayed: { label: 'Retrasado', color: 'error' },
  scheduled: { label: 'Programado', color: 'info' },
  delivered: { label: 'Entregado', color: 'primary' },
};

export const UnitStatusPill = ({ status }) => {
  const config = unitStatusMap[status] || unitStatusMap.idle;
  return <SeverityPill color={config.color}>{config.label}</SeverityPill>;
};

UnitStatusPill.propTypes = {
  status: PropTypes.string,
};

export const TripStatusPill = ({ status }) => {
  const config = tripStatusMap[status] || tripStatusMap.scheduled;
  return <SeverityPill color={config.color}>{config.label}</SeverityPill>;
};

TripStatusPill.propTypes = {
  status: PropTypes.string,
};
