import { useEffect, useState } from 'react';
import Head from 'next/head';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import { Box, Button, Container, Stack, SvgIcon, Typography, Grid, TextField, Modal } from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { MonitoringTable } from 'src/sections/yard-monitoring/monitoring-table';
import { useTranslation } from 'react-i18next';
import { fetchTransportData, postTransport } from 'src/services/apiService';

const style = {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 400,
	bgcolor: '#fff',
	boxShadow: 24,
	borderRadius: 2,
	p: 4,
	width: "60%",
	height: 450,
};

const Page = () => {
	const [driverName, setDriverName] = useState("");
	const [truckPlates, setTruckPlates] = useState("");
	const [data, setData] = useState([]);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [showModal, setShowModal] = useState(false);
	const { t } = useTranslation();

	const fetchData = async () => {
		setData(await fetchTransportData(page + 1, rowsPerPage))
	}

	useEffect(() => {
		fetchData();
	}, [rowsPerPage, page])

	const onPageChange = (e, page) => {
		setPage(page)
	}

	const onRowsPerPageChange = (e) => {
		setPage(0)
		setRowsPerPage(e?.target?.value)
	}

	const handleSubmit = async (event) => {
		event.preventDefault();
		const response = await postTransport(driverName, truckPlates);
		response && setShowModal(false)
		setDriverName('');
		setTruckPlates('');
		fetchData();
	};

	return (
		<>
			<Container maxWidth="xl">
				<Stack spacing={3}>
					<Stack
						direction="row"
						justifyContent="space-between"
						spacing={4}
					>
						<Stack spacing={1}>
							{/* <Typography variant="h4">
								Transportes
							</Typography> */}
						</Stack>
						<Button
							color="primary"
							variant="contained"
							startIcon={(
								<SvgIcon fontSize="small">
									<PlusIcon />
								</SvgIcon>
							)}
							onClick={() => setShowModal(true)}
						>
							Nuevo transporte
						</Button>
					</Stack>






					<Modal
						open={showModal}
						onClose={() => setShowModal(false)}
						aria-labelledby="modal-modal-title"
						aria-describedby="modal-modal-description"
					>
						<Box sx={style}>
							<Typography id="modal-modal-title" variant="h6" component="h2" mb={6}>
								Registrar nuevo transporte
							</Typography>
							<form onSubmit={handleSubmit} style={{heigth: "100%"}}>
								<TextField
									label="Chofer"
									variant="outlined"
									fullWidth
									value={driverName}
									onChange={(e) => setDriverName(e.target.value)}
									required
									margin="normal"
								/>
								<TextField
									label="Placas"
									variant="outlined"
									fullWidth
									value={truckPlates}
									onChange={(e) => setTruckPlates(e.target.value)}
									required
									margin="normal"
								/>
								<div
									style={{
										position: "absolute",
										bottom: 0,
										marginBottom: 40,
										width: "100%",
										paddingRight: 64
									}}
								>
									<Button type="submit" variant="contained" color="primary" style={{width: "100%"}}>
										Confirmar
									</Button>
								</div>
							</form>
						</Box>
					</Modal>





					{/* <CustomersSearch /> */}
					<Grid container>
						{/* <Grid container xs={12} direction="columns">
							<Grid xs="6">

							</Grid>
							<Grid xs="4">
								
							</Grid>
							<Grid xs="2">
								
							</Grid>
						</Grid> */}
						<Grid item xs={12}>
							<Typography variant="h6" paddingBottom={3}>
								Entradas
							</Typography>
							<MonitoringTable
								count={data?.totalCount}
								items={data?.data}
								page={page}
								rowsPerPage={rowsPerPage}
								onPageChange={onPageChange}
								onRowsPerPageChange={onRowsPerPageChange}
								columns={[
									{
										title: "Chofer",
										attribute: "driver_name"
									},
									{
										title: "Placas",
										attribute: "truck_plates"
									},
								]}
							/>
						</Grid>
					</Grid>
				</Stack>
			</Container>
		</>
	);
};

Page.getLayout = (page) => (
	<DashboardLayout>
		{page}
	</DashboardLayout>
);

export default Page;
