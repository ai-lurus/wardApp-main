import Head from 'next/head';
import { Box, Container, Stack, Typography } from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { SubscriptionGuard } from 'src/guards/subscription-guard';
import { CustomersReport } from 'src/sections/customer/customers-report';

const Page = () => (
  <>
    <Head>
      <title>Reportes de Clientes | Ward</title>
    </Head>
    <Box component="main"
      sx={{ flexGrow: 1, py: 8 }}>
      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Typography variant="h4">Reportes de Clientes</Typography>
          <CustomersReport />
        </Stack>
      </Container>
    </Box>
  </>
);

Page.getLayout = (page) => (
  <DashboardLayout>
    <SubscriptionGuard moduleId="clientes">{page}</SubscriptionGuard>
  </DashboardLayout>
);

export default Page;
