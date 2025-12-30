import React, { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Divider, Button, Dialog, DialogTitle, DialogContent, DialogActions, Grid, TextField, IconButton } from '@mui/material';
import { useGetAddressesQuery, useCreateAddressMutation, useUpdateAddressMutation, useDeleteAddressMutation } from '../store/api/api.apislice';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const emptyAddress = { name: '', phone: '', line1: '', line2: '', city: '', state: '', zip: '', country: '', isDefault: false };

const CustomerAddresses = () => {
  const { data: addresses = [], isLoading, refetch } = useGetAddressesQuery();
  const [createAddress] = useCreateAddressMutation();
  const [updateAddress] = useUpdateAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyAddress);

  const handleOpenCreate = () => { setEditing(null); setForm(emptyAddress); setOpen(true); };
  const handleOpenEdit = (addr) => { setEditing(addr); setForm({ ...addr }); setOpen(true); };
  const handleClose = () => setOpen(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async () => {
    if (editing && editing.id) {
      await updateAddress({ id: editing.id, ...form });
    } else {
      await createAddress(form);
    }
    setOpen(false);
    await refetch();
  };

  const remove = async (id) => {
    await deleteAddress(id);
    await refetch();
  };

  if (isLoading) return <Typography>Loading addresses...</Typography>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">My Addresses</Typography>
        <Button variant="contained" onClick={handleOpenCreate}>Add Address</Button>
      </Box>
      <List>
        {addresses.map((a) => (
          <React.Fragment key={a.id}>
            <ListItem secondaryAction={
              <Box>
                <IconButton edge="end" onClick={() => handleOpenEdit(a)} sx={{ mr: 1 }}><EditIcon /></IconButton>
                <IconButton edge="end" color="error" onClick={() => remove(a.id)}><DeleteIcon /></IconButton>
              </Box>
            }>
              <ListItemText
                primary={`${a.name} • ${a.phone}`}
                secondary={`${a.line1}${a.line2 ? ', ' + a.line2 : ''}, ${a.city}, ${a.state} ${a.zip}, ${a.country}`}
              />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Edit Address' : 'New Address'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {['name','phone','line1','line2','city','state','zip','country'].map((f) => (
              <Grid item xs={12} sm={f==='line2' ? 12 : 6} key={f}>
                <TextField fullWidth size="small" label={f.toUpperCase()} name={f} value={form[f] || ''} onChange={onChange} />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={save}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerAddresses;
