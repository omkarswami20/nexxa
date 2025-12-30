import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetOrderByIdQuery } from '../store/api/api.apislice';
import { Box, Typography, Divider, List, ListItem, ListItemText, Button } from '@mui/material';

const OrderDetail = () => {
  const { orderId } = useParams();
  const { data, isLoading, isError } = useGetOrderByIdQuery(orderId);

  if (isLoading) return <Typography>Loading order...</Typography>;
  if (isError || !data) return <Typography>Error loading order</Typography>;

  const { order, items } = data;

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1 }}>Order #{order?.id}</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>{order?.status} • Total: {order?.totalAmount}</Typography>

      <Typography variant="subtitle1">Items</Typography>
      <List sx={{ mb: 2 }}>
        {(items || []).map((it) => (
          <React.Fragment key={it.id}>
            <ListItem>
              <ListItemText
                primary={`${it.productNameSnapshot} x ${it.quantity}`}
                secondary={`Price: ${it.unitPrice} • Seller: ${it.sellerId} • Status: ${it.status}`}
              />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>

      <Typography variant="subtitle1">Shipping Address</Typography>
      <Typography variant="subtitle1">Shipping Address</Typography>
      {order?.addressSnapshot ? (
        <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="body2">{order.addressSnapshot.name}</Typography>
          <Typography variant="body2">{order.addressSnapshot.line1}</Typography>
          <Typography variant="body2">{order.addressSnapshot.city}, {order.addressSnapshot.state} {order.addressSnapshot.zip}</Typography>
          <Typography variant="body2">{order.addressSnapshot.country}</Typography>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">No address details available</Typography>
      )}

      <Button component={Link} to="/orders" sx={{ mt: 1 }}>
        Back to Orders
      </Button>
    </Box>
  );
};

export default OrderDetail;
