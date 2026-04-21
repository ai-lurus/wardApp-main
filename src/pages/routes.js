import { useState } from 'react';
import Head from 'next/head';
import { Box, Container, Stack, Typography, Tabs, Tab } from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { RoutesSection } from 'src/sections/route/routes-section';
import { TollboothsSection } from 'src/sections/tollbooth/tollbooths-section';

const Page = () => {
  const [tab, setTab] = useState(0);

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
            </Stack>

            {tab === 0 ? (
              <RoutesSection />
            ) : (
              <TollboothsSection />
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
