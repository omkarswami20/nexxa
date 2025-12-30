import React, { useState } from 'react';
import { useGetSellerOrderItemsQuery, useUpdateSellerOrderItemStatusMutation } from '../store/api/api.apislice';
import { Box, Typography, List, ListItem, ListItemText, Divider, FormControl, InputLabel, Select, MenuItem, Chip } from '@mui/material';

const statusOptions = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELED'];

const SellerOrders = () => {
  const { data: items = [], isLoading, refetch } = useGetSellerOrderItemsQuery();
  const [updateStatus] = useUpdateSellerOrderItemStatusMutation();
  const [pending, setPending] = useState({});

  const handleChange = async (id, status) => {
    setPending((p) => ({ ...p, [id]: true }));
    await updateStatus({ orderItemId: id, status });
    await refetch();
    setPending((p) => ({ ...p, [id]: false }));
  };

  if (isLoading) return <Typography>Loading orders...</Typography>;

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Seller Order Items</Typography>
      <List>
        {items.map((it) => (
          <React.Fragment key={it?.id ?? Math.random()}>
            <ListItem sx={{ alignItems: 'flex-start', gap: 2 }}>
              <ListItemText
                primary={`Order #${it?.orderId} • Product #${it?.productId}`}
                secondary={`Qty: ${it?.quantity} • Unit Price: Rs. ${it?.unitPrice}`}
              />
              <Chip label={it?.status || 'PENDING'} size="small" sx={{ mr: 2 }} />
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel id={`status-${it?.id}`}>Update Status</InputLabel>
                <Select
                  labelId={`status-${it?.id}`}
                  label="Update Status"
                  value={it?.status || ''}
                  onChange={(e) => handleChange(it?.id, e.target.value)}
                  disabled={pending[it?.id]}
                >
                  {statusOptions.map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
      {items.length === 0 && <Typography>No order items found.</Typography>}
    </Box>
  );
};

export default SellerOrders;
