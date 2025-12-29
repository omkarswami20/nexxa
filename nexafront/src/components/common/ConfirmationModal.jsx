import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    CircularProgress,
} from '@mui/material';

const ConfirmationModal = ({
    open,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmColor = 'primary',
    isLoading = false,
    maxWidth = 'sm',
}) => {
    const handleConfirm = () => {
        onConfirm();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={maxWidth}
            fullWidth
            PaperProps={{
                sx: {
                    border: '1px solid',
                    borderColor: 'divider',
                },
            }}
        >
            <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider', pb: 2 }}>
                {title}
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
                <Box>
                    {typeof message === 'string' ? (
                        <Typography variant="body1" color="text.primary">
                            {message}
                        </Typography>
                    ) : (
                        message
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
                <Button onClick={onClose} color="inherit" disabled={isLoading}>
                    {cancelText}
                </Button>
                <Button
                    onClick={handleConfirm}
                    color={confirmColor}
                    variant="contained"
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
                >
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmationModal;

