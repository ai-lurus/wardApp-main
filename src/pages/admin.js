import { useCallback, useMemo, useState } from 'react';
import Head from 'next/head';
import { subDays, subHours } from 'date-fns';
import ArrowDownOnSquareIcon from '@heroicons/react/24/solid/ArrowDownOnSquareIcon';
import ArrowUpOnSquareIcon from '@heroicons/react/24/solid/ArrowUpOnSquareIcon';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import { Box, Button, Container, Stack, SvgIcon, Typography, Grid, Tab } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { useSelection } from 'src/hooks/use-selection';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { InventoryTable } from 'src/sections/inventory/inventory-table';
import { CustomersSearch } from 'src/sections/customer/customers-search';
import { applyPagination } from 'src/utils/apply-pagination';
import { useTranslation } from 'react-i18next';
import OperationsComponent from 'src/components/admin/operations';
import DestiniesComponent from 'src/components/admin/destinies';
import TransportsComponent from 'src/components/admin/transports';
import ProducersComponent from 'src/components/admin/producers';
import UsersComponent from 'src/components/admin/users';

const now = new Date();

const data = [
	{
		id: 'A13',
		name: 'Tornillo',
		description: 'M3.5 - 3cm',
		createdAt: subDays(subHours(now, 7), 1).getTime(),
		amount: 50,
		group: "Suministros"
	},
	{
		id: 'A13',
		name: 'Tornillo',
		description: 'M3.5 - 3cm',
		createdAt: subDays(subHours(now, 7), 1).getTime(),
		amount: 50,
		group: "Suministros"
	},
	{
		id: 'A13',
		name: 'Tornillo',
		description: 'M3.5 - 3cm',
		createdAt: subDays(subHours(now, 7), 1).getTime(),
		amount: 50,
		group: "Suministros"
	},
	{
		id: 'A13',
		name: 'Tornillo',
		description: 'M3.5 - 3cm',
		createdAt: subDays(subHours(now, 7), 1).getTime(),
		amount: 50,
		group: "Suministros"
	},
	{
		id: 'A13',
		name: 'Tornillo',
		description: 'M3.5 - 3cm',
		createdAt: subDays(subHours(now, 7), 1).getTime(),
		amount: 50,
		group: "Suministros"
	},
	{
		id: 'A13',
		name: 'Tornillo',
		description: 'M3.5 - 3cm',
		createdAt: subDays(subHours(now, 7), 1).getTime(),
		amount: 50,
		group: "Suministros"
	},
	{
		id: 'A13',
		name: 'Tornillo',
		description: 'M3.5 - 3cm',
		createdAt: subDays(subHours(now, 7), 1).getTime(),
		amount: 50,
		group: "Suministros"
	},
	{
		id: 'A13',
		name: 'Tornillo',
		description: 'M3.5 - 3cm',
		createdAt: subDays(subHours(now, 7), 1).getTime(),
		amount: 50,
		group: "Suministros"
	},
	{
		id: 'A13',
		name: 'Tornillo',
		description: 'M3.5 - 3cm',
		createdAt: subDays(subHours(now, 7), 1).getTime(),
		amount: 50,
		group: "Suministros"
	},
];

const useCustomers = (page, rowsPerPage) => {
	return useMemo(
		() => {
			return applyPagination(data, page, rowsPerPage);
		},
		[page, rowsPerPage]
	);
};

const useCustomerIds = (customers) => {
	return useMemo(
		() => {
			return customers.map((customer) => customer.id);
		},
		[customers]
	);
};

const Page = () => {
	const [selectedTab, setSelectedTab] = useState("1")
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const customers = useCustomers(page, rowsPerPage);
	const customersIds = useCustomerIds(customers);
	const customersSelection = useSelection(customersIds);
	const { t } = useTranslation();

	return (
		<>
			<Head>
				<title>
					Administración
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
									Administración
								</Typography>
							</Stack>
							{/* <div>
								<Button
									startIcon={(
										<SvgIcon fontSize="small">
											<PlusIcon />
										</SvgIcon>
									)}
									variant="contained"
								>
									Add
								</Button>
							</div> */}
						</Stack>
						{/* <CustomersSearch /> */}
						<Grid container>

							<Grid item sm={12}>
								<TabContext value={selectedTab}>
									<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
										<TabList onChange={(e,v)=>setSelectedTab(v)} aria-label="tab">
										<Tab label="Operaciones" value="1" />
										<Tab label="Destinos" value="2" />
										<Tab label="Transportes" value="3" />
										<Tab label="Compañía" value="4" />
										<Tab label="Usuarios" value="5" />
										</TabList>
									</Box>
									<TabPanel value="1">
										<OperationsComponent />
									</TabPanel>
									<TabPanel value="2">
										<DestiniesComponent />
									</TabPanel>
									<TabPanel value="3">
										<TransportsComponent />
									</TabPanel>
									<TabPanel value="4">
										<ProducersComponent />
									</TabPanel>
									<TabPanel value="5">
										<UsersComponent />
									</TabPanel>
								</TabContext>
							</Grid>



							{/* <Grid item sm={12} md={5}>
								<Typography variant="h6" paddingBottom={3}>
									{t('inventory')}
								</Typography>
								<InventoryTable
									count={data.length}
									items={customers}
									page={page}
									rowsPerPage={rowsPerPage}
									selected={customersSelection.selected}
									fromDashboard
								/>
							</Grid>
							<Grid item sm={0} md={1}/>
							<Grid item sm={12} md={5}>
								<Typography variant="h6" paddingBottom={3}>
									Usuarios frecuentes
								</Typography>
								<InventoryTable
									count={data.length}
									items={customers}
									page={page}
									rowsPerPage={rowsPerPage}
									selected={customersSelection.selected}
									fromDashboard
								/>
							</Grid> */}
						</Grid>
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
