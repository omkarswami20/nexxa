import React from 'react';
import { Card, CardContent, Skeleton, Box } from '@mui/material';

const ProductSkeleton = () => {
    return (
        <Card
            sx={{
                height: '100%',
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Skeleton
                variant="rectangular"
                height={200}
                sx={{ borderRadius: '12px 12px 0 0' }}
            />
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Skeleton variant="text" width="80%" height={32} sx={{ mb: 1 }} />
                <Box sx={{ mb: 2 }}>
                    <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
                </Box>
                <Skeleton variant="text" width="100%" height={20} sx={{ mb: 0.5 }} />
                <Skeleton variant="text" width="90%" height={20} />
                <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2 }}>
                    <Skeleton variant="text" width={100} height={24} />
                    <Skeleton variant="rectangular" width={80} height={36} sx={{ borderRadius: 1 }} />
                </Box>
            </CardContent>
        </Card>
    );
};

export default ProductSkeleton;

