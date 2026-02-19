import { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { subDays, subHours } from 'date-fns';
import ArrowDownOnSquareIcon from '@heroicons/react/24/solid/ArrowDownOnSquareIcon';
import ArrowUpOnSquareIcon from '@heroicons/react/24/solid/ArrowUpOnSquareIcon';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import { Box, Button, Container, Stack, SvgIcon, Typography, Grid, Modal, TextField } from '@mui/material';
import { useSelection } from 'src/hooks/use-selection';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { MonitoringTable } from 'src/sections/yard-monitoring/monitoring-table';
import { CustomersSearch } from 'src/sections/customer/customers-search';
import { applyPagination } from 'src/utils/apply-pagination';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-qr-code';
import { fetchTransportData } from 'src/services/apiService'

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
};

const Page = () => {
	const [data, setData] = useState([]);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [showUserModal, setShowUserModal] = useState(false);
	const [showRoleModal, setShowRoleModal] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null);
	const [selectedRole, setSelectedRole] = useState(null);
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

	const selectUser = (userId) => {
		setSelectedUser(userId);
		setShowUserModal(true);
	}

	const selectRol = (roleId) => {
		setSelectedRole(roleId);
		setShowRoleModal(true);
	}

	const handleSubmitUser = async (event) => {
		event.preventDefault();
		// const response = await postTransport(driverName, truckPlates);
		response && setShowUserModal(false)
		// setDriverName('');
		// setTruckPlates('');
		// fetchData();
	};

	const handleSubmitRol= async (event) => {
		event.preventDefault();
		// const response = await postTransport(driverName, truckPlates);
		response && setShowRoleModal(false)
		// setDriverName('');
		// setTruckPlates('');
		// fetchData();
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
								Usuarios
							</Typography> */}
						</Stack>
					</Stack>
					{/* <CustomersSearch /> */}
					<Grid container>
						<Grid item xs={12}>
							<div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
								<Typography variant="h6" paddingBottom={3}>
									Usuarios
								</Typography>
								<Button
									startIcon={(
										<SvgIcon fontSize="small">
											<PlusIcon />
										</SvgIcon>
									)}
									variant="contained"

									onClick={() => setShowUserModal(true)}
								>
									Crear usuario
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
										title: "Nombre",
										attribute: "driver_name"
									},
									{
										title: "Email",
										attribute: "truck_plates"
									},
									{
										title: "Rol",
										attribute: "truck_plates"
									},
									{
										title: "Contraseña",
										attribute: "truck_plates"
									},
								]}
								selectItem={selectUser}
							/>
						</Grid>
						<Grid item xs={12} mt={6}>
							<div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
								<Typography variant="h6" paddingBottom={3}>
									Roles
								</Typography>
								<Button
									startIcon={(
										<SvgIcon fontSize="small">
											<PlusIcon />
										</SvgIcon>
									)}
									variant="contained"
									onClick={() => setShowRoleModal(true)}
								>
									Crear rol
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
										title: "Rol",
										attribute: "driver_name"
									},
									{
										title: "Permisos",
										attribute: "truck_plates"
									},
								]}
								selectItem={selectRol}
							/>
						</Grid>
					</Grid>
					{/* MODAL USUARIO */}
					<Modal
						open={showUserModal}
						onClose={() => { setShowUserModal(false); setSelectedUser(null)}}
						aria-labelledby="modal-modal-title"
						aria-describedby="modal-modal-description"
					>
						<Box sx={style}>
							<Typography id="modal-modal-title" variant="h6" component="h2" mb={6}>
								{
									selectedUser ? 
									"Detalles de usuario" :
									"Registrar nuevo usuario"
								}
							</Typography>
							<form onSubmit={handleSubmitUser} style={{heigth: "100%"}}>
								<TextField
									label="Nomrbre"
									variant="outlined"
									fullWidth
									// value={driverName}
									// onChange={(e) => setDriverName(e.target.value)}
									required
									margin="normal"
								/>
								<TextField
									label="Email"
									variant="outlined"
									fullWidth
									// value={truckPlates}
									// onChange={(e) => setTruckPlates(e.target.value)}
									required
									margin="normal"
								/>
								<TextField
									label="Rol"
									variant="outlined"
									fullWidth
									// value={truckPlates}
									// onChange={(e) => setTruckPlates(e.target.value)}
									margin="normal"
								/>
								<div
									style={{
										paddingTop: 24
									}}
								>
									<Button type="submit" variant="contained" color="primary" style={{width: "100%"}}>
										{
											selectedUser ?
											"Confirmar cambios" :
											"Confirmar"
										}

									</Button>
									{
										selectedUser && (
											<Button type="submit" variant="contained" color="error" style={{width: "100%", marginTop: 24}}>
												Eliminar
											</Button>
										)
									}
								</div>
							</form>
						</Box>
					</Modal>
					{/* MODAL ROLES */}
					<Modal
						open={showRoleModal}
						onClose={() => { setShowRoleModal(false); setSelectedRole(null)}}
						aria-labelledby="modal-modal-title"
						aria-describedby="modal-modal-description"
					>
						<Box sx={style}>
							<Typography id="modal-modal-title" variant="h6" component="h2" mb={6}>
								{
									selectedRole ? 
									"Detalles de rol" :
									"Registrar nuevo rol"
								}
							</Typography>
							<form onSubmit={handleSubmitRol} style={{heigth: "100%"}}>
								<TextField
									label="Rol"
									variant="outlined"
									fullWidth
									// value={driverName}
									// onChange={(e) => setDriverName(e.target.value)}
									required
									margin="normal"
								/>
								<TextField
									label="Permisos"
									variant="outlined"
									fullWidth
									// value={truckPlates}
									// onChange={(e) => setTruckPlates(e.target.value)}
									required
									margin="normal"
								/>
								<div
									style={{
										paddingTop: 24
									}}
								>
									<Button type="submit" variant="contained" color="primary" style={{width: "100%"}}>
										{
											selectedRole ?
											"Confirmar cambios" :
											"Confirmar"
										}

									</Button>
									{
										selectedRole && (
											<Button type="submit" variant="contained" color="error" style={{width: "100%", marginTop: 24}}>
												Eliminar
											</Button>
										)
									}
								</div>
							</form>
						</Box>
					</Modal>
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
