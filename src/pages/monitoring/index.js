import { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { subDays, subHours } from 'date-fns';
import ArrowDownOnSquareIcon from '@heroicons/react/24/solid/ArrowDownOnSquareIcon';
import ArrowUpOnSquareIcon from '@heroicons/react/24/solid/ArrowUpOnSquareIcon';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import { Box, Button, Container, Stack, SvgIcon, Typography, Grid } from '@mui/material';
import { useSelection } from 'src/hooks/use-selection';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { MonitoringTable } from 'src/sections/yard-monitoring/monitoring-table';
import { CustomersSearch } from 'src/sections/customer/customers-search';
import { applyPagination } from 'src/utils/apply-pagination';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-qr-code';
import { fetchTransportData } from 'src/services/apiService'

const Page = () => {
	const [data, setData] = useState([]);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const { t } = useTranslation();

	useEffect(() => {
		const fetchData = async () => {
			setData(await fetchTransportData(page + 1, rowsPerPage))
		}

		fetchData();
	}, [rowsPerPage, page])

	const onPageChange = (e, page) => {
		setPage(page)
	}

	const onRowsPerPageChange = (e) => {
		setPage(0)
		setRowsPerPage(e?.target?.value)
	}

	return (
		<>
			<Head>
				<title>
					Almacen
				</title>
			</Head>
			<Box
				component="main"
				sx={{
					flexGrow: 1,
					py: 8
				}}
			>
				<Container maxWidth="xl">
					<Stack spacing={3}>
						<Stack
							direction="row"
							justifyContent="space-between"
							spacing={4}
						>
							<Stack spacing={1}>
								<Typography variant="h4">
									Monitoreo de balanza
								</Typography>
							</Stack>

						</Stack>
						{/* <CustomersSearch /> */}
						<Grid container>
							<Grid item xs={12}>
								<div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
									<Typography variant="h6" paddingBottom={3}>
										Entradas
									</Typography>
									<Button
										startIcon={(
											<SvgIcon fontSize="small">
												<PlusIcon />
											</SvgIcon>
										)}
										variant="contained"
										href="/monitoring/create-monitor"
									>
										Crear monitoreo
									</Button>
								</div>
								<MonitoringTable
									count={data?.totalCount}
									items={data?.data}
									page={page}
									rowsPerPage={rowsPerPage}
									onPageChange={onPageChange}
									onRowsPerPageChange={onRowsPerPageChange}
									columns={[
										{
											title: "Operación",
											attribute: "driver_name"
										},
										{
											title: "Productor",
											attribute: "truck_plates"
										},
										{
											title: "Producto",
											attribute: "driver_name"
										},
										{
											title: "Destino",
											attribute: "driver_name"
										},
										{
											title: "Status",
											attribute: "driver_name"
										},
										{
											title: "Fecha",
											attribute: "driver_name"
										},
									]}
								/>
							</Grid>
						</Grid>
								{/* <QRCode
									size={256}
									style={{ height: "auto", maxWidth: "100%", width: "100%" }}
									value={"La mir está bien bonita"}
									viewBox={`0 0 256 256`}
								/> */}
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
