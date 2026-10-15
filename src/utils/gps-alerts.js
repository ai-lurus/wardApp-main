// Alert catalog for the GPS alert center.

export const ALERT_TYPES = {
  unauthorized_stop: { label: 'Parada no autorizada' },
  geofence_entry: { label: 'Entrada a geocerca' },
  geofence_exit: { label: 'Salida de geocerca' },
  geofence_dwell: { label: 'Permanencia en geocerca' },
  speeding: { label: 'Exceso de velocidad' },
  harsh_braking: { label: 'Frenado brusco' },
  hotspot: { label: 'Ruta caliente' },
  no_signal: { label: 'Unidad sin señal' },
  route_deviation: { label: 'Desvío de ruta' },
};

export const ALERT_SEVERITIES = {
  high: { label: 'Alta', color: 'error' },
  medium: { label: 'Media', color: 'warning' },
  low: { label: 'Baja', color: 'info' },
};

export const ALERT_STATUSES = {
  pending: { label: 'Pendiente', color: 'error' },
  in_progress: { label: 'En atención', color: 'warning' },
  resolved: { label: 'Resuelta', color: 'success' },
};

export const isOpenAlert = (alert) => alert.status !== 'resolved';
