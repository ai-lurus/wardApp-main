import { useEffect, useState } from 'react';
import Head from 'next/head';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import { Box, Button, Container, Stack, SvgIcon, Typography, Grid, TextField, Modal, Select, MenuItem, FormControl, InputLabel,
	OutlinedInput, Checkbox, ListItemText
} from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { MonitoringTable } from 'src/sections/yard-monitoring/monitoring-table';
import { useTranslation } from 'react-i18next';
import { fetchDestiniesData, postDestiny } from 'src/services/apiService';

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
	maxHeight: '60%',
	overflow: 'scroll',
	// height: 450,
};
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const names = [
  'Proceso 1',
  'Proceso 2',
];
const rolesArr = [
  'seguridad',
  'basculero',
];

const operaciones = {
	data: [
		{
			id: 1,
			name: "operacion 1",
			procesos: ['proceso 1', 'proceso 2']
		},
		{
			id: 2,
			name: "operacion 2",
			procesos: ['proceso 1', 'proceso 2']
		},
		{
			id: 3,
			name: "operacion 3",
			procesos: ['proceso 1', 'proceso 2']
		}
	],
	count: 3
}
const procesos = {
	data: [
		{
			id: 1,
			name: "proceso 1",
			roles: ['seguridad', 'basculero']
		},
		{
			id: 2,
			name: "proceso 2",
			roles: ['seguridad', 'basculero']
		},
	],
	count: 2
}

const Page = () => {
	const [newDestiny, setNewDestiny] = useState("");
	const [data, setData] = useState([]);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [showModal, setShowModal] = useState(false);
	const [showModal2, setShowModal2] = useState(false);
	const [customInputs, setCustomInputs] = useState([]);
	const { t } = useTranslation();


	// Multiselect
	const [personName, setPersonName] = useState([]);
	const [roles, setRoles] = useState([]);

	const handleChange = (event) => {
	  const {
		target: { value },
	  } = event;
	  setPersonName(
		// On autofill we get a stringified value.
		typeof value === 'string' ? value.split(',') : value,
	  );
	};
	// Multiselect


	const fetchData = async () => {
		setData(await fetchDestiniesData(page + 1, rowsPerPage))
	}

	useEffect(() => {
		// fetchData();
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
		const response = await postDestiny(newDestiny);
		response && setShowModal(false)
		setNewDestiny('');
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
								Operaciones
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
							Nueva Operación
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
								Registrar nueva operación
							</Typography>
							<form onSubmit={handleSubmit} style={{heigth: "100%"}}>
								<TextField
									label="Nombre"
									variant="outlined"
									fullWidth
									value={newDestiny}
									onChange={(e) => setNewDestiny(e.target.value)}
									required
									margin="normal"
								/>
								<FormControl fullWidth>
									<InputLabel id="demo-multiple-checkbox-label">
										Procesos
									</InputLabel>
									<Select
										labelId="demo-multiple-checkbox-label"
										id="demo-multiple-checkbox"
										variant="outlined"
										multiple
										value={personName}
										onChange={handleChange}
										input={<OutlinedInput label="Tag" />}
										renderValue={(selected) => selected.join(', ')}
										MenuProps={MenuProps}
									>
									{names.map((name) => (
										<MenuItem key={name} value={name}>
										<Checkbox checked={personName.indexOf(name) > -1} />
										<ListItemText primary={name} />
										</MenuItem>
									))}
									</Select>
								</FormControl>
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
								Operaciones
							</Typography>
							<MonitoringTable
								count={operaciones.count}
								items={operaciones.data}
								page={page}
								rowsPerPage={rowsPerPage}
								onPageChange={onPageChange}
								onRowsPerPageChange={onRowsPerPageChange}
								columns={[
									{
										title: "Operación",
										attribute: "name"
									},
									{
										title: "Procesos asignados",
										attribute: "procesos"
									},
								]}
							/>
						</Grid>
					</Grid>


					<Stack
						direction="row"
						justifyContent="space-between"
						spacing={4}
					>
						<Stack spacing={1}>
							
						</Stack>
						<Button
							color="primary"
							variant="contained"
							startIcon={(
								<SvgIcon fontSize="small">
									<PlusIcon />
								</SvgIcon>
							)}
							onClick={() => setShowModal2(true)}
						>
							Nuevo Proceso
						</Button>
					</Stack>

					<Modal
						open={showModal2}
						onClose={() => setShowModal2(false)}
						aria-labelledby="modal-modal-title"
						aria-describedby="modal-modal-description"
					>
						<Box sx={style}>
							<Typography id="modal-modal-title" variant="h6" component="h2" mb={6}>
								Registrar nueva operación
							</Typography>
							<form onSubmit={handleSubmit} style={{heigth: "100%"}}>
								<TextField
									label="Nombre"
									variant="outlined"
									fullWidth
									value={newDestiny}
									onChange={(e) => setNewDestiny(e.target.value)}
									required
									margin="normal"
								/>
								<FormControl fullWidth>
									<InputLabel id="demo-multiple-checkbox-label">
										Roles
									</InputLabel>
									<Select
										labelId="demo-multiple-checkbox-label"
										id="demo-multiple-checkbox"
										variant="outlined"
										multiple
										value={roles}
										onChange={handleChange}
										input={<OutlinedInput label="Tag" />}
										renderValue={(selected) => selected.join(', ')}
										MenuProps={MenuProps}
									>
									{rolesArr.map((rol) => (
										<MenuItem key={rol} value={rol}>
										<Checkbox checked={roles.indexOf(rol) > -1} />
										<ListItemText primary={rol} />
										</MenuItem>
									))}
									</Select>
								</FormControl>
								{customInputs.map((input, id) => (
									<>
										<Typography variant="button" paddingBottom={3}>
											Dato {id+1}
										</Typography>
										<TextField
											label="Nombre"
											variant="outlined"
											fullWidth
											value={input.name}
											onChange={(e) => setCustomInputs([...customInputs, customInputs[id].name= e.target.value])}
											required
											margin="normal"
										/>
									</>
								))}
								<Button type="button" variant="outlined"style={{width: "00%", minWidth: 200, marginTop: 20}}
									startIcon={(
										<SvgIcon fontSize="small">
											<PlusIcon />
										</SvgIcon>
									)}
									onClick={() => setCustomInputs([...customInputs, {name: ''}])}
								>
									agregar campo
								</Button>
								<div
									style={{
										width: "100%",
										marginTop: 20,
									}}
								>
									<Button type="submit" variant="contained" color="primary" style={{width: "100%"}}>
										Confirmar
									</Button>
								</div>
							</form>
						</Box>
					</Modal>

					<Grid container mt={6}>
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
								Procesos
							</Typography>
							<MonitoringTable
								count={procesos?.count}
								items={procesos?.data}
								page={page}
								rowsPerPage={rowsPerPage}
								onPageChange={onPageChange}
								onRowsPerPageChange={onRowsPerPageChange}
								columns={[
									{
										title: "Proceso",
										attribute: "name"
									},
									{
										title: "Roles",
										attribute: "roles"
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
