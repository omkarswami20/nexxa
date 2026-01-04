import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const EmptyState = ({ 
    icon: Icon, 
    title, 
    description, 
    actionLabel, 
    onAction,
    iconSize = 80,
    iconColor = 'text.secondary'
}) => {
    return (
        <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            sx={{
                textAlign: 'center',
                py: 8,
                px: 2,
            }}
        >
            {Icon && (
                <Box
                    sx={{
                        mb: 3,
                        display: 'inline-flex',
                        p: 2,
                        borderRadius: '50%',
                        bgcolor: 'action.hover',
                    }}
                >
                    <Icon sx={{ fontSize: iconSize, color: iconColor, opacity: 0.6 }} />
                </Box>
            )}
            <Typography variant="h6" color="text.primary" gutterBottom fontWeight={600}>
                {title}
            </Typography>
            {description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
                    {description}
                </Typography>
            )}
            {actionLabel && onAction && (
                <Button variant="contained" onClick={onAction} size="large">
                    {actionLabel}
                </Button>
            )}
        </MotionBox>
    );
};

export default EmptyState;

