import { useCallback, useEffect, useState } from 'react';
import { gpsApi } from 'src/services/apiService';
import { haversineKm } from 'src/utils/gps-route';

const CLOSED_DIALOG = { open: false, geofence: null, draft: null };
const MIN_RADIUS_KM = 0.5;

/**
 * State for creating and editing geofences: draw on the map (first click = center,
 * second click = edge), then fill in the details. Also holds the unauthorized-stop rule.
 */
export const useGeofenceEditor = ({ onChange, notify }) => {
  const [geofences, setGeofences] = useState([]);
  const [stopRules, setStopRules] = useState({ thresholdMinutes: 15 });
  const [drawing, setDrawing] = useState(false);
  const [draftPoints, setDraftPoints] = useState([]);
  const [dialog, setDialog] = useState(CLOSED_DIALOG);
  const [toDelete, setToDelete] = useState(null);

  const load = useCallback(async () => {
    try {
      const [fences, rules] = await Promise.all([gpsApi.listGeofences(), gpsApi.getStopRules()]);
      setGeofences(fences);
      setStopRules(rules);
    } catch (err) {
      console.error('Error loading geofences:', err);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = async () => {
    await load();
    await onChange();
  };

  const stopDrawing = () => {
    setDrawing(false);
    setDraftPoints([]);
  };

  // The second click sets the radius and opens the details form.
  const addPoint = (point) => {
    if (!draftPoints.length) {
      setDraftPoints([point]);
      return;
    }
    const center = draftPoints[0];
    const radiusKm = Math.max(MIN_RADIUS_KM, Math.round(haversineKm(center, point) * 10) / 10);
    setDraftPoints([center, point]);
    setDialog({ open: true, geofence: null, draft: { center, radiusKm } });
  };

  const save = async (values) => {
    if (dialog.geofence) {
      await gpsApi.updateGeofence(dialog.geofence.id, values);
    } else {
      await gpsApi.createGeofence({ ...values, center: dialog.draft.center });
    }
    setDialog(CLOSED_DIALOG);
    stopDrawing();
    await refresh();
    notify('Geocerca guardada');
  };

  const confirmDelete = async () => {
    try {
      await gpsApi.deleteGeofence(toDelete.id);
      await refresh();
      notify('Geocerca borrada');
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setToDelete(null);
    }
  };

  const saveThreshold = async (thresholdMinutes) => {
    try {
      setStopRules(await gpsApi.saveStopRules({ thresholdMinutes }));
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  return {
    geofences,
    stopRules,
    drawing,
    draftPoints,
    dialog,
    toDelete,
    startDrawing: () => {
      setDraftPoints([]);
      setDrawing(true);
    },
    addPoint,
    cancelDrawing: stopDrawing,
    edit: (geofence) => setDialog({ open: true, geofence, draft: null }),
    closeDialog: () => {
      setDialog(CLOSED_DIALOG);
      // Keep the center so a new edge can be picked.
      setDraftPoints((current) => current.slice(0, 1));
    },
    save,
    requestDelete: setToDelete,
    cancelDelete: () => setToDelete(null),
    confirmDelete,
    saveThreshold,
  };
};
