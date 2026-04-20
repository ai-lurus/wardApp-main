import { useCallback, useEffect, useState } from 'react';
import { Stack, Button } from '@mui/material';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import { TollboothsTable } from './tollbooths-table';
import { TollboothsSearch } from './tollbooths-search';
import { TollboothModal } from './tollbooth-modal';
import { tollboothsApi } from 'src/services/apiService';

export const TollboothsSection = ({ onRefreshSharedData }) => {
  const [tollbooths, setTollbooths] = useState([]);
  const [tbSearch, setTbSearch] = useState('');
  const [tbModal, setTbModal] = useState({ open: false, data: null });

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchTollbooths = useCallback(async () => {
    try {
      const data = await tollboothsApi.list({ search: tbSearch });
      setTollbooths(data);
      // Notify parent to update shared list of tollbooths (needed by RouteModal)
      onRefreshSharedData?.(data);
    } catch (err) {
      console.error('Error fetching tollbooths:', err);
    }
  }, [tbSearch, onRefreshSharedData]);

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
    }
  };

  const handleTbDelete = async (id) => {
    if (window.confirm('¿Estás seguro de desactivar esta caseta?')) {
      try {
        await tollboothsApi.delete(id);
        fetchTollbooths();
      } catch (err) {
        console.error('Error deleting tollbooth:', err);
      }
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="flex-end">
        <Button
          startIcon={<PlusIcon style={{ width: 20 }} />}
          variant="contained"
          onClick={() => setTbModal({ open: true, data: null })}
        >
          Nueva Caseta
        </Button>
      </Stack>
      <TollboothsSearch onSearch={setTbSearch} />
      <TollboothsTable 
        count={tollbooths.length}
        items={paginatedTollbooths}
        onEdit={(data) => setTbModal({ open: true, data })}
        onDelete={handleTbDelete}
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
      />
    </Stack>
  );
};
