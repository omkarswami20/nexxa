import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

const Toast = ({ open, message, severity = 'info', onClose, autoHideDuration = 4000 }) => {
    return (
        <Snackbar
            open={open}
            autoHideDuration={autoHideDuration}
            onClose={onClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
            >
                <Alert
                    onClose={onClose}
                    severity={severity}
                    sx={{ width: '100%' }}
                    variant="filled"
                >
                    {message}
                </Alert>
            </motion.div>
        </Snackbar>
    );
};

export default Toast;

