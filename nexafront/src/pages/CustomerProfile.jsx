import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, TextField, Button, Alert, Tabs, Tab, Paper } from '@mui/material';
import { useGetCustomerProfileQuery, useUpdateCustomerProfileMutation, useChangeCustomerPasswordMutation } from '../store/api/api.slice';
import CustomerAddresses from './CustomerAddresses';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SecurityIcon from '@mui/icons-material/Security';

const CustomerProfile = () => {
  const { data: profile, isLoading, refetch } = useGetCustomerProfileQuery();
  const [updateProfile, updState] = useUpdateCustomerProfileMutation();
  const [changePassword, pwdState] = useChangeCustomerPasswordMutation();

  const [tabValue, setTabValue] = useState(0);
  const [form, setForm] = useState({ name: '', mobile: '' });
  const [pwd, setPwd] = useState({ oldPassword: '', newPassword: '' });

  useEffect(() => {
    if (profile) setForm({ name: profile.name || '', mobile: profile.mobile || '' });
  }, [profile]);

  const handleTabChange = (event, newValue) => setTabValue(newValue);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onPwdChange = (e) => setPwd({ ...pwd, [e.target.name]: e.target.value });

  const saveProfile = async () => {
    const res = await updateProfile(form);
    if (!res.error) refetch();
  };

  const savePwd = async () => {
    await changePassword(pwd);
    setPwd({ oldPassword: '', newPassword: '' });
  };

  if (isLoading) return <Typography>Loading profile...</Typography>;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', py: 2 }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 4 }}>
        Account Settings
      </Typography>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
        >
          <Tab icon={<PersonIcon />} iconPosition="start" label="Profile" />
          <Tab icon={<LocationOnIcon />} iconPosition="start" label="Addresses" />
          <Tab icon={<SecurityIcon />} iconPosition="start" label="Security" />
        </Tabs>

        <Box sx={{ p: 4 }}>
          {/* Tab 0: Profile Details */}
          {tabValue === 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3 }}>Personal Information</Typography>
              {updState.isError && <Alert severity="error" sx={{ mb: 2 }}>{updState.error?.data?.message || 'Failed to update'}</Alert>}
              {updState.isSuccess && <Alert severity="success" sx={{ mb: 2 }}>Profile updated successfully</Alert>}

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Full Name"
                    name="name"
                    fullWidth
                    value={form.name}
                    onChange={onChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Mobile Number"
                    name="mobile"
                    fullWidth
                    value={form.mobile}
                    onChange={onChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Email Address"
                    value={profile?.email || ''}
                    fullWidth
                    disabled
                    helperText="Email cannot be changed"
                  />
                </Grid>
              </Grid>
              <Button
                variant="contained"
                size="large"
                sx={{ mt: 4, px: 4 }}
                onClick={saveProfile}
                disabled={updState.isLoading}
              >
                Save Changes
              </Button>
            </Box>
          )}

          {/* Tab 1: Addresses */}
          {tabValue === 1 && (
            <CustomerAddresses />
          )}

          {/* Tab 2: Security */}
          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3 }}>Change Password</Typography>
              {pwdState.isError && <Alert severity="error" sx={{ mb: 2 }}>{pwdState.error?.data?.message || 'Failed to change password'}</Alert>}
              {pwdState.isSuccess && <Alert severity="success" sx={{ mb: 2 }}>Password changed successfully</Alert>}

              <Grid container spacing={3} sx={{ maxWidth: 400 }}>
                <Grid item xs={12}>
                  <TextField
                    label="Current Password"
                    name="oldPassword"
                    type="password"
                    fullWidth
                    value={pwd.oldPassword}
                    onChange={onPwdChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="New Password"
                    name="newPassword"
                    type="password"
                    fullWidth
                    value={pwd.newPassword}
                    onChange={onPwdChange}
                  />
                </Grid>
              </Grid>
              <Button
                variant="contained"
                size="large"
                sx={{ mt: 4, px: 4 }}
                onClick={savePwd}
                disabled={pwdState.isLoading}
              >
                Update Password
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default CustomerProfile;
