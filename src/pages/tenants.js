import { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  Stack,
  SvgIcon,
  Typography,
} from '@mui/material';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { TenantsTable } from 'src/sections/tenants/tenants-table';
import { TenantFormModal } from 'src/sections/tenants/tenant-form-modal';
import { TenantUsersModal } from 'src/sections/tenants/tenant-users-modal';
import { adminApi } from 'src/services/apiService';

const Page = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const [usersOpen, setUsersOpen] = useState(false);
  const [usersTarget, setUsersTarget] = useState(null);

  const loadCompanies = useCallback(() => {
    setLoading(true);
    adminApi.listCompanies()
      .then(setCompanies)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadCompanies(); }, [loadCompanies]);

  const handleEdit = (company) => {
    setEditTarget(company);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const handleManageUsers = (company) => {
    setUsersTarget(company);
    setUsersOpen(true);
  };

  return (
    <>
      <Head>
        <title>Tenants | Ward</title>
      </Head>
      <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="lg">
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h4">Tenants</Typography>
              <Button
                startIcon={<SvgIcon fontSize="small"><PlusIcon /></SvgIcon>}
                variant="contained"
                onClick={handleCreate}
              >
                Nueva empresa
              </Button>
            </Stack>

            <Card>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TenantsTable
                  items={companies}
                  onEdit={handleEdit}
                  onManageUsers={handleManageUsers}
                />
              )}
            </Card>
          </Stack>
        </Container>
      </Box>

      <TenantFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={loadCompanies}
        company={editTarget}
      />

      <TenantUsersModal
        open={usersOpen}
        onClose={() => setUsersOpen(false)}
        company={usersTarget}
      />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
