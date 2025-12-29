import React, { useState } from 'react';
import { useGetAllSellersQuery, useUpdateSellerStatusMutation } from '../../store/api/api.slice';
import AdminDashboardView from './AdminDashboardView';

const AdminDashboardContainer = () => {
    const { data: allSellers, isLoading } = useGetAllSellersQuery();
    const [updateStatus] = useUpdateSellerStatusMutation();

    const [openRejectDialog, setOpenRejectDialog] = useState(false);
    const [selectedSellerId, setSelectedSellerId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleApprove = async (sellerId) => {
        try {
            await updateStatus({ sellerId, newStatus: 'APPROVED' }).unwrap();
        } catch (err) {
            console.error('Failed to approve:', err);
        }
    };

    const handleRejectClick = (sellerId) => {
        setSelectedSellerId(sellerId);
        setOpenRejectDialog(true);
    };

    const handleRejectConfirm = async () => {
        try {
            await updateStatus({
                sellerId: selectedSellerId,
                newStatus: 'DENIED',
                rejectionReason
            }).unwrap();
            setOpenRejectDialog(false);
            setRejectionReason('');
            setSelectedSellerId(null);
        } catch (err) {
            console.error('Failed to reject:', err);
        }
    };

    const getFilteredSellers = () => {
        if (!allSellers) return [];
        switch (tabValue) {
            case 0: // All
                return allSellers;
            case 1: // Pending
                return allSellers.filter(s => s.status === 'PENDING_APPROVAL');
            case 2: // Approved
                return allSellers.filter(s => s.status === 'APPROVED');
            case 3: // Denied
                return allSellers.filter(s => s.status === 'DENIED');
            case 4: // Categories
                return [];
            default:
                return allSellers;
        }
    };

    return (
        <AdminDashboardView
            isLoading={isLoading}
            sellers={getFilteredSellers()}
            tabValue={tabValue}
            onTabChange={handleTabChange}
            onApprove={handleApprove}
            onRejectClick={handleRejectClick}
            openRejectDialog={openRejectDialog}
            onCloseRejectDialog={() => setOpenRejectDialog(false)}
            rejectionReason={rejectionReason}
            onRejectionReasonChange={setRejectionReason}
            onRejectConfirm={handleRejectConfirm}
        />
    );
};

export default AdminDashboardContainer;
