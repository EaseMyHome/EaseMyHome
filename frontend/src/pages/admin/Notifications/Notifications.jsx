import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  Box, Button, Typography, Stack, Card, CardContent, Divider, Chip,
  TextField, MenuItem, Select, FormControl, InputLabel, Paper, Checkbox, 
  ListItemText, FormControlLabel, Radio, RadioGroup, FormLabel, CircularProgress, Grid
} from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import { addAuditLog, addNotification } from '../../../redux/common/dataSlice';
import { useToast } from '../../../components/common/ToastProvider';
import SendIcon from '@mui/icons-material/Send';
import './Notifications.css';

const schema = yup.object().shape({
  title: yup.string().required('Notification Title is required'),
  message: yup.string().required('Notification Message content is required'),
});

const Notifications = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { customers, providers, notifications } = useSelector((state) => state.data);
  const currentUser = useSelector((state) => state.auth.user);

  // Form States
  const [channel, setChannel] = useState('Push'); // Push, Email, InApp
  const [audience, setAudience] = useState('All Customers'); // All Customers, All Providers, Selected Users
  const [selectedUsersList, setSelectedUsersList] = useState([]);
  const [sending, setSending] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const handleChannelChange = (event) => setChannel(event.target.value);
  const handleAudienceChange = (event) => {
    setAudience(event.target.value);
    setSelectedUsersList([]);
  };

  const handleUsersSelectChange = (event) => {
    setSelectedUsersList(event.target.value);
  };

  // Combine customers and providers for custom user picking list safely
  const allUsersList = [
    ...(Array.isArray(customers) ? customers : []).filter(Boolean).map(c => ({ id: c.id || c.rawId, name: `${c.name || 'Customer'} (Customer)`, email: c.email || '' })),
    ...(Array.isArray(providers) ? providers : []).filter(Boolean).map(p => ({ id: p.id || p.rawId, name: `${p.name || 'Partner'} (Provider)`, email: p.email || '' })),
  ];

  const onSubmit = async (data) => {
    setSending(true);
    try {
      // Mock API dispatch delayed by 1000ms
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      let audienceCount = 0;
      if (audience === 'All Customers') audienceCount = (customers || []).length;
      else if (audience === 'All Providers') audienceCount = (providers || []).length;
      else audienceCount = selectedUsersList.length;

      // Dispatch real notification into Redux store
      dispatch(addNotification({
        title: data.title,
        message: data.message,
        channel,
        audience,
        recipientsCount: audienceCount
      }));

      dispatch(addAuditLog({
        user: currentUser?.email || 'admin@easemyhome.com',
        action: `Sent ${channel} Notification: "${data.title}" to ${audience} (${audienceCount} recipients)`,
        module: 'Notifications Panel'
      }));

      showToast(`Notification sent successfully to ${audienceCount} users!`, 'success');
      reset({ title: '', message: '' });
      setSelectedUsersList([]);
    } catch (err) {
      showToast('Failed to dispatch notification', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Broadcast Notifications"
        subtitle="Send system announcements, security updates, or promotional news to users via Push, Email, or In-App channels."
      />

      <Grid container spacing={4} sx={{ mt: 3, justifyContent: 'center' }}>
        <Grid size={{ xs: 12, md: 8, lg: 6 }}>
          <Paper sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Compose Broadcast Alert</Typography>
            <Divider sx={{ mb: 3 }} />

            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Stack spacing={3}>
                {/* Channel Selector */}
                <FormControl component="fieldset">
                  <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1, fontSize: '0.9rem' }}>Delivery Channel</FormLabel>
                  <RadioGroup row value={channel} onChange={handleChannelChange}>
                    <FormControlLabel value="Push" control={<Radio color="primary" />} label="Push Notification" />
                    <FormControlLabel value="Email" control={<Radio color="primary" />} label="Email Broadcast" />
                    <FormControlLabel value="InApp" control={<Radio color="primary" />} label="In-App Notification" />
                  </RadioGroup>
                </FormControl>

                {/* Target Audience */}
                <FormControl component="fieldset">
                  <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1, fontSize: '0.9rem' }}>Target Audience</FormLabel>
                  <RadioGroup row value={audience} onChange={handleAudienceChange}>
                    <FormControlLabel value="All Customers" control={<Radio color="secondary" />} label="All Customers" />
                    <FormControlLabel value="All Providers" control={<Radio color="secondary" />} label="All Providers" />
                    <FormControlLabel value="Selected Users" control={<Radio color="secondary" />} label="Targeted Users" />
                  </RadioGroup>
                </FormControl>

                {/* Selected Users Multi-Selector */}
                {audience === 'Selected Users' && (
                  <FormControl fullWidth>
                    <InputLabel id="users-select-label">Select Target Users</InputLabel>
                    <Select
                      labelId="users-select-label"
                      multiple
                      value={selectedUsersList}
                      onChange={handleUsersSelectChange}
                      renderValue={(selected) => selected.map(uid => allUsersList.find(u => u.id === uid)?.name).join(', ')}
                      label="Select Target Users"
                    >
                      {allUsersList.map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                          <Checkbox checked={selectedUsersList.indexOf(user.id) > -1} />
                          <ListItemText primary={user.name} secondary={user.email} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {/* Title */}
                <TextField
                  required
                  fullWidth
                  label="Notification Title / Subject"
                  placeholder="e.g. System Maintenance Update"
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  {...register('title')}
                />

                {/* Message Content */}
                <TextField
                  required
                  fullWidth
                  multiline
                  rows={4}
                  label="Message Content"
                  placeholder="Type your message body here..."
                  error={!!errors.message}
                  helperText={errors.message?.message}
                  {...register('message')}
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={sending || (audience === 'Selected Users' && selectedUsersList.length === 0)}
                  startIcon={sending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                  sx={{ py: 1.5 }}
                >
                  {sending ? 'Sending...' : 'Dispatch Notification'}
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Grid>

        {/* Broadcast Notification History Log */}
        <Grid size={{ xs: 12, md: 8, lg: 6 }}>
          <Paper sx={{ p: 4, borderRadius: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Broadcast History & Alerts</Typography>
              <Chip label={`${(notifications || []).length} Logs`} color="primary" size="small" variant="outlined" />
            </Stack>
            <Divider sx={{ mb: 3 }} />

            <Stack spacing={2} sx={{ maxHeight: 450, overflowY: 'auto', pr: 1 }}>
              {(Array.isArray(notifications) && notifications.length > 0) ? (
                notifications.filter(Boolean).map((notif, idx) => (
                  <Card key={notif.id || idx} variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{notif.title || 'Notification'}</Typography>
                      <Chip 
                        label={notif.channel || 'InApp'} 
                        color={notif.channel === 'Push' ? 'primary' : notif.channel === 'Email' ? 'secondary' : 'info'} 
                        size="small" 
                        sx={{ height: 20, fontSize: '0.65rem' }} 
                      />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.5 }}>
                      {notif.message || ''}
                    </Typography>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" color="text.disabled">
                        📍 Target: <strong>{notif.audience || 'All'}</strong> ({notif.recipientsCount || 1} recipients)
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        🕒 {notif.createdAt || 'Recent'}
                      </Typography>
                    </Stack>
                  </Card>
                ))
              ) : (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">No broadcast notifications sent yet.</Typography>
                </Box>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Notifications;
