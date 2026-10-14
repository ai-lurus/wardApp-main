import { useState } from 'react';
import Head from 'next/head';
import { Box, Container, Stack, Typography } from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { TripsSection } from 'src/sections/trip/trips-section';

const Page = () => {
  return (
    <>
      <Head>
        <title>Viajes | Ward</title>
      </Head>
      <Box component="main"
        sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack direction="row"
              justifyContent="space-between"
              spacing={4}>
              <Stack spacing={1}>
                <Typography variant="h4">Viajes</Typography>
              </Stack>
            </Stack>

            <TripsSection />
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
