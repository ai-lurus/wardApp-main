import { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  InputAdornment,
  Snackbar,
  Stack,
  SvgIcon,
  TextField,
  Typography,
} from '@mui/material';
import MagnifyingGlassIcon from '@heroicons/react/24/solid/MagnifyingGlassIcon';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { UsersTable } from 'src/sections/inventory/users-table';
import { UserModal } from 'src/sections/inventory/user-modal';
import { applyPagination } from 'src/utils/apply-pagination';
import { usersApi } from 'src/services/apiService';
import { useAuth } from 'src/hooks/use-auth';

const Page = () => {
  const auth = useAuth();
  const router = useRouter();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Admin-only guard
  useEffect(() => {
    if (!auth.isLoading && auth.user?.role !== 'admin') {
      router.replace('/');
    }
  }, [auth.isLoading, auth.user, router]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await usersApi.list();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setSnackbar({ open: true, message: 'Error al cargar usuarios', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (auth.user?.role === 'admin') {
      fetchUsers();
    }
  }, [auth.user, fetchUsers]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  const paginatedUsers = useMemo(
    () => applyPagination(filteredUsers, page, rowsPerPage),
    [filteredUsers, page, rowsPerPage]
  );

  const handlePageChange = useCallback((_event, value) => setPage(value), []);
  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleEdit = useCallback((user) => {
    setEditingUser(user);
    setModalOpen(true);
  }, []);

  const handleToggleStatus = useCallback(async (user) => {
    try {
      await usersApi.setStatus(user.id, !user.active);
      await fetchUsers();
      setSnackbar({
        open: true,
        message: `Usuario ${!user.active ? 'activado' : 'desactivado'}`,
        severity: 'success',
      });
    } catch (err) {
      setSnackbar({ open: true, message: 'Error al actualizar estado', severity: 'error' });
    }
  }, [fetchUsers]);

  const handleSave = useCallback(async (values) => {
    try {
      if (editingUser) {
        await usersApi.update(editingUser.id, values);
        setSnackbar({ open: true, message: 'Usuario actualizado', severity: 'success' });
      } else {
        await usersApi.create(values);
        setSnackbar({ open: true, message: 'Usuario creado', severity: 'success' });
      }
      setModalOpen(false);
      setEditingUser(null);
      await fetchUsers();
    } catch (err) {
      const message = err.response?.data?.error || 'Error al guardar usuario';
      setSnackbar({ open: true, message, severity: 'error' });
    }
  }, [editingUser, fetchUsers]);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setEditingUser(null);
  }, []);

  if (auth.isLoading || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (auth.user?.role !== 'admin') return null;

  return (
    <>
      <Head>
        <title>Usuarios | Ward</title>
      </Head>
      <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Typography variant="h4">Usuarios</Typography>
              <Button
                startIcon={
                  <SvgIcon fontSize="small">
                    <PlusIcon />
                  </SvgIcon>
                }
                variant="contained"
                onClick={() => setModalOpen(true)}
              >
                Nuevo Usuario
              </Button>
            </Stack>
            <TextField
              placeholder="Buscar por nombre o correo..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
              size="small"
              sx={{ maxWidth: 320 }}
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
            <UsersTable
              count={filteredUsers.length}
              items={paginatedUsers}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              page={page}
              rowsPerPage={rowsPerPage}
              onEdit={handleEdit}
              onToggleStatus={handleToggleStatus}
              currentUserId={auth.user?.id}
            />
          </Stack>
        </Container>
      </Box>
      <UserModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        user={editingUser}
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
