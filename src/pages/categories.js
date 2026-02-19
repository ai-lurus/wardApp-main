import { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  Snackbar,
  Stack,
  SvgIcon,
  TextField,
  Typography,
} from '@mui/material';
import MagnifyingGlassIcon from '@heroicons/react/24/solid/MagnifyingGlassIcon';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { CategoriesTable } from 'src/sections/inventory/categories-table';
import { CategoryModal } from 'src/sections/inventory/category-modal';
import { applyPagination } from 'src/utils/apply-pagination';
import { categoriesApi } from 'src/services/apiService';
import { useTranslation } from 'react-i18next';

const Page = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const cats = await categoriesApi.list();
      setCategories(cats);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setSnackbar({ open: true, message: 'Error al cargar categorías', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;
    const query = searchQuery.toLowerCase();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        (c.description && c.description.toLowerCase().includes(query))
    );
  }, [categories, searchQuery]);

  const paginatedCategories = useMemo(
    () => applyPagination(filteredCategories, page, rowsPerPage),
    [filteredCategories, page, rowsPerPage]
  );

  const handlePageChange = useCallback((event, value) => {
    setPage(value);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleEdit = useCallback((category) => {
    setEditingCategory(category);
    setModalOpen(true);
  }, []);

  const handleDelete = useCallback((category) => {
    setDeletingCategory(category);
    setDeleteError('');
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    try {
      await categoriesApi.delete(deletingCategory.id);
      setDeleteDialogOpen(false);
      setDeletingCategory(null);
      await fetchCategories();
      setSnackbar({ open: true, message: 'Categoría eliminada', severity: 'success' });
    } catch (err) {
      const message = err.response?.data?.message || 'Error al eliminar categoría';
      setDeleteError(message);
    }
  }, [deletingCategory, fetchCategories]);

  const handleSave = useCallback(
    async (values) => {
      try {
        if (editingCategory) {
          await categoriesApi.update(editingCategory.id, values);
          setSnackbar({ open: true, message: 'Categoría actualizada', severity: 'success' });
        } else {
          await categoriesApi.create(values);
          setSnackbar({ open: true, message: 'Categoría creada', severity: 'success' });
        }
        setModalOpen(false);
        setEditingCategory(null);
        await fetchCategories();
      } catch (err) {
        const message = err.response?.data?.message || 'Error al guardar categoría';
        setSnackbar({ open: true, message, severity: 'error' });
      }
    },
    [editingCategory, fetchCategories]
  );

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setEditingCategory(null);
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
        <title>Categorías | Ward</title>
      </Head>
      <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Typography variant="h4">{t('categories')}</Typography>
              <Button
                startIcon={
                  <SvgIcon fontSize="small">
                    <PlusIcon />
                  </SvgIcon>
                }
                variant="contained"
                onClick={() => setModalOpen(true)}
              >
                {t('newCategory')}
              </Button>
            </Stack>
            <Card sx={{ p: 2 }}>
              <TextField
                placeholder={t('search')}
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
                size="small"
                sx={{ maxWidth: 400 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SvgIcon fontSize="small">
                        <MagnifyingGlassIcon />
                      </SvgIcon>
                    </InputAdornment>
                  ),
                }}
              />
            </Card>
            <CategoriesTable
              count={filteredCategories.length}
              items={paginatedCategories}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              page={page}
              rowsPerPage={rowsPerPage}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Stack>
        </Container>
      </Box>
      <CategoryModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        category={editingCategory}
      />
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>{t('deleteCategory')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('confirmDeleteCategory', { name: deletingCategory?.name })}
          </DialogContentText>
          {deleteError && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {deleteError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            {t('delete')}
          </Button>
        </DialogActions>
      </Dialog>
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
