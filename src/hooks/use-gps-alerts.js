import { useCallback, useEffect, useMemo, useState } from 'react';
import { gpsApi } from 'src/services/apiService';
import { isOpenAlert } from 'src/utils/gps-alerts';

/**
 * Alerts from the GPS alert center, kept in sync when any screen changes a status.
 * Used by the alert center, the side menu counter and the fleet map.
 */
export const useGpsAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setAlerts(await gpsApi.listAlerts());
    } catch (err) {
      console.error('Error loading GPS alerts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const unsubscribe = gpsApi.subscribeAlerts(load);
    // Other tabs change localStorage; reload so counters stay in sync.
    window.addEventListener('storage', load);
    return () => {
      unsubscribe();
      window.removeEventListener('storage', load);
    };
  }, [load]);

  const openAlerts = useMemo(() => alerts.filter(isOpenAlert), [alerts]);
  const openUnitIds = useMemo(() => new Set(openAlerts.map((alert) => alert.unitId)), [openAlerts]);

  return { alerts, loading, openCount: openAlerts.length, openUnitIds, reload: load };
};
