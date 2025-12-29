import React from 'react';
import { useGetOrdersQuery } from '../store/api/api.slice';
import { Box, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';
import { Link } from 'react-router-dom';

const Orders = () => {
  const { data: orders = [], isLoading } = useGetOrdersQuery();

  if (isLoading) return <Typography>Loading orders...</Typography>;

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Your Orders</Typography>
      <List>
        {orders.map((o) => (
          <React.Fragment key={o?.id ?? Math.random()}>
            <ListItem component={Link} to={`/orders/${o?.id}`} sx={{ textDecoration: 'none' }}>
              <ListItemText
                primary={`Order #${o?.id}`}
                secondary={`${o?.status || 'PENDING'} • Total: Rs. ${(o?.totalAmount || 0).toFixed(2)}`}
              />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
      {orders.length === 0 && <Typography>No orders found.</Typography>}
    </Box>
  );
};

export default Orders;
