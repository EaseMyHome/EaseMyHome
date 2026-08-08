import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, Button, Drawer, Typography, Stack, Card, CardContent, Divider,
  IconButton, Chip, Tooltip, TextField, MenuItem, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, Tabs, Tab, Avatar, Grid, Paper
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import PageHeader from '../../../components/common/PageHeader';
import { setProviders, addAuditLog } from '../../../redux/common/dataSlice';
import { useToast } from '../../../components/common/ToastProvider';
import apiClient from '../../../services/common/api';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import './Providers.css';

const Providers = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { providers, bookings, services } = useSelector((state) => state.data);
  const currentUser = useSelector((state) => state.auth.user);

  // States
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState(0); // 0: All, 1: Active, 2: Pending, 3: Suspended
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState(null);
  
  // Assign Services Dialog States
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);

  const fetchProviders = async () => {
    try {
      const response = await apiClient.get('/admin/providers');
      if (response.status === 200) {
        const data = response.data;
        const mapped = data.map(p => ({
          ...p,
          id: `PROV-${p.id}`,
          rawId: p.id,
          verificationStatus: p.status === 'Active' ? 'Approved' : p.status === 'Suspended' ? 'Rejected' : 'Pending',
          documents: {
            [p.documentType?.toLowerCase() || 'document']: p.documentImage || '',
            photo: p.selfieImage || ''
          },
          skills: p.serviceType ? [p.serviceType] : ['General'],
          rating: 4.5,
          assignedServices: [],
          coverageArea: p.coverageArea || '',
          workingRadius: p.workingRadius || 0
        }));
        dispatch(setProviders(mapped));
      }
    } catch (err) {
      console.error('Error loading providers:', err);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  // Tab Filtering logic
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getFilteredProviders = () => {
    if (!Array.isArray(providers)) return [];
    return providers.filter((prov) => {
      if (!prov) return false;
      const skills = Array.isArray(prov.skills) ? prov.skills : (prov.serviceType ? [prov.serviceType] : ['General']);
      const matchesSearch = 
        (prov.name?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
        (prov.email?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
        skills.some(skill => (skill || '').toLowerCase().includes(searchText.toLowerCase()));

      let matchesTab = true;
      if (activeTab === 1) matchesTab = prov.status === 'Active';
      if (activeTab === 2) matchesTab = prov.status === 'Pending';
      if (activeTab === 3) matchesTab = prov.status === 'Suspended';

      return matchesSearch && matchesTab;
    });
  };

  const handleStatusChange = async (prov, newStatus) => {
    if (!prov) return;
    try {
      const rawId = prov.rawId || String(prov.id).replace(/^PROV-/, '');
      const response = await apiClient.put(`/admin/providers/${rawId}/status`, { status: newStatus });
      if (response.status === 200) {
        fetchProviders();
        dispatch(addAuditLog({
          user: currentUser?.email || 'admin@easemyhome.com',
          action: `Changed provider ${prov.name} status to ${newStatus}`,
          module: 'Provider Management'
        }));
        showToast(`Provider status set to ${newStatus}`, 'success');
      } else {
        showToast('Failed to update status', 'error');
      }
    } catch (err) {
      showToast('Network error updating status', 'error');
    }
  };

  const handleDeleteClick = (prov) => {
    setProviderToDelete(prov);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (providerToDelete) {
      try {
        const rawId = providerToDelete.rawId || String(providerToDelete.id).replace(/^PROV-/, '');
        const response = await apiClient.delete(`/admin/providers/${rawId}`);
        if (response.status === 200) {
          fetchProviders();
          dispatch(addAuditLog({
            user: currentUser?.email || 'admin@easemyhome.com',
            action: `Deleted provider ${providerToDelete.name}`,
            module: 'Provider Management'
          }));
          showToast(`Provider ${providerToDelete.name} deleted.`, 'success');
          setDeleteConfirmOpen(false);
          setProviderToDelete(null);
          if (selectedProvider?.id === providerToDelete.id) {
            setProfileDrawerOpen(false);
          }
        } else {
          showToast('Failed to delete provider', 'error');
        }
      } catch (err) {
        showToast('Network error deleting provider', 'error');
      }
    }
  };

  const handleOpenServices = (prov) => {
    setSelectedProvider(prov);
    setSelectedServices(Array.isArray(prov?.assignedServices) ? prov.assignedServices : []);
    setServiceDialogOpen(true);
  };

  const handleSaveServices = () => {
    showToast('Service category mapping is a local feature (requires sub-service backend endpoints)', 'info');
    setServiceDialogOpen(false);
  };

  const handleToggleServiceSelection = (serviceName) => {
    const list = Array.isArray(selectedServices) ? selectedServices : [];
    if (list.includes(serviceName)) {
      setSelectedServices(list.filter(s => s !== serviceName));
    } else {
      setSelectedServices([...list, serviceName]);
    }
  };

  const handleViewProfile = (prov) => {
    setSelectedProvider(prov);
    setProfileDrawerOpen(true);
  };

  // Grid Columns definition
  const columns = [
    { field: 'id', headerName: 'ID', width: 100 },
    { 
      field: 'name', 
      headerName: 'Service Provider', 
      width: 220, 
      renderCell: (params) => {
        const prov = params.row || {};
        const photoUrl = prov.documents?.photo || prov.selfieImage || '';
        return (
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 1 }}>
            <Avatar src={photoUrl} sx={{ width: 32, height: 32 }}>
              {prov.name ? prov.name.charAt(0) : 'P'}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{prov.name || 'Unnamed Partner'}</Typography>
              <Typography variant="caption" color="text.secondary">{prov.email || 'No email'}</Typography>
            </Box>
          </Stack>
        );
      }
    },
    { field: 'phone', headerName: 'Phone Number', width: 140 },
    { 
      field: 'serviceType', 
      headerName: 'Primary Skill', 
      width: 140,
      renderCell: (params) => (
        <Chip label={params.value || 'General'} size="small" sx={{ mt: 1.5, textTransform: 'capitalize' }} />
      )
    },
    { field: 'experience', headerName: 'Experience', width: 110, valueFormatter: (value) => `${value || 0} Years` },
    { 
      field: 'coverageArea', 
      headerName: 'Coverage Area', 
      width: 180,
      renderCell: (params) => {
        const prov = params.row || {};
        return (
          <Typography variant="body2" sx={{ mt: 1.5, fontWeight: 500 }}>
            {prov.coverageArea ? `${prov.coverageArea} (${prov.workingRadius || 0}km)` : 'Not Configured'}
          </Typography>
        );
      }
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => {
        const status = params.value || 'Pending';
        const color = status === 'Active' ? 'success' : status === 'Pending' ? 'warning' : 'error';
        return <Chip label={status} size="small" color={color} sx={{ mt: 1.5, fontWeight: 600 }} />;
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      sortable: false,
      renderCell: (params) => {
        const prov = params.row || {};
        return (
          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
            <Tooltip title="View Profile details">
              <IconButton size="small" onClick={() => handleViewProfile(prov)}>
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {prov.status === 'Pending' && (
              <Tooltip title="Quick Approve">
                <IconButton size="small" color="success" onClick={() => handleStatusChange(prov, 'Active')}>
                  <CheckCircleIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {prov.status === 'Active' && (
              <Tooltip title="Suspend Account">
                <IconButton size="small" color="warning" onClick={() => handleStatusChange(prov, 'Suspended')}>
                  <BlockIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {prov.status === 'Suspended' && (
              <Tooltip title="Reactivate Account">
                <IconButton size="small" color="success" onClick={() => handleStatusChange(prov, 'Active')}>
                  <CheckCircleIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Assign Services">
              <IconButton size="small" color="secondary" onClick={() => handleOpenServices(prov)}>
                <ManageAccountsIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Account">
              <IconButton size="small" color="error" onClick={() => handleDeleteClick(prov)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      }
    }
  ];

  // Bookings associated with selected provider
  const providerBookings = selectedProvider 
    ? (bookings || []).filter((b) => 
        String(b.providerId) === String(selectedProvider.rawId) || 
        String(b.providerId) === String(selectedProvider.id) ||
        (b.provider && (String(b.provider.id) === String(selectedProvider.rawId) || String(b.provider.id) === String(selectedProvider.id)))
      ) 
    : [];

  return (
    <Box>
      <PageHeader
        title="Service Providers"
        subtitle="Manage home-service professionals, verify documentation audits, edit listings and active bookings."
        searchValue={searchText}
        onSearchChange={setSearchText}
      />

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider', mt: 3, mb: 2 }}>
        <Tab label="All Partners" />
        <Tab label="Active" />
        <Tab label="Pending" />
        <Tab label="Suspended" />
      </Tabs>

      {/* Providers Grid */}
      <Paper sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={getFilteredProviders()}
          columns={columns}
          initialState={{
            pagination: { paginationModel: { page: 0, pageSize: 7 } },
          }}
          pageSizeOptions={[5, 7, 10, 20]}
          disableRowSelectionOnClick
          sx={{
            border: 0,
            '& .MuiDataGrid-cell:focus': { outline: 'none' },
          }}
        />
      </Paper>

      {/* Profile Details Side Drawer */}
      <Drawer
        anchor="right"
        open={profileDrawerOpen}
        onClose={() => setProfileDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 500 }, p: 3 } }}
      >
        {selectedProvider && (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Provider details</Typography>
              <IconButton onClick={() => setProfileDrawerOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Stack>

            <Stack spacing={3} sx={{ flexGrow: 1, overflowY: 'auto', pr: 1, mb: 2 }}>
              {/* Partner Profile Summary Card */}
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2.5 }}>
                    <Avatar src={selectedProvider.documents?.photo || selectedProvider.selfieImage || ''} sx={{ width: 64, height: 64 }}>
                      {selectedProvider.name ? selectedProvider.name.charAt(0) : 'P'}
                    </Avatar>
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{selectedProvider.name || 'Unnamed Partner'}</Typography>
                      <Typography variant="body2" color="text.secondary">{selectedProvider.email}</Typography>
                      <Typography variant="body2" color="text.secondary">{selectedProvider.phone}</Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Chip label={selectedProvider.status || 'Pending'} color={selectedProvider.status === 'Active' ? 'success' : selectedProvider.status === 'Pending' ? 'warning' : 'error'} size="small" />
                        <Chip label={`Exp: ${selectedProvider.experience || 0}`} variant="outlined" size="small" />
                        <Chip icon={<StarIcon />} label={selectedProvider.rating || 'New'} color="warning" size="small" />
                      </Stack>
                    </Stack>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  {selectedProvider.coverageArea && (
                    <Box sx={{ p: 2, bgcolor: '#f1f5f9', borderRadius: 2, mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 700 }}>OPERATIONAL LIMITS</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        📍 {selectedProvider.coverageArea} ({selectedProvider.workingRadius || 0} km Radius)
                      </Typography>
                    </Box>
                  )}

                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>SKILLS & CERTIFICATIONS</Typography>
                      <Stack direction="row" flexWrap="wrap" gap={1}>
                        {(Array.isArray(selectedProvider.skills) ? selectedProvider.skills : (selectedProvider.serviceType ? [selectedProvider.serviceType] : ['General'])).map((skill, i) => (
                          <Chip key={i} label={skill} size="small" />
                        ))}
                      </Stack>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>ASSIGNED WORK CATEGORIES</Typography>
                      {(Array.isArray(selectedProvider.assignedServices) && selectedProvider.assignedServices.length > 0) ? (
                        <Stack direction="row" flexWrap="wrap" gap={1}>
                          {selectedProvider.assignedServices.map((srv, i) => (
                            <Chip key={i} label={srv} size="small" color="secondary" variant="outlined" />
                          ))}
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">No service categories assigned yet.</Typography>
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>Booking History</Typography>
              <Divider sx={{ mb: 2 }} />

              {providerBookings.length > 0 ? (
                <Stack spacing={2} sx={{ maxHeight: 220, overflowY: 'auto', pr: 1, mb: 3 }}>
                  {providerBookings.map((b) => (
                    <Card key={b.id} variant="outlined" sx={{ p: 2, '&:hover': { transform: 'none' } }}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{b.service}</Typography>
                        <Chip label={b.status} color={b.status === 'Completed' ? 'success' : 'default'} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Date: {b.date} | Customer: {b.customerName}</Typography>
                    </Card>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>No job bookings completed yet.</Typography>
              )}
            </Stack>

            <Divider sx={{ my: 1 }} />
            <Stack direction="row" spacing={2}>
              {selectedProvider.status === 'Active' ? (
                <Button 
                  variant="outlined" 
                  color="warning" 
                  fullWidth
                  onClick={() => handleStatusChange(selectedProvider, 'Suspended')}
                >
                  Suspend Account
                </Button>
              ) : (
                <Button 
                  variant="outlined" 
                  color="success" 
                  fullWidth
                  onClick={() => handleStatusChange(selectedProvider, 'Active')}
                >
                  Approve / Reactivate
                </Button>
              )}
              <Button 
                variant="contained" 
                color="error" 
                fullWidth
                onClick={() => handleDeleteClick(selectedProvider)}
              >
                Delete Account
              </Button>
            </Stack>
          </Box>
        )}
      </Drawer>

      {/* Assign Services Dialog */}
      <Dialog open={serviceDialogOpen} onClose={() => setServiceDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Services for {selectedProvider?.name}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Assign the specific service jobs that this provider is qualified to carry out.
          </Typography>
          <Grid container spacing={2}>
            {services.map((service) => {
              const isChecked = selectedServices.includes(service.name);
              return (
                <Grid key={service.id} item xs={12} sm={6}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      cursor: 'pointer',
                      border: '2px solid',
                      borderColor: isChecked ? 'primary.main' : 'divider',
                      backgroundColor: isChecked ? 'primary.light' : 'background.paper',
                      transition: 'all 0.2s',
                      '&:hover': { borderColor: 'primary.main' }
                    }}
                    onClick={() => handleToggleServiceSelection(service.name)}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{service.name}</Typography>
                    <Typography variant="caption" color="text.secondary">Duration: {service.duration}</Typography>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setServiceDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveServices} variant="contained">Save Assignments</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Delete Service Provider Account?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete partner "{providerToDelete?.name}"? All verification documents history, earnings statistics, and availability listings will be removed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete Partner</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Providers;
