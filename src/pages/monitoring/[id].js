import { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { subDays, subHours } from 'date-fns';
import ArrowDownOnSquareIcon from '@heroicons/react/24/solid/ArrowDownOnSquareIcon';
import ArrowUpOnSquareIcon from '@heroicons/react/24/solid/ArrowUpOnSquareIcon';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import { Box, Button, Container, Stack, SvgIcon, Typography, Unstable_Grid2 as Grid, Item } from '@mui/material';
import { useSelection } from 'src/hooks/use-selection';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { MonitoringTable } from 'src/sections/yard-monitoring/monitoring-table';
import { CustomersSearch } from 'src/sections/customer/customers-search';
import { applyPagination } from 'src/utils/apply-pagination';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-qr-code';
// import { DynamoDB } from 'aws-sdk';
import { useRouter } from 'next/router';

const Page = () => {
	const [data, setData] = useState([]);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const { t } = useTranslation();
    const router = useRouter();
    const { id } = router.query;

	useEffect(() => {

	}, [])
	return (
		<>
		{console.log(data)}
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
				<Container>
					<Stack spacing={3} mb={3}>
						<Stack
							direction="row"
							justifyContent="space-between"
							spacing={4}
						>
							<Stack spacing={1}>
								<Typography variant="h4">
									Monitoreo de balanza #{id}
								</Typography>
							</Stack>
						</Stack>
					</Stack>
                    <hr />
                    <Grid container mt={5}>
                        <Grid container xs={12} md={5}>
                            <Grid xs={6}>
                                <Typography variant="h6" style={{ height: '30px' }}>
                                    Tipo de Operación:
                                </Typography>
                                <Typography variant="h6" style={{ height: '30px' }}>
                                    N° de Placa:
                                </Typography>
                                <Typography variant="h6" style={{ height: '30px' }}>
                                    Chofer:
                                </Typography>
                                <Typography variant="h6" style={{ height: '30px' }}>
                                    Brevete:
                                </Typography>
                                <Typography variant="h6" style={{ height: '30px' }} mt={4}>
                                    Producto:
                                </Typography>
                                <Typography variant="h6" style={{ height: '30px' }}>
                                    Productor:
                                </Typography>
                                <Typography variant="h6" style={{ height: '30px' }}>
                                    Observaciones:
                                </Typography>
                                <Typography variant="h6" style={{ height: '30px' }}>
                                    FOLIO:
                                </Typography>
                            </Grid>
                            <Grid xs={6} >
                                <Typography variant="subtitle1" style={{ height: '30px' }}>
                                    Despacho
                                </Typography>
                                <Typography variant="subtitle1" style={{ height: '30px' }}>
                                    56aN6U
                                </Typography>
                                <Typography variant="subtitle1" style={{ height: '30px' }}>
                                    Juan
                                </Typography>
                                <Typography variant="subtitle1" style={{ height: '30px' }}>
                                    idk
                                </Typography>
                                <Typography variant="subtitle1" style={{ height: '30px' }} mt={4}>
                                    Concentrado de Cobre
                                </Typography>
                                <Typography variant="subtitle1" style={{ height: '30px' }}>
                                    TRAFIMEXICO
                                </Typography>
                                <Typography variant="subtitle1" style={{ height: '30px' }}>
                                    MANDARIN
                                </Typography>
                                <Typography variant="subtitle1" style={{ height: '30px' }}>
                                    361505
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid container xs={12} md={5} mdOffset={1}>
                            <Grid xs={6}>
                                <Typography variant="h6" style={{ height: '30px' }}>
                                    IE:
                                </Typography>
                                <Typography variant="h6" style={{ height: '30px' }}>
                                    OO Truck ID:
                                </Typography>
                                <Typography variant="h6" style={{ height: '30px' }}>
                                    Vapor:
                                </Typography>
                                <Typography variant="h6" style={{ height: '30px' }}>
                                    Destino:
                                </Typography>
                                <Typography variant="h6" style={{ height: '30px' }}>
                                    N° de Guía:
                                </Typography>
                                <Typography variant="h6" style={{ height: '30px' }}>
                                    Lot:
                                </Typography>
                            </Grid>
                            <Grid xs={6}>
                                <Typography variant="subtitle1" style={{ height: '30px' }}>
                                    OO-IMX-2300411
                                </Typography>
                                <Typography variant="subtitle1" style={{ height: '30px' }}>
                                    IMX2312814
                                </Typography>
                                <Typography variant="subtitle1" style={{ height: '30px' }}>
                                    TRAFIGURA
                                </Typography>
                                <Typography variant="subtitle1" style={{ height: '30px' }}>
                                    LIANYUNGANG
                                </Typography>
                                <Typography variant="subtitle1" style={{ height: '30px' }}>
                                    124-2614-1
                                </Typography>
                                <Typography variant="subtitle1" style={{ height: '30px' }}>
                                    1
                                </Typography>
                            </Grid>
                            asdsa

								<QRCode
									size={56}
									style={{ height: "auto", maxWidth: "100%", width: "100%" }}
									value={"test"}
									viewBox={`0 0 256 256`}
								/>
                        </Grid>
                    </Grid>
                                asdsadsadas
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
