import { useState } from 'react';
import Head from 'next/head';
import { Box, Button, Container, Stack, Typography, TextField } from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { useTranslation } from 'react-i18next';
import { fetchTransportData } from 'src/services/apiService';


const Page = () => {
	const { t } = useTranslation();
	const [driver, setDriver] = useState('');
	const [licensePlate, setLicensePlate] = useState('');
	const [cargoType, setCargoType] = useState('');
	const [weight, setWeight] = useState('');
	const [assignedProcesses, setAssignedProcesses] = useState('');
  
	const handleSubmit = async (event) => {
		
	  	const params = {
			TableName: 'monitor',
			Item: {
				id: uniqueId,
				cargo: cargoType,
				driver,
				plates: licensePlate,
				processes: [
				"proceso 1",
				"proceso 2"
				],
				weight
			}
		};
  
	  try {
		// Usa 'await' para esperar la respuesta de la operación PutItem
		await AWS.put(params).promise();
		console.log('Registro creado con éxito.');
		// Puedes hacer algo después de crear el registro, como limpiar el formulario o actualizar la interfaz de usuario
	  } catch (error) {
		console.error('Error al crear el registro en DynamoDB:', error);
		// Maneja el error si es necesario
	  }
  
	  // Limpia el formulario después de enviar los datos
	  setDriver('');
	  setLicensePlate('');
	  setCargoType('');
	  setAssignedProcesses('');
	  setWeight('');
	};

	return (
		<>
			<Head>
				<title>
					Crear monitoreo
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
									Crear monitoreo
								</Typography>
							</Stack>
						</Stack>
						<form onSubmit={handleSubmit}>
							<TextField
								label="Chofer"
								id="Chofer"
								variant="outlined"
								fullWidth
								value={driver}
								onChange={(e) => setDriver(e.target.value)}
								margin="normal"
								required
							/>
							<TextField
								label="Placas"
								variant="outlined"
								fullWidth
								value={licensePlate}
								onChange={(e) => setLicensePlate(e.target.value)}
								margin="normal"
								required
							/>
							<TextField
								label="Tipo de Carga"
								variant="outlined"
								fullWidth
								value={cargoType}
								onChange={(e) => setCargoType(e.target.value)}
								required
								margin="normal"
							/>
							<TextField
								label="Peso"
								variant="outlined"
								fullWidth
								value={weight}
								onChange={(e) => setWeight(e.target.value)}
								required
								margin="normal"
							/>
							<TextField
								label="Procesos Asignados"
								variant="outlined"
								fullWidth
								value={assignedProcesses}
								onChange={(e) => setAssignedProcesses(e.target.value)}
								required
								margin="normal"
							/>
							<Button type="submit" variant="contained" color="primary">
								Registrar Camión
							</Button>
						</form>
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
