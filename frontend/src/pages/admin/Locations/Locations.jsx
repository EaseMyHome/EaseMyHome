import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  Box, Button, Typography, Stack, Divider,
  IconButton, Chip, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Switch, Paper
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import PageHeader from '../../../components/common/PageHeader';
import { saveLocation, toggleLocationStatus, addAuditLog } from '../../../redux/common/dataSlice';
import { useToast } from '../../../components/common/ToastProvider';
import './Locations.css';

const schema = yup.object().shape({
  state: yup.string().required('State is required'),
  city: yup.string().required('City is required'),
  area: yup.string().required('Area is required'),
  pincode: yup.string().required('Pincode is required').matches(/^[0-9]{6}$/, 'Must be a valid 6-digit Pincode'),
  status: yup.string().default('Active'),
});

const Locations = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { locations } = useSelector((state) => state.data);
  const currentUser = useSelector((state) => state.auth.user);

  // States
  const [searchText, setSearchText] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  // Search & Filter
  const filteredLocations = locations.filter((loc) => 
    loc.state.toLowerCase().includes(searchText.toLowerCase()) ||
    loc.city.toLowerCase().includes(searchText.toLowerCase()) ||
    loc.area.toLowerCase().includes(searchText.toLowerCase()) ||
    loc.pincode.includes(searchText)
  );

  const handleOpenAdd = () => {
    reset({ state: 'Karnataka', city: 'Bangalore', area: '', pincode: '', status: 'Active' });
    setDialogOpen(true);
  };

  const handleStatusToggle = (loc) => {
    dispatch(toggleLocationStatus(loc.id));
    dispatch(addAuditLog({
      user: currentUser?.email || 'admin@easemyhome.com',
      action: `Toggled service availability in ${loc.area} (${loc.pincode})`,
      module: 'Location Management'
    }));
    showToast(`Service availability updated for ${loc.area}`, 'success');
  };

  const onSubmit = (data) => {
    const locationData = {
      ...data,
      id: undefined, // Always new in this simple layout
    };
    dispatch(saveLocation(locationData));
    dispatch(addAuditLog({
      user: currentUser?.email || 'admin@easemyhome.com',
      action: `Added new service location: ${data.area}, ${data.city} (${data.pincode})`,
      module: 'Location Management'
    }));
    showToast(`Location added successfully!`, 'success');
    setDialogOpen(false);
  };

  const columns = [
    { field: 'id', headerName: 'Location ID', width: 120 },
    { field: 'area', headerName: 'Area Name', width: 180, renderCell: (params) => (
      <Typography variant="body2" sx={{ fontWeight: 600, mt: 1.5 }}>{params.value}</Typography>
    )},
    { field: 'pincode', headerName: 'Pincode', width: 120, renderCell: (params) => (
      <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 1.5 }}>{params.value}</Typography>
    )},
    { field: 'city', headerName: 'City', width: 140 },
    { field: 'state', headerName: 'State', width: 140 },
    { 
      field: 'status', 
      headerName: 'Service Status', 
      width: 140, 
      renderCell: (params) => (
        <Chip 
          label={params.value === 'Active' ? 'Serviceable' : 'Suspended'} 
          size="small" 
          color={params.value === 'Active' ? 'success' : 'default'} 
          sx={{ mt: 1.5, fontWeight: 600 }}
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 130,
      sortable: false,
      renderCell: (params) => {
        const loc = params.row;
        return (
          <Box sx={{ mt: 1 }}>
            <Tooltip title={loc.status === 'Active' ? 'Disable Service' : 'Enable Service'}>
              <Switch checked={loc.status === 'Active'} onChange={() => handleStatusToggle(loc)} color="success" size="small" />
            </Tooltip>
          </Box>
        );
      }
    }
  ];

  return (
    <Box>
      <PageHeader
        title="Coverage Locations"
        subtitle="Configure serviced states, cities, specific areas, and postal pincodes. Toggle operational status."
        searchValue={searchText}
        onSearchChange={setSearchText}
        onAddClick={handleOpenAdd}
        addLabel="Add Location"
      />

      <Paper sx={{ height: 500, width: '100%', mt: 3 }}>
        <DataGrid
          rows={filteredLocations}
          columns={columns}
          initialState={{
            pagination: { paginationModel: { pageSize: 7 } },
          }}
          pageSizeOptions={[5, 10, 20]}
          disableRowSelectionOnClick
          sx={{ border: 'none' }}
        />
      </Paper>

      {/* Add Location Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Service Location</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogContent dividers>
            <Stack spacing={2.5}>
              <TextField
                required
                fullWidth
                label="State"
                error={!!errors.state}
                helperText={errors.state?.message}
                {...register('state')}
              />
              <TextField
                required
                fullWidth
                label="City"
                error={!!errors.city}
                helperText={errors.city?.message}
                {...register('city')}
              />
              <TextField
                required
                fullWidth
                label="Area Name"
                error={!!errors.area}
                helperText={errors.area?.message}
                {...register('area')}
              />
              <TextField
                required
                fullWidth
                label="Postal Pincode"
                error={!!errors.pincode}
                helperText={errors.pincode?.message}
                {...register('pincode')}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDialogOpen(false)} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained" color="primary">Add Area</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default Locations;
