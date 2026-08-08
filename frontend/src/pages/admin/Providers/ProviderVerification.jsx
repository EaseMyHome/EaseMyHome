import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, Button, Typography, Stack, Card, CardContent, Divider,
  IconButton, Chip, Tooltip, Paper, Grid, Dialog, DialogTitle,
  DialogContent, DialogActions, List, ListItem, ListItemText, 
  ListItemSecondaryAction, TextField, Avatar
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import PageHeader from '../../../components/common/PageHeader';
import { setProviders, addAuditLog } from '../../../redux/common/dataSlice';
import { useToast } from '../../../components/common/ToastProvider';
import apiClient from '../../../services/common/api';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import './ProviderVerification.css';

const ProviderVerification = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { providers } = useSelector((state) => state.data);
  const currentUser = useSelector((state) => state.auth.user);

  // States
  const [searchText, setSearchText] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState({ title: '', url: '' });
  const [reuploadOpen, setReuploadOpen] = useState(false);
  const [reuploadDocType, setReuploadDocType] = useState('');
  const [reuploadReason, setReuploadReason] = useState('');

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
      console.error('Error loading providers for verification:', err);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  // Get providers who are either Pending or have unapproved documents
  const pendingProviders = providers.filter((p) => {
    const matchesSearch = (p.name?.toLowerCase() || '').includes(searchText.toLowerCase());
    const isPending = p.verificationStatus === 'Pending' || p.status === 'Pending';
    return matchesSearch && isPending;
  });

  const handlePreviewDoc = (title, url) => {
    if (!url) {
      showToast('Document not uploaded yet', 'warning');
      return;
    }
    setPreviewDoc({ title, url });
    setPreviewOpen(true);
  };

  const handleVerifyDoc = (provId, docType, status) => {
    // Local state document toggle, for UX
    showToast(`Document ${docType} status updated locally to ${status}`, 'success');
  };

  const handleOpenReupload = (docType) => {
    setReuploadDocType(docType);
    setReuploadReason('');
    setReuploadOpen(true);
  };

  const handleRequestReupload = () => {
    showToast(`Re-upload request requested locally for ${reuploadDocType}`, 'info');
    setReuploadOpen(false);
  };

  const handleApproveProvider = async (prov) => {
    try {
      const response = await apiClient.put(`/admin/providers/${prov.rawId}/status`, { status: 'Active' });
      if (response.status === 200) {
        fetchProviders();
        dispatch(addAuditLog({
          user: currentUser?.email || 'admin@easemyhome.com',
          action: `Approved provider registration for ${prov.name}`,
          module: 'Provider Verification'
        }));
        showToast(`Provider ${prov.name} registration approved and activated!`, 'success');
        setSelectedProvider(null);
      } else {
        showToast('Failed to approve provider', 'error');
      }
    } catch (err) {
      showToast('Network error approving provider', 'error');
    }
  };

  const handleRejectProvider = async (prov) => {
    try {
      const response = await apiClient.put(`/admin/providers/${prov.rawId}/status`, { status: 'Suspended' });
      if (response.status === 200) {
        fetchProviders();
        dispatch(addAuditLog({
          user: currentUser?.email || 'admin@easemyhome.com',
          action: `Rejected provider registration for ${prov.name}`,
          module: 'Provider Verification'
        }));
        showToast(`Provider ${prov.name} registration rejected.`, 'error');
        setSelectedProvider(null);
      } else {
        showToast('Failed to reject provider', 'error');
      }
    } catch (err) {
      showToast('Network error rejecting provider', 'error');
    }
  };

  const columns = [
    { field: 'id', headerName: 'Provider ID', width: 110 },
    { field: 'name', headerName: 'Applicant Name', width: 180, renderCell: (params) => (
      <Typography variant="body2" sx={{ fontWeight: 600, mt: 1.5 }}>{params.value}</Typography>
    )},
    { field: 'serviceType', headerName: 'Skill Specialty', width: 150, renderCell: (params) => (
      <Chip label={params.value || 'General'} size="small" sx={{ mt: 1.5, textTransform: 'capitalize' }} />
    )},
    { field: 'experience', headerName: 'Experience', width: 110, valueFormatter: (value) => `${value} Years` },
    { field: 'status', headerName: 'Review Status', width: 130, renderCell: (params) => (
      <Chip label={params.value} color="warning" size="small" sx={{ mt: 1.5, fontWeight: 600 }} />
    )},
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Button 
          variant="contained" 
          size="small" 
          startIcon={<VisibilityIcon />}
          onClick={() => setSelectedProvider(params.row)}
          sx={{ mt: 1 }}
        >
          Review
        </Button>
      )
    }
  ];

  return (
    <Box>
      <PageHeader
        title="Document Verification Audits"
        subtitle="Review uploaded identity documentations and selfie photo captures to approve new service partner listings."
        searchValue={searchText}
        onSearchChange={setSearchText}
      />

      <Grid container spacing={3} sx={{ mt: 3 }}>
        {/* Left Side: Applicants List */}
        <Grid item xs={12} md={selectedProvider ? 7 : 12}>
          <Paper sx={{ height: 480, width: '100%' }}>
            <DataGrid
              rows={pendingProviders}
              columns={columns}
              initialState={{
                pagination: { paginationModel: { page: 0, pageSize: 6 } },
              }}
              pageSizeOptions={[5, 6, 10]}
              disableRowSelectionOnClick
              sx={{
                border: 0,
                '& .MuiDataGrid-cell:focus': { outline: 'none' },
              }}
            />
          </Paper>
        </Grid>

        {/* Right Side: Verification Details Pane */}
        {selectedProvider && (
          <Grid item xs={12} md={5}>
            <Card variant="outlined" sx={{ p: 3, height: '100%', borderRadius: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Applicant Review</Typography>
                <IconButton onClick={() => setSelectedProvider(null)}>
                  <CloseIcon />
                </IconButton>
              </Stack>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 2, mb: 3 }}>
                <Avatar src={selectedProvider.documents.photo} sx={{ width: 56, height: 56 }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{selectedProvider.name}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Email: {selectedProvider.email}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Phone: {selectedProvider.phone}</Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 2.5 }} />

              <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>Uploaded Documents Checklist</Typography>
              
              <List sx={{ bgcolor: 'background.default', borderRadius: 2, p: 1 }}>
                {Object.keys(selectedProvider.documents).map((docType) => {
                  const docUrl = selectedProvider.documents[docType];
                  const isImage = typeof docUrl === 'string' && (docUrl.startsWith('http') || docUrl.startsWith('data:image'));
                  const docStatus = docUrl ? (isImage ? 'Uploaded' : docUrl) : 'Not Uploaded';

                  let statusColor = 'default';
                  if (docStatus === 'Uploaded') statusColor = 'info';
                  if (docStatus === 'Verified' || docStatus === 'Approved') statusColor = 'success';
                  if (docStatus === 'Rejected' || docStatus === 'Re-upload Requested') statusColor = 'error';

                  const formatDocLabel = (str) => {
                    return str.charAt(0).toUpperCase() + str.slice(1).replace(/([A-Z])/g, ' $1');
                  };

                  return (
                    <ListItem key={docType} sx={{ borderBottom: '1px solid', borderColor: 'divider', py: 1.5 }}>
                      <ListItemText
                        primary={formatDocLabel(docType)}
                        secondary={
                          <Chip 
                            label={docUrl ? docStatus : 'Missing'} 
                            size="small" 
                            color={docUrl ? statusColor : 'default'} 
                            variant="outlined"
                            sx={{ mt: 0.5, fontWeight: 600, height: 20, fontSize: '0.65rem' }} 
                          />
                        }
                      />
                      <ListItemSecondaryAction>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Preview Document">
                            <span>
                              <Button 
                                size="small" 
                                variant="outlined" 
                                disabled={!docUrl}
                                onClick={() => handlePreviewDoc(formatDocLabel(docType), docUrl)}
                              >
                                Preview
                              </Button>
                            </span>
                          </Tooltip>
                          <IconButton 
                            size="small" 
                            color="success" 
                            disabled={!docUrl || docStatus === 'Verified'}
                            onClick={() => handleVerifyDoc(selectedProvider.id, docType, 'Verified')}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error" 
                            disabled={!docUrl || docStatus === 'Re-upload Requested'}
                            onClick={() => handleOpenReupload(docType)}
                          >
                            <CancelIcon />
                          </IconButton>
                        </Stack>
                      </ListItemSecondaryAction>
                    </ListItem>
                  );
                })}
              </List>

              <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                <Button 
                  variant="outlined" 
                  color="error" 
                  fullWidth
                  onClick={() => handleRejectProvider(selectedProvider)}
                >
                  Reject Application
                </Button>
                <Button 
                  variant="contained" 
                  color="success" 
                  fullWidth
                  onClick={() => handleApproveProvider(selectedProvider)}
                >
                  Approve Partner
                </Button>
              </Stack>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Image Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md">
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Document Preview: {previewDoc.title}
          <IconButton onClick={() => setPreviewOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'black' }}>
          <img 
            src={previewDoc.url} 
            alt="Preview Document" 
            style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }} 
          />
        </Box>
      </Dialog>

      {/* Request Reupload Dialog */}
      <Dialog open={reuploadOpen} onClose={() => setReuploadOpen(false)}>
        <DialogTitle>Request Re-upload</DialogTitle>
        <Box sx={{ p: 2.5, width: 320 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Provide the reason why this document is rejected so the provider can re-submit.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Rejection Reason"
            value={reuploadReason}
            onChange={(e) => setReuploadReason(e.target.value)}
          />
          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2.5 }}>
            <Button onClick={() => setReuploadOpen(false)}>Cancel</Button>
            <Button onClick={handleRequestReupload} variant="contained" color="error">Request</Button>
          </Stack>
        </Box>
      </Dialog>
    </Box>
  );
};

export default ProviderVerification;
