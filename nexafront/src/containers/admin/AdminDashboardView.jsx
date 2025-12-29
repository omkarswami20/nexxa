import React from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress,
    Tabs, Tab
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

import LogoutContainer from '../../containers/common/LogoutContainer';
import LogoutIcon from '@mui/icons-material/Logout';

import CategoryManagement from './CategoryManagement';

const AdminDashboardView = ({
    isLoading,
    sellers,
    tabValue,
    onTabChange,
    onApprove,
    onRejectClick,
    openRejectDialog,
    onCloseRejectDialog,
    rejectionReason,
    onRejectionReasonChange,
    onRejectConfirm
}) => {
    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h4" fontWeight="600">
                    Admin Dashboard
                </Typography>
                <LogoutContainer>
                    <Button 
                        variant="outlined" 
                        color="error" 
                        startIcon={<LogoutIcon />}
                    >
                        Logout
                    </Button>
                </LogoutContainer>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 5 }}>
                Manage sellers, categories, and oversee platform activity
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
                <Tabs
                    value={tabValue}
                    onChange={onTabChange}
                    aria-label="admin dashboard tabs"
                    sx={{
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 500,
                            fontSize: '0.95rem',
                            minHeight: 48,
                            mr: 3,
                        },
                    }}
                >
                    <Tab label="All Sellers" />
                    <Tab label="Pending" />
                    <Tab label="Approved" />
                    <Tab label="Denied" />
                    <Tab label="Categories" />
                </Tabs>
            </Box>

            {tabValue === 4 ? (
                <CategoryManagement />
            ) : (
                isLoading ? (
                    <Box display="flex" justifyContent="center" p={8}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer
                        component={Paper}
                        elevation={0}
                        sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'action.hover' }}>
                                    <TableCell sx={{ fontWeight: 600, py: 2 }}>Seller Name</TableCell>
                                    <TableCell sx={{ fontWeight: 600, py: 2 }}>Email</TableCell>
                                    <TableCell sx={{ fontWeight: 600, py: 2 }}>Store Name</TableCell>
                                    <TableCell sx={{ fontWeight: 600, py: 2 }}>Status</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600, py: 2 }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sellers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                            <Typography variant="body1" color="text.secondary">
                                                No sellers found in this category.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sellers.map((seller) => (
                                        <TableRow key={seller.id} hover>
                                            <TableCell sx={{ py: 2.5 }}>
                                                <Typography variant="body1" fontWeight={500}>{seller.name}</Typography>
                                            </TableCell>
                                            <TableCell sx={{ py: 2.5 }}>{seller.email}</TableCell>
                                            <TableCell sx={{ py: 2.5 }}>{seller.storeName}</TableCell>
                                            <TableCell sx={{ py: 2.5 }}>
                                                <Chip
                                                    label={seller.status.replace('_', ' ')}
                                                    sx={{
                                                        fontWeight: 500,
                                                        bgcolor: seller.status === 'APPROVED' ? 'success.light' :
                                                            seller.status === 'DENIED' ? 'error.light' :
                                                                'warning.light',
                                                        color: seller.status === 'APPROVED' ? 'success.dark' :
                                                            seller.status === 'DENIED' ? 'error.dark' :
                                                                'warning.dark',
                                                    }}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell align="right" sx={{ py: 2.5 }}>
                                                {/* Actions for Pending Sellers */}
                                                {seller.status === 'PENDING_APPROVAL' && (
                                                    <>
                                                        <Button
                                                            startIcon={<CheckCircleIcon />}
                                                            color="success"
                                                            onClick={() => onApprove(seller.id)}
                                                            sx={{ mr: 1 }}
                                                            variant="outlined"
                                                            size="small"
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            startIcon={<CancelIcon />}
                                                            color="error"
                                                            onClick={() => onRejectClick(seller.id)}
                                                            variant="outlined"
                                                            size="small"
                                                        >
                                                            Reject
                                                        </Button>
                                                    </>
                                                )}

                                                {/* Actions for Approved Sellers (Can be Rejected/Banned) */}
                                                {seller.status === 'APPROVED' && (
                                                    <Button
                                                        startIcon={<CancelIcon />}
                                                        color="error"
                                                        onClick={() => onRejectClick(seller.id)}
                                                        variant="outlined"
                                                        size="small"
                                                    >
                                                        Reject / Ban
                                                    </Button>
                                                )}

                                                {/* Actions for Denied Sellers (Can be Re-Approved) */}
                                                {seller.status === 'DENIED' && (
                                                    <Button
                                                        startIcon={<CheckCircleIcon />}
                                                        color="success"
                                                        onClick={() => onApprove(seller.id)}
                                                        variant="outlined"
                                                        size="small"
                                                    >
                                                        Re-Approve
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )
            )}

            {/* Rejection Dialog */}
            <Dialog
                open={openRejectDialog}
                onClose={onCloseRejectDialog}
                PaperProps={{
                    sx: {
                        border: '1px solid',
                        borderColor: 'divider',
                    }
                }}
            >
                <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider', pb: 2 }}>
                    Reject Seller Application
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Please provide a reason for rejection. This will be emailed to the seller.
                    </Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Rejection Reason"
                        fullWidth
                        multiline
                        rows={3}
                        value={rejectionReason}
                        onChange={(e) => onRejectionReasonChange(e.target.value)}
                        variant="outlined"
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
                    <Button onClick={onCloseRejectDialog} color="inherit">Cancel</Button>
                    <Button onClick={onRejectConfirm} color="error" variant="contained">
                        Confirm Rejection
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminDashboardView;
