import React, { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Divider, Button, Dialog, DialogTitle, DialogContent, DialogActions, Grid, TextField, IconButton, CircularProgress } from '@mui/material';
import { useGetAddressesQuery, useCreateAddressMutation, useUpdateAddressMutation, useDeleteAddressMutation, useGetZipCodeInfoQuery } from '../store/api/api.apislice';
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
  const [zipCodeLookup, setZipCodeLookup] = useState({ zip: '', country: '' });

  const { data: zipCodeData, isLoading: zipCodeLoading } = useGetZipCodeInfoQuery(
    { zip: zipCodeLookup.zip, country: zipCodeLookup.country },
    { skip: !zipCodeLookup.zip || zipCodeLookup.zip.length < 5 }
  );

  useEffect(() => {
    if (zipCodeData && zipCodeLookup.zip) {
      setForm(prev => ({
        ...prev,
        city: zipCodeData.city || prev.city,
        state: zipCodeData.state || prev.state,
        country: zipCodeData.country || prev.country,
      }));
    }
  }, [zipCodeData, zipCodeLookup.zip]);

  const handleOpenCreate = () => { setEditing(null); setForm(emptyAddress); setZipCodeLookup({ zip: '', country: '' }); setOpen(true); };
  const handleOpenEdit = (addr) => { setEditing(addr); setForm({ ...addr }); setZipCodeLookup({ zip: '', country: '' }); setOpen(true); };
  const handleClose = () => { setOpen(false); setZipCodeLookup({ zip: '', country: '' }); };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleZipCodeBlur = (e) => {
    const zip = e.target.value?.trim();
    if (zip && zip.length >= 5) {
      setZipCodeLookup({ zip, country: form.country || 'IN' });
    }
  };

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
            {['name','phone','line1','line2'].map((f) => (
              <Grid item xs={12} sm={f==='line2' ? 12 : 6} key={f}>
                <TextField fullWidth size="small" label={f.toUpperCase()} name={f} value={form[f] || ''} onChange={onChange} />
              </Grid>
            ))}
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth 
                size="small" 
                label="ZIP" 
                name="zip" 
                value={form.zip || ''} 
                onChange={onChange}
                onBlur={handleZipCodeBlur}
                InputProps={{
                  endAdornment: zipCodeLoading ? <CircularProgress size={20} /> : null
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="CITY" name="city" value={form.city || ''} onChange={onChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="STATE" name="state" value={form.state || ''} onChange={onChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="COUNTRY" name="country" value={form.country || ''} onChange={onChange} />
            </Grid>
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
