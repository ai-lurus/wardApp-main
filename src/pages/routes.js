import { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import { Box, Button, Container, Stack, Typography, Tabs, Tab } from '@mui/material';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { RoutesSection } from 'src/sections/route/routes-section';
import { TollboothsSection } from 'src/sections/tollbooth/tollbooths-section';
import { tollboothsApi } from 'src/services/apiService';

const Page = () => {
  const [tab, setTab] = useState(0);
  const [sharedTollbooths, setSharedTollbooths] = useState([]);

  // We still need all tollbooths list in the parent or fetched in RoutesSection
  // because RouteModal needs it. Fetching it here and passing it down is fine
  // as it doesn't change on every keystroke.
  const fetchSharedTollbooths = useCallback(async () => {
    try {
      const data = await tollboothsApi.list();
      setSharedTollbooths(data);
    } catch (err) {
      console.error('Error fetching shared tollbooths:', err);
    }
  }, []);

  useEffect(() => {
    fetchSharedTollbooths();
  }, [fetchSharedTollbooths]);

  return (
    <>
      <Head>
        <title>Rutas y Casetas | Ward</title>
      </Head>
      <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Stack spacing={1}>
                <Typography variant="h4">Rutas y Casetas</Typography>
                <Tabs value={tab} onChange={(e, v) => setTab(v)}>
                  <Tab label="Administración de Rutas" />
                  <Tab label="Configuración de Casetas" />
                </Tabs>
              </Stack>
              {/* Note: The 'New' buttons can be moved inside sections for even better encapsulation,
                  but for now, they are kept here to maintain the header layout.
                  Sub-components could expose a ref or we could use a custom event.
                  However, having them inside sections is cleaner for re-renders.
                  Let's just keep them in parent for now, but use a more stable state. */}
            </Stack>

            {tab === 0 ? (
              <RoutesSection allTollbooths={sharedTollbooths} />
            ) : (
              <TollboothsSection onRefreshSharedData={setSharedTollbooths} />
            )}
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default Page;
