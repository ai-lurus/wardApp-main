import { useState, useEffect } from 'react';
import { Avatar, Box } from '@mui/material';
import { PhotoIcon } from '@heroicons/react/24/solid';
import { uploadApi } from 'src/services/apiService';

export const SecureImage = ({ path, variant = 'rounded', sx = {}, ...props }) => {
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const fetchSignedUrl = async () => {
            if (!path) {
                setLoading(false);
                return;
            }

            // If it's already a full URL (e.g. from an old public upload or a local object URL), use it directly
            if (path.startsWith('http') || path.startsWith('blob:')) {
                setImageUrl(path);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const signedUrl = await uploadApi.getSignedUrl(path);
                if (mounted) {
                    setImageUrl(signedUrl);
                }
            } catch (error) {
                console.error('Failed to load secure image', error);
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
            <Avatar variant={variant} sx={{ ...sx, bgcolor: 'neutral.100' }} {...props}>
                <Box sx={{ width: '50%', height: '50%', bgcolor: 'neutral.200', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />
            </Avatar>
        );
    }

    return (
        <Avatar src={imageUrl || undefined} variant={variant} sx={{ ...sx, bgcolor: 'neutral.100' }} {...props}>
            {!imageUrl && <PhotoIcon style={{ width: '50%', height: '50%', color: '#9CA3AF' }} />}
        </Avatar>
    );
};
