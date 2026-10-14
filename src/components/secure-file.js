import { useState, useEffect } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import DocumentIcon from '@heroicons/react/24/solid/DocumentIcon';
import ArrowDownTrayIcon from '@heroicons/react/24/solid/ArrowDownTrayIcon';
import { uploadApi } from 'src/services/apiService';

export const SecureFile = ({ path, fileName = 'Descargar documento', sx = {}, ...props }) => {
    const [fileUrl, setFileUrl] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const fetchSignedUrl = async () => {
            if (!path) {
                setLoading(false);
                return;
            }

            if (path.startsWith('http') || path.startsWith('blob:')) {
                setFileUrl(path);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const signedUrl = await uploadApi.getSignedUrl(path);
                if (mounted) {
                    setFileUrl(signedUrl);
                }
            } catch (error) {
                console.error('Failed to load secure file URL', error);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        fetchSignedUrl();

        return () => {
            mounted = false;
        };
    }, [path]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ...sx }} {...props}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">Cargando...</Typography>
            </Box>
        );
    }

    if (!fileUrl) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ...sx }} {...props}>
                <DocumentIcon style={{ width: 20, height: 20, color: '#9CA3AF' }} />
                <Typography variant="body2" color="text.disabled">No disponible</Typography>
            </Box>
        );
    }

    return (
        <Button
            component="a"
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<ArrowDownTrayIcon style={{ width: 16 }} />}
            variant="outlined"
            size="small"
            sx={{ ...sx }}
            {...props}
        >
            {fileName}
        </Button>
    );
};
