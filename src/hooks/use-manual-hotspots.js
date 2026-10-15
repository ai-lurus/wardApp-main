import { useCallback, useEffect, useState } from 'react';
import { gpsApi } from 'src/services/apiService';

const CLOSED_DIALOG = { open: false, hotspot: null };

/**
 * State for marking hot routes by hand: drawing points on the map, the details dialog,
 * and edit/delete. `onChange` runs after every save or delete so the map overlays reload.
 */
export const useManualHotspots = ({ onChange, notify }) => {
  const [hotspots, setHotspots] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const [draftPoints, setDraftPoints] = useState([]);
  const [dialog, setDialog] = useState(CLOSED_DIALOG);
  const [toDelete, setToDelete] = useState(null);

  const load = useCallback(async () => {
    try {
      setHotspots(await gpsApi.listManualHotspots());
    } catch (err) {
      console.error('Error loading manual hot routes:', err);
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

  const save = async (values) => {
    if (dialog.hotspot) {
      await gpsApi.updateManualHotspot(dialog.hotspot.id, values);
    } else {
      await gpsApi.createManualHotspot({ ...values, points: draftPoints });
    }
    setDialog(CLOSED_DIALOG);
    stopDrawing();
    await refresh();
    notify('Ruta caliente guardada');
  };

  const confirmDelete = async () => {
    try {
      await gpsApi.deleteManualHotspot(toDelete.id);
      await refresh();
      notify('Ruta caliente borrada');
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setToDelete(null);
    }
  };

  return {
    hotspots,
    drawing,
    draftPoints,
    dialog,
    toDelete,
    startDrawing: () => {
      setDraftPoints([]);
      setDrawing(true);
    },
    addPoint: (point) => setDraftPoints((current) => [...current, point]),
    undoPoint: () => setDraftPoints((current) => current.slice(0, -1)),
    cancelDrawing: stopDrawing,
    finishDrawing: () => setDialog({ open: true, hotspot: null }),
    edit: (hotspot) => setDialog({ open: true, hotspot }),
    closeDialog: () => setDialog(CLOSED_DIALOG),
    save,
    requestDelete: setToDelete,
    cancelDelete: () => setToDelete(null),
    confirmDelete,
  };
};
