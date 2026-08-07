import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  Box, Button, Typography, Stack, Divider,
  TextField, Paper, Tabs, Tab
} from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import { updatePlatformSettings, addAuditLog } from '../../../redux/common/dataSlice';
import { useToast } from '../../../components/common/ToastProvider';
import './Settings.css';

const platformSchema = yup.object().shape({
  platformName: yup.string().required('Platform Name is required'),
  logo: yup.string().url('Must be a valid URL').required('Logo URL is required'),
  supportEmail: yup.string().email('Invalid email').required('Support Email is required'),
  contactNumber: yup.string().required('Contact Number is required'),
  workingHours: yup.string().required('Working Hours details are required'),
  bookingRules: yup.string().required('Booking Rules are required'),
  cancellationRules: yup.string().required('Cancellation Rules are required'),
});

const passwordSchema = yup.object().shape({
  oldPassword: yup.string().required('Current Password is required'),
  newPassword: yup.string().min(6, 'Password must be at least 6 characters').required('New Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('newPassword'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const Settings = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { settings } = useSelector((state) => state.data);
  const currentUser = useSelector((state) => state.auth.user);

  // Tabs State
  const [activeTab, setActiveTab] = useState(0);

  const { register: registerPlatform, handleSubmit: handleSubmitPlatform, formState: { errors: platformErrors } } = useForm({
    resolver: yupResolver(platformSchema),
    defaultValues: settings
  });

  const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPassword, formState: { errors: passwordErrors } } = useForm({
    resolver: yupResolver(passwordSchema)
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const onSavePlatform = (data) => {
    dispatch(updatePlatformSettings(data));
    dispatch(addAuditLog({
      user: currentUser?.email || 'admin@easemyhome.com',
      action: 'Updated platform configurations settings',
      module: 'Settings Manager'
    }));
    showToast('Platform settings saved successfully!', 'success');
  };

  const onChangePassword = (data) => {
    dispatch(addAuditLog({
      user: currentUser?.email || 'admin@easemyhome.com',
      action: 'Updated account login password',
      module: 'Authentication/Settings'
    }));
    showToast('Password changed successfully!', 'success');
    resetPassword();
  };

  return (
    <Box>
      <PageHeader
        title="Portal Configurations"
        subtitle="Manage global application parameters, customer booking terms, service timing buffers, and admin credentials."
      />

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider', mt: 3, mb: 3 }}>
        <Tab label="Platform settings" />
        <Tab label="Security & Password" />
      </Tabs>

      {/* Tab 0: Platform settings */}
      {activeTab === 0 && (
        <Paper sx={{ p: 4, borderRadius: 3, maxWidth: 800 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Application Details</Typography>
          <Box component="form" onSubmit={handleSubmitPlatform(onSavePlatform)} noValidate>
            <Stack spacing={3}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  required
                  fullWidth
                  label="Platform Name"
                  error={!!platformErrors.platformName}
                  helperText={platformErrors.platformName?.message}
                  {...registerPlatform('platformName')}
                />
                <TextField
                  required
                  fullWidth
                  label="Logo URL"
                  error={!!platformErrors.logo}
                  helperText={platformErrors.logo?.message}
                  {...registerPlatform('logo')}
                />
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  required
                  fullWidth
                  label="Support Email"
                  error={!!platformErrors.supportEmail}
                  helperText={platformErrors.supportEmail?.message}
                  {...registerPlatform('supportEmail')}
                />
                <TextField
                  required
                  fullWidth
                  label="Contact Phone"
                  error={!!platformErrors.contactNumber}
                  helperText={platformErrors.contactNumber?.message}
                  {...registerPlatform('contactNumber')}
                />
              </Stack>

              <TextField
                required
                fullWidth
                label="Working Operational Hours"
                placeholder="e.g. 08:00 AM - 08:00 PM"
                error={!!platformErrors.workingHours}
                helperText={platformErrors.workingHours?.message}
                {...registerPlatform('workingHours')}
              />

              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Rules & Policies</Typography>

              <TextField
                required
                fullWidth
                multiline
                rows={3}
                label="Booking Rules"
                error={!!platformErrors.bookingRules}
                helperText={platformErrors.bookingRules?.message}
                {...registerPlatform('bookingRules')}
              />

              <TextField
                required
                fullWidth
                multiline
                rows={3}
                label="Cancellation Rules"
                error={!!platformErrors.cancellationRules}
                helperText={platformErrors.cancellationRules?.message}
                {...registerPlatform('cancellationRules')}
              />

              <Button type="submit" variant="contained" color="primary" sx={{ width: { md: 200 }, alignSelf: 'flex-start', py: 1.25 }}>
                Save settings
              </Button>
            </Stack>
          </Box>
        </Paper>
      )}

      {/* Tab 1: Security & Password */}
      {activeTab === 1 && (
        <Paper sx={{ p: 4, borderRadius: 3, maxWidth: 500 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Change Admin Password</Typography>
          <Box component="form" onSubmit={handleSubmitPassword(onChangePassword)} noValidate>
            <Stack spacing={3}>
              <TextField
                required
                fullWidth
                type="password"
                label="Current Password"
                error={!!passwordErrors.oldPassword}
                helperText={passwordErrors.oldPassword?.message}
                {...registerPassword('oldPassword')}
              />
              <TextField
                required
                fullWidth
                type="password"
                label="New Password"
                error={!!passwordErrors.newPassword}
                helperText={passwordErrors.newPassword?.message}
                {...registerPassword('newPassword')}
              />
              <TextField
                required
                fullWidth
                type="password"
                label="Confirm New Password"
                error={!!passwordErrors.confirmPassword}
                helperText={passwordErrors.confirmPassword?.message}
                {...registerPassword('confirmPassword')}
              />

              <Button type="submit" variant="contained" color="primary" sx={{ width: 180, py: 1.25 }}>
                Update Password
              </Button>
            </Stack>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default Settings;
