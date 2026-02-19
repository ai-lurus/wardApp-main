import { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import ArrowDownOnSquareIcon from '@heroicons/react/24/solid/ArrowDownOnSquareIcon';
import ArrowUpOnSquareIcon from '@heroicons/react/24/solid/ArrowUpOnSquareIcon';
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  InputAdornment,
  MenuItem,
  Snackbar,
  Stack,
  SvgIcon,
  TextField,
  Typography,
} from '@mui/material';
import MagnifyingGlassIcon from '@heroicons/react/24/solid/MagnifyingGlassIcon';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { MovementsTable } from 'src/sections/inventory/movements-table';
import { MovementModal } from 'src/sections/inventory/movement-modal';
import { applyPagination } from 'src/utils/apply-pagination';
import { inventoryApi, materialsApi } from 'src/services/apiService';
import { useTranslation } from 'react-i18next';

const Page = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [typeFilter, setTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('entry');
  const [movements, setMovements] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [movResult, matResult] = await Promise.all([
        inventoryApi.listMovements(),
        materialsApi.list({ active: true }),
      ]);
      setMovements(movResult.items);
      setMaterials(matResult.items);
    } catch (err) {
      console.error('Error fetching movements:', err);
      setSnackbar({ open: true, message: 'Error al cargar movimientos', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredMovements = useMemo(() => {
    let result = movements;
    if (typeFilter) {
      result = result.filter((m) => m.type === typeFilter);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((m) => m.materialName.toLowerCase().includes(query));
    }
    return result;
  }, [movements, typeFilter, searchQuery]);

  const paginatedMovements = useMemo(
    () => applyPagination(filteredMovements, page, rowsPerPage),
    [filteredMovements, page, rowsPerPage]
  );

  const handlePageChange = useCallback((event, value) => {
    setPage(value);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleOpenEntry = useCallback(() => {
    setModalType('entry');
    setModalOpen(true);
  }, []);

  const handleOpenExit = useCallback(() => {
    setModalType('exit');
    setModalOpen(true);
  }, []);

  const handleSave = useCallback(
    async (values) => {
      try {
        if (values.type === 'entry') {
          await inventoryApi.registerEntry(values);
        } else {
          await inventoryApi.registerExit(values);
        }
        setModalOpen(false);
        await fetchData();
        setSnackbar({
          open: true,
          message: values.type === 'entry' ? 'Entrada registrada' : 'Salida registrada',
          severity: 'success',
        });
      } catch (err) {
        const message = err.response?.data?.message || 'Error al registrar movimiento';
        setSnackbar({ open: true, message, severity: 'error' });
      }
    },
    [fetchData]
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Head>
        <title>Movimientos | Ward</title>
      </Head>
      <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Typography variant="h4">{t('movements')}</Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  startIcon={
                    <SvgIcon fontSize="small">
                      <ArrowDownOnSquareIcon />
                    </SvgIcon>
                  }
                  variant="contained"
                  color="success"
                  onClick={handleOpenEntry}
                >
                  {t('registerEntry')}
                </Button>
                <Button
                  startIcon={
                    <SvgIcon fontSize="small">
                      <ArrowUpOnSquareIcon />
                    </SvgIcon>
                  }
                  variant="contained"
                  color="warning"
                  onClick={handleOpenExit}
                >
                  {t('registerExit')}
                </Button>
              </Stack>
            </Stack>
            <Card sx={{ p: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
                  placeholder={t('search') + '...'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SvgIcon color="action" fontSize="small">
                          <MagnifyingGlassIcon />
                        </SvgIcon>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ maxWidth: 400 }}
                  size="small"
                />
                <TextField
                  select
                  label={t('type')}
                  value={typeFilter}
                  onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
                  sx={{ minWidth: 160 }}
                  size="small"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="entry">{t('entry')}</MenuItem>
                  <MenuItem value="exit">{t('exit')}</MenuItem>
                </TextField>
              </Stack>
            </Card>
            <MovementsTable
              count={filteredMovements.length}
              items={paginatedMovements}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              page={page}
              rowsPerPage={rowsPerPage}
            />
          </Stack>
        </Container>
      </Box>
      <MovementModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        type={modalType}
        materials={materials}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
