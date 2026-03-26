import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Container,
    Divider,
    Stack,
    Typography,
    Chip,
    Grid,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import CheckCircleIcon from '@heroicons/react/24/solid/CheckCircleIcon';
import XCircleIcon from '@heroicons/react/24/outline/XCircleIcon';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { useAuth } from 'src/hooks/use-auth';
import { billingApi } from 'src/services/apiService';
import { useTranslation } from 'react-i18next';

const ALL_MODULES = [
    { id: 'inventario', name: 'Inventario', basic: true },
    { id: 'operaciones', name: 'Operaciones', basic: false },
    { id: 'flotas', name: 'Flotas', basic: false },
    { id: 'clientes', name: 'Clientes', basic: false },
    { id: 'finanzas', name: 'Finanzas', basic: false },
];

const Page = () => {
    const { user, refreshUser } = useAuth();
    const { t } = useTranslation();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // After Stripe redirects back with ?status=success, poll until subscription is active
    useEffect(() => {
        if (router.query.status !== 'success') return;

        router.replace('/billing', undefined, { shallow: true });

        let attempts = 0;
        const maxAttempts = 10;

        const poll = async () => {
            await refreshUser();
            attempts++;
            // Keep polling until active or max attempts reached
            const currentStatus = user?.company?.subscription_status;
            if (currentStatus !== 'active' && currentStatus !== 'trialing' && attempts < maxAttempts) {
                setTimeout(poll, 2000);
            }
        };

        setTimeout(poll, 1500); // Wait 1.5s before first attempt
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router.query.status]);

    const activeModules = user?.company?.active_modules || ['inventario'];
    const status = user?.company?.subscription_status;

    const isActiveSubscription = status === 'active' || status === 'trialing';

    const handleManageSubscription = async () => {
        try {
            setLoading(true);
            const returnUrl = window.location.origin + '/billing';

            if (isActiveSubscription) {
                // Active/trialing → manage via Stripe portal
                const { url } = await billingApi.createPortalSession(returnUrl);
                window.location.href = url;
            } else {
                // No subscription or canceled → new checkout
                const { url } = await billingApi.createCheckoutSession(activeModules, returnUrl);
                window.location.href = url;
            }
        } catch (err) {
            console.error(err);
            alert('Error abriendo el portal de facturación');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Suscripción | Ward</title>
            </Head>
            <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
                <Container maxWidth="lg">
                    <Stack spacing={3}>
                        <Typography variant="h4">Suscripción y Módulos</Typography>

                        <Grid container spacing={3}>
                            <Grid item xs={12} md={5}>
                                <Card>
                                    <CardHeader title="Estado de cuenta" />
                                    <Divider />
                                    <CardContent>
                                        <Stack spacing={2}>
                                            <Box>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    Empresa
                                                </Typography>
                                                <Typography variant="body1">
                                                    {user?.company?.name || 'Cargando...'}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    Estado de suscripción
                                                </Typography>
                                                <Box sx={{ mt: 1 }}>
                                                    {status === 'active' ? (
                                                        <Chip label="Suscripción Activa" color="success" />
                                                    ) : status === 'trialing' ? (
                                                        <Chip label="Periodo de Prueba" color="warning" />
                                                    ) : status === 'past_due' ? (
                                                        <Chip label="Pago Pendiente" color="error" />
                                                    ) : status === 'canceled' ? (
                                                        <Chip label="Cancelada" color="default" />
                                                    ) : (
                                                        <Chip label="Sin suscripción" color="default" />
                                                    )}
                                                </Box>
                                            </Box>
                                            <Box sx={{ mt: 2 }}>
                                                <Button
                                                    variant="contained"
                                                    fullWidth
                                                    onClick={handleManageSubscription}
                                                    disabled={loading}
                                                >
                                                    {isActiveSubscription ? 'Gestionar Facturación' : 'Obtener Suscripción Pro'}
                                                </Button>
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} md={7}>
                                <Card>
                                    <CardHeader title="Módulos Asignados" />
                                    <Divider />
                                    <List>
                                        {ALL_MODULES.map((mod) => {
                                            const isActive = activeModules.includes(mod.id);
                                            return (
                                                <ListItem key={mod.id} divider>
                                                    <ListItemIcon>
                                                        {isActive ? (
                                                            <CheckCircleIcon style={{ width: 24, color: '#10B981' }} />
                                                        ) : (
                                                            <XCircleIcon style={{ width: 24, color: '#9CA3AF' }} />
                                                        )}
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={mod.name}
                                                        secondary={isActive ? 'Activo en tu plan' : 'No disponible'}
                                                    />
                                                </ListItem>
                                            );
                                        })}
                                    </List>
                                </Card>
                            </Grid>
                        </Grid>
                    </Stack>
                </Container>
            </Box>
        </>
    );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
