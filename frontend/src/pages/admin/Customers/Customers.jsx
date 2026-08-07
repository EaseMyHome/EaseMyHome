import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, Button, Drawer, Typography, Stack, Card, CardContent, Divider,
  IconButton, Chip, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, Grid, Paper
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import PageHeader from '../../../components/common/PageHeader';
import { setCustomers, addAuditLog } from '../../../redux/common/dataSlice';
import { useToast } from '../../../components/common/ToastProvider';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';

import apiClient from '../../../services/common/api';
import './Customers.css';

const Customers = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { customers, bookings } = useSelector((state) => state.data);
  const currentUser = useSelector((state) => state.auth.user);

  // States
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  const fetchCustomers = async () => {
    try {
      const response = await apiClient.get('/admin/users');
      if (response.status === 200) {
        const data = response.data;
        const mapped = data.map(u => ({
          ...u,
          id: `CUST-${u.id}`,
          rawId: u.id,
          status: u.status || 'Active',
          joinDate: '2026-08-03'
        }));
        dispatch(setCustomers(mapped));
      }
    } catch (err) {
      console.error('Error loading customers:', err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filters & Search logic
  const filteredCustomers = customers.filter((cust) => {
    const matchesSearch = 
      (cust.name?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
      (cust.email?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
      (cust.phone || '').includes(searchText);
    const matchesStatus = statusFilter ? cust.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const handleBlockToggle = async (cust) => {
    try {
      const response = await apiClient.patch(`/admin/users/${cust.rawId}/status`);
      if (response.status === 200) {
        const data = response.data;
        fetchCustomers();
        dispatch(addAuditLog({
          user: currentUser?.email || 'admin@easemyhome.com',
          action: `Changed customer ${cust.name} status to ${data.status}`,
          module: 'Customer Management'
        }));
        showToast(`Customer ${cust.name} is now ${data.status}`, 'success');
      } else {
        showToast('Failed to update customer status', 'error');
      }
    } catch (err) {
      showToast('Network error updating status', 'error');
    }
  };

  const handleDeleteClick = (cust) => {
    setCustomerToDelete(cust);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (customerToDelete) {
      try {
        const response = await apiClient.delete(`/admin/users/${customerToDelete.rawId}`);
        if (response.status === 200) {
          fetchCustomers();
          dispatch(addAuditLog({
            user: currentUser?.email || 'admin@easemyhome.com',
            action: `Deleted customer ${customerToDelete.name}`,
            module: 'Customer Management'
          }));
          showToast(`Customer ${customerToDelete.name} deleted successfully.`, 'success');
          setDeleteConfirmOpen(false);
          setCustomerToDelete(null);
          if (selectedCustomer?.id === customerToDelete.id) {
            setProfileDrawerOpen(false);
          }
        } else {
          showToast('Failed to delete customer from database', 'error');
        }
      } catch (err) {
        showToast('Network error deleting customer', 'error');
      }
    }
  };

  const handleViewProfile = (cust) => {
    setSelectedCustomer(cust);
    setProfileDrawerOpen(true);
  };

  // Columns definition
  const columns = [
    { field: 'id', headerName: 'Customer ID', width: 120 },
    { field: 'name', headerName: 'Full Name', width: 200, renderCell: (params) => (
      <Typography variant="body2" sx={{ fontWeight: 600, mt: 1.5 }}>
        {params.value}
      </Typography>
    )},
    { field: 'email', headerName: 'Email Address', width: 220 },
    { field: 'phone', headerName: 'Phone Number', width: 150 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 130, 
      renderCell: (params) => {
        let color = 'default';
        if (params.value === 'Active') color = 'success';
        if (params.value === 'Inactive') color = 'warning';
        if (params.value === 'Blocked') color = 'error';
        return <Chip label={params.value} size="small" color={color} sx={{ mt: 1.5, fontWeight: 600 }} />;
      }
    },
    { field: 'joinDate', headerName: 'Joined Date', width: 130 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 220,
      sortable: false,
      renderCell: (params) => {
        const cust = params.row;
        return (
          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
            <Tooltip title="View Profile">
              <IconButton size="small" onClick={() => handleViewProfile(cust)}>
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={cust.status === 'Blocked' ? 'Unblock Account' : 'Block Account'}>
              <IconButton 
                size="small" 
                color={cust.status === 'Blocked' ? 'success' : 'warning'}
                onClick={() => handleBlockToggle(cust)}
              >
                <BlockIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Customer">
              <IconButton size="small" color="error" onClick={() => handleDeleteClick(cust)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      }
    }
  ];

  return (
    <Box>
      <PageHeader
        title="Customer Management"
        subtitle="View, manage, block and delete user customer accounts registered on the platform."
        searchValue={searchText}
        onSearchChange={setSearchText}
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={[
          { value: 'Active', label: 'Active' },
          { value: 'Inactive', label: 'Inactive' },
          { value: 'Blocked', label: 'Blocked' },
        ]}
      />

      {/* Customers DataGrid */}
      <Paper sx={{ height: 500, width: '100%', mt: 3 }}>
        <DataGrid
          rows={filteredCustomers}
          columns={columns}
          initialState={{
            pagination: { paginationModel: { page: 0, pageSize: 7 } },
          }}
          pageSizeOptions={[5, 7, 10, 20]}
          checkboxSelection
          disableRowSelectionOnClick
          sx={{
            border: 0,
            '& .MuiDataGrid-cell:focus': { outline: 'none' },
          }}
        />
      </Paper>

      {/* Customer Profile Side Drawer */}
      <Drawer
        anchor="right"
        open={profileDrawerOpen}
        onClose={() => setProfileDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 480 }, p: 3 } }}
      >
        {selectedCustomer && (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Customer profile</Typography>
              <IconButton onClick={() => setProfileDrawerOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Stack>

            <Stack spacing={3} sx={{ flexGrow: 1, overflowY: 'auto', pr: 1 }}>
              {/* Summary Profile Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{selectedCustomer.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{selectedCustomer.email}</Typography>
                  <Chip 
                    label={selectedCustomer.status} 
                    size="small" 
                    color={selectedCustomer.status === 'Active' ? 'success' : 'default'} 
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>

              {/* Personal Details */}
              <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Contact Details</Typography>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Phone Number</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedCustomer.phone}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Home Address</Typography>
                    <Typography variant="body2">{selectedCustomer.address}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Account Member Since</Typography>
                    <Typography variant="body2">{selectedCustomer.joinDate}</Typography>
                  </Box>
                </Stack>
              </Card>
            </Stack>

            <Divider sx={{ my: 2 }} />
            <Stack direction="row" spacing={2}>
              <Button 
                variant="outlined" 
                color="error" 
                fullWidth
                onClick={() => handleDeleteClick(selectedCustomer)}
              >
                Delete User
              </Button>
            </Stack>
          </Box>
        )}
      </Drawer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete Customer?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete customer "{customerToDelete?.name}"? All associated bookings history, feedback and preferences will be removed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete Account</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Customers;
