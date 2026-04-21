import { useCallback, useEffect, useState } from 'react';
import { Stack, Button } from '@mui/material';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import { TollboothsTable } from './tollbooths-table';
import { TollboothsSearch } from './tollbooths-search';
import { TollboothModal } from './tollbooth-modal';
import { ConfirmActionModal } from 'src/components/confirm-action-modal';
import { tollboothsApi } from 'src/services/apiService';

export const TollboothsSection = () => {
  const [tollbooths, setTollbooths] = useState([]);
  const [tbSearch, setTbSearch] = useState('');
  const [tbModal, setTbModal] = useState({ open: false, data: null });
  const [tbError, setTbError] = useState('');
  const [confirmModal, setConfirmModal] = useState({ open: false, id: null, type: 'deactivate' });

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchTollbooths = useCallback(async () => {
    try {
      const data = await tollboothsApi.list({ search: tbSearch });
      setTollbooths(data);
    } catch (err) {
      console.error('Error fetching tollbooths:', err);
    }
  }, [tbSearch]);

  useEffect(() => {
    fetchTollbooths();
    setPage(0); // Reset page on search change
  }, [fetchTollbooths]);

  const handlePageChange = useCallback((event, value) => {
    setPage(value);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const paginatedTollbooths = tollbooths.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleTbSave = async (values) => {
    setTbError('');
    try {
      if (tbModal.data) {
        await tollboothsApi.update(tbModal.data.id, values);
      } else {
        await tollboothsApi.create(values);
      }
      setTbModal({ open: false, data: null });
      fetchTollbooths();
    } catch (err) {
      console.error('Error saving tollbooth:', err);
      const message = err.response?.data?.error || err.message || 'Error al guardar la caseta';
      setTbError(message);
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmModal.id) return;
    try {
      if (confirmModal.type === 'deactivate') {
        await tollboothsApi.delete(confirmModal.id);
      } else {
        await tollboothsApi.update(confirmModal.id, { active: true });
      }
      setConfirmModal({ open: false, id: null, type: 'deactivate' });
      fetchTollbooths();
    } catch (err) {
      console.error(`Error ${confirmModal.type} tollbooth:`, err);
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="flex-end">
        <Button
          startIcon={<PlusIcon style={{ width: 20 }} />}
          variant="contained"
          onClick={() => {
            setTbError('');
            setTbModal({ open: true, data: null });
          }}
        >
          Nueva Caseta
        </Button>
      </Stack>
      <TollboothsSearch onSearch={setTbSearch} />
      <TollboothsTable 
        count={tollbooths.length}
        items={paginatedTollbooths}
        onEdit={(data) => {
          setTbError('');
          setTbModal({ open: true, data });
        }}
        onDelete={(id) => setConfirmModal({ open: true, id, type: 'deactivate' })}
        onActivate={(id) => setConfirmModal({ open: true, id, type: 'activate' })}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
      />
      <TollboothModal
        open={tbModal.open}
        onClose={() => setTbModal({ open: false, data: null })}
        onSave={handleTbSave}
        tollbooth={tbModal.data}
        serverError={tbError}
      />
      <ConfirmActionModal
        open={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, id: null, type: 'deactivate' })}
        onConfirm={handleConfirmAction}
        title={confirmModal.type === 'deactivate' ? "¿Desactivar Caseta?" : "¿Reactivar Caseta?"}
        description={confirmModal.type === 'deactivate' 
          ? "Esta acción marcará la caseta como inactiva. Ten en cuenta que esto podría afectar a las rutas que incluyan esta caseta."
          : "Esta acción volverá a activar la caseta para su uso en rutas."}
        confirmText={confirmModal.type === 'deactivate' ? "Desactivar" : "Reactivar"}
        color={confirmModal.type === 'deactivate' ? "error" : "success"}
        iconType={confirmModal.type === 'deactivate' ? "warning" : "info"}
      />
    </Stack>
  );
};
