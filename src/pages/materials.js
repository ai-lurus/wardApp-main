import { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Snackbar,
  Stack,
  SvgIcon,
  Typography,
} from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { MaterialsTable } from 'src/sections/inventory/materials-table';
import { MaterialsSearch } from 'src/sections/inventory/materials-search';
import { MaterialModal } from 'src/sections/inventory/material-modal';
import { applyPagination } from 'src/utils/apply-pagination';
import { materialsApi, categoriesApi, warehouseApi } from 'src/services/apiService';
import { useTranslation } from 'react-i18next';

const Page = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [matResult, cats, zns] = await Promise.all([
        materialsApi.list({ active: !showInactive }),
        categoriesApi.list(),
        warehouseApi.getZones(),
      ]);
      setMaterials(matResult.items);
      setCategories(cats);
      setZones(zns);
    } catch (err) {
      console.error('Error fetching materials:', err);
      setSnackbar({ open: true, message: 'Error al cargar materiales', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [showInactive]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredMaterials = useMemo(() => {
    let result = materials;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((m) => m.name.toLowerCase().includes(query));
    }
    if (categoryFilter) {
      result = result.filter((m) => m.categoryId === categoryFilter);
    }
    return result;
  }, [materials, searchQuery, categoryFilter]);

  const paginatedMaterials = useMemo(
    () => applyPagination(filteredMaterials, page, rowsPerPage),
    [filteredMaterials, page, rowsPerPage]
  );

  const handlePageChange = useCallback((event, value) => {
    setPage(value);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleEdit = useCallback((material) => {
    setEditingMaterial(material);
    setModalOpen(true);
  }, []);

  const handleToggleActive = useCallback(async (id) => {
    try {
      const material = materials.find((m) => m.id === id);
      if (!material) return;
      await materialsApi.toggleActive(id, !material.active);
      await fetchData();
    } catch (err) {
      setSnackbar({ open: true, message: 'Error al actualizar material', severity: 'error' });
    }
  }, [materials, fetchData]);

  const handleSave = useCallback(
    async (values) => {
      try {
        if (editingMaterial) {
          await materialsApi.update(editingMaterial.id, values);
        } else {
          await materialsApi.create(values);
        }
        setModalOpen(false);
        setEditingMaterial(null);
        await fetchData();
        setSnackbar({ open: true, message: 'Material guardado', severity: 'success' });
      } catch (err) {
        const message = err.response?.data?.message || 'Error al guardar material';
        setSnackbar({ open: true, message, severity: 'error' });
      }
    },
    [editingMaterial, fetchData]
  );

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setEditingMaterial(null);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setCategoryFilter('');
    setShowInactive(false);
  }, []);

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
        <title>Materiales | Ward</title>
      </Head>
      <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Typography variant="h4">{t('materials')}</Typography>
              <Button
                startIcon={
                  <SvgIcon fontSize="small">
                    <PlusIcon />
                  </SvgIcon>
                }
                variant="contained"
                onClick={() => setModalOpen(true)}
              >
                {t('newMaterial')}
              </Button>
            </Stack>
            <MaterialsSearch
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              categories={categories}
              locationFilter=""
              onLocationChange={() => {}}
              locations={[]}
              onClearFilters={handleClearFilters}
              showInactive={showInactive}
              onShowInactiveChange={setShowInactive}
            />
            <MaterialsTable
              count={filteredMaterials.length}
              items={paginatedMaterials}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              page={page}
              rowsPerPage={rowsPerPage}
              onEdit={handleEdit}
              onToggleActive={handleToggleActive}
            />
          </Stack>
        </Container>
      </Box>
      <MaterialModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        material={editingMaterial}
        categories={categories}
        zones={zones}
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
