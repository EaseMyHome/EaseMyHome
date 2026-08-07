import React, { useState, useEffect } from 'react';
import { 
  Box, Button, Drawer, Typography, Stack, Card, CardContent, Divider,
  IconButton, Chip, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  Paper, CircularProgress, Alert
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import PageHeader from '../../../components/common/PageHeader';
import { useToast } from '../../../components/common/ToastProvider';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import apiClient from '../../../services/common/api';
import './Complaints.css';

const API_BASE = 'http://localhost:8085/api';
const STATUS_FILTER_OPTIONS = ['Open', 'In Progress', 'Resolved', 'Closed'];

const statusColor = (s) => {
  if (s === 'Closed') return 'success';
  if (s === 'In Progress') return 'info';
  if (s === 'Resolved') return 'warning';
  return 'error';
};

const Complaints = () => {
  const { showToast } = useToast();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);

  // Confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: '', complaint: null });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    let allComplaints = [];

    // Load locally reported complaints from localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('emh_complaints') || '[]');
      if (Array.isArray(stored) && stored.length > 0) {
        allComplaints = [...stored];
      }
    } catch (e) {}

    // Load backend complaints from /complaints or /reports
    try {
      const res = await apiClient.get('/complaints');
      if (res.status === 200 && Array.isArray(res.data)) {
        allComplaints = [...allComplaints, ...res.data];
      }
    } catch (e) {
      try {
        const res2 = await apiClient.get('/reports');
        if (res2.status === 200 && Array.isArray(res2.data)) {
          allComplaints = [...allComplaints, ...res2.data];
        }
      } catch (e2) {}
    }

    // Default demo complaints if no complaints found
    if (allComplaints.length === 0) {
      allComplaints = [
        {
          id: 1,
          ticketId: 'CMP-101',
          userName: 'Ramesh Kumar',
          userEmail: 'ramesh@gmail.com',
          userRole: 'CUSTOMER',
          title: "[Provider didn't arrive] Problem reported for Booking #EMH-102",
          description: 'Provider was scheduled for 10:00 AM but did not arrive or answer calls.',
          issueType: "Provider didn't arrive",
          status: 'Open',
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          ticketId: 'CMP-102',
          userName: 'Sunita Sharma',
          userEmail: 'sunita@yahoo.com',
          userRole: 'CUSTOMER',
          title: '[Poor Quality Work] Tap leakage issue not fixed properly',
          description: 'The plumber replaced washer but tap is still dripping water continuously.',
          issueType: 'Poor Quality Work',
          status: 'In Progress',
          createdAt: new Date().toISOString()
        }
      ];
    }

    // Format & Deduplicate complaints
    const uniqueMap = new Map();
    allComplaints.forEach(c => {
      const key = c.ticketId || c.id;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, {
          id: c.id || Math.floor(Math.random() * 10000),
          ticketId: c.ticketId || `CMP-${Math.floor(100 + Math.random() * 900)}`,
          userName: c.userName || c.customerName || 'Customer User',
          userEmail: c.userEmail || 'customer@easemyhome.com',
          userRole: c.userRole || 'CUSTOMER',
          title: c.title || `Issue reported for Booking #${c.bookingId || 'N/A'}`,
          description: c.description || 'Problem reported by customer.',
          issueType: c.issueType || 'General Complaint',
          status: c.status || 'Open',
          createdAt: c.createdAt || new Date().toISOString()
        });
      }
    });

    setComplaints(Array.from(uniqueMap.values()));
    setLoading(false);
  };

  useEffect(() => { fetchComplaints(); }, []);

  const filteredComplaints = complaints.filter((c) => {
    const s = searchText.toLowerCase();
    const matchSearch =
      String(c.ticketId || '').toLowerCase().includes(s) ||
      String(c.userName || '').toLowerCase().includes(s) ||
      String(c.userEmail || '').toLowerCase().includes(s) ||
      String(c.title || '').toLowerCase().includes(s);
    const matchStatus = statusFilter ? c.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  const openConfirm = (action, complaint) => {
    setConfirmDialog({ open: true, action, complaint });
  };

  const closeConfirm = () => {
    setConfirmDialog({ open: false, action: '', complaint: null });
  };

  const handleAction = async () => {
    const { action, complaint } = confirmDialog;
    setActionLoading(true);
    try {
      const res = await apiClient.post(`/complaints/${complaint.id}/action`, {
        action,
        userEmail: complaint.userEmail,
        userRole: complaint.userRole
      });
      const data = res.data;
      if (res.status === 200) {
        const msgs = {
          SUSPEND: '🚫 Account suspended and complaint closed.',
          APPROVE: '✅ Account approved and complaint resolved.',
          DELETE:  '🗑️ Account deleted and complaint closed.'
        };
        showToast(msgs[action] || data.message, action === 'APPROVE' ? 'success' : action === 'DELETE' ? 'error' : 'warning');
        closeConfirm();
        setDetailsDrawerOpen(false);
        fetchComplaints();
      } else {
        showToast(data.message || 'Action failed.', 'error');
      }
    } catch {
      showToast('Error connecting to backend.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    { field: 'ticketId', headerName: 'Ticket ID', width: 115 },
    { field: 'userName', headerName: 'Name', width: 140 },
    {
      field: 'userRole', headerName: 'Role', width: 100,
      renderCell: (p) => (
        <Chip label={p.value} size="small" variant="outlined"
          color={p.value === 'PROVIDER' ? 'secondary' : 'primary'}
          sx={{ mt: 1.5, fontWeight: 600, fontSize: '0.7rem' }} />
      )
    },
    { field: 'issueType', headerName: 'Reported Issue', width: 165,
      renderCell: (p) => (
        <Chip label={p.value || 'General'} size="small" color="error" variant="outlined"
          sx={{ mt: 1.5, fontWeight: 700, fontSize: '0.75rem' }} />
      )
    },
    { field: 'userEmail', headerName: 'Email', width: 180 },
    { field: 'title', headerName: 'Complaint Title', width: 220 },
    {
      field: 'createdAt', headerName: 'Filed On', width: 120,
      renderCell: (p) => (
        <Typography variant="body2" sx={{ mt: 1.5, fontSize: '0.8rem' }}>
          {p.value ? new Date(p.value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
        </Typography>
      )
    },
    {
      field: 'status', headerName: 'Status', width: 115,
      renderCell: (p) => (
        <Chip label={p.value} size="small" color={statusColor(p.value)} sx={{ mt: 1.5, fontWeight: 600 }} />
      )
    },

    {
      field: 'actions', headerName: 'Actions', width: 200, sortable: false,
      renderCell: (p) => {
        const c = p.row;
        const isClosed = c.status === 'Closed' || c.status === 'Resolved';
        return (
          <Box sx={{ mt: 1, display: 'flex', gap: 0.5 }}>
            <Tooltip title="View Details">
              <IconButton size="small" color="primary"
                onClick={() => { setSelectedComplaint(c); setDetailsDrawerOpen(true); }}>
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Approve Account">
              <span>
                <IconButton size="small" color="success" disabled={isClosed}
                  onClick={() => openConfirm('APPROVE', c)}>
                  <CheckCircleIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Suspend Account">
              <span>
                <IconButton size="small" color="warning" disabled={isClosed}
                  onClick={() => openConfirm('SUSPEND', c)}>
                  <BlockIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Delete Account">
              <span>
                <IconButton size="small" color="error" disabled={isClosed}
                  onClick={() => openConfirm('DELETE', c)}>
                  <DeleteForeverIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        );
      }
    }
  ];

  const actionMeta = {
    APPROVE: { label: 'Approve Account', color: 'success', desc: 'This will set the account status to Active and mark this complaint as Resolved.' },
    SUSPEND: { label: 'Suspend Account', color: 'warning', desc: 'This will suspend the account (Suspended/Blocked status) and close this complaint.' },
    DELETE:  { label: 'Delete Account',  color: 'error',   desc: 'This will permanently delete the account. This action cannot be undone.' }
  };

  return (
    <Box>
      <PageHeader
        title="Complaints & Appeals"
        subtitle="Review complaints submitted by providers and customers. Take direct action: Approve, Suspend, or Delete accounts."
        searchValue={searchText}
        onSearchChange={setSearchText}
        filterOptions={STATUS_FILTER_OPTIONS.map(s => ({ label: s, value: s }))}
        selectedFilter={statusFilter}
        onFilterChange={setStatusFilter}
        onRefresh={() => { fetchComplaints(); showToast('Refreshed', 'success'); }}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ height: 530, width: '100%', mt: 3 }}>
          <DataGrid
            rows={filteredComplaints}
            columns={columns}
            getRowId={(r) => r.id}
            initialState={{ pagination: { paginationModel: { pageSize: 8 } } }}
            pageSizeOptions={[5, 10, 20]}
            disableRowSelectionOnClick
            sx={{ border: 'none' }}
            slots={{
              noRowsOverlay: () => (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: 1 }}>
                  <Typography color="text.secondary">No complaints found</Typography>
                  <Typography variant="body2" color="text.disabled">
                    Complaints submitted by suspended providers or customers will appear here.
                  </Typography>
                </Box>
              )
            }}
          />
        </Paper>
      )}

      {/* Details Drawer */}
      <Drawer
        anchor="right"
        open={detailsDrawerOpen}
        onClose={() => setDetailsDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 480 }, p: 3 } }}
      >
        {selectedComplaint && (
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>Ticket Details</Typography>
              <IconButton onClick={() => setDetailsDrawerOpen(false)}><CloseIcon /></IconButton>
            </Stack>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Stack spacing={2.5}>
                  {[
                    ['TICKET ID', selectedComplaint.ticketId],
                    ['SUBMITTED BY', `${selectedComplaint.userName} (${selectedComplaint.userEmail})`],
                    ['USER TYPE', null],
                    ['REPORTED ISSUE', null],
                    ['BOOKING REFERENCE', selectedComplaint.bookingId ? `#EMH-${selectedComplaint.bookingId}` : 'N/A'],
                    ['COMPLAINT TITLE', selectedComplaint.title],
                    ['DESCRIPTION', selectedComplaint.description],
                    ['FILED ON', selectedComplaint.createdAt ? new Date(selectedComplaint.createdAt).toLocaleString('en-IN') : '—'],
                    ['STATUS', null],
                  ].map(([label, value]) => (
                    <Box key={label}>
                      <Typography variant="caption" color="text.secondary">{label}</Typography>
                      {label === 'USER TYPE' ? (
                        <Box sx={{ mt: 0.5 }}>
                          <Chip label={selectedComplaint.userRole} size="small" variant="outlined"
                            color={selectedComplaint.userRole === 'PROVIDER' ? 'secondary' : 'primary'} />
                        </Box>
                      ) : label === 'REPORTED ISSUE' ? (
                        <Box sx={{ mt: 0.5 }}>
                          <Chip label={selectedComplaint.issueType || 'General'} size="small" color="error"
                            sx={{ fontWeight: 700 }} />
                        </Box>
                      ) : label === 'STATUS' ? (
                        <Box sx={{ mt: 0.5 }}>
                          <Chip label={selectedComplaint.status} size="small"
                            color={statusColor(selectedComplaint.status)} />
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ fontWeight: label === 'TICKET ID' ? 700 : 500, mt: 0.25, lineHeight: 1.6 }}>
                          {value}
                        </Typography>
                      )}
                    </Box>
                  ))}

                  {/* Attached Evidence Images Gallery */}
                  {selectedComplaint.imageUrls && selectedComplaint.imageUrls.trim().length > 0 && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        ATTACHED EVIDENCE IMAGES ({selectedComplaint.imageUrls.split(',').length})
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                        {selectedComplaint.imageUrls.split(',').filter(Boolean).map((imgUrl, i) => (
                          <Box 
                            key={i} 
                            component="a" 
                            href={imgUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            sx={{ 
                              width: 76, 
                              height: 76, 
                              borderRadius: 2, 
                              overflow: 'hidden', 
                              border: '1px solid #e0e0e0',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                              transition: 'transform 0.2s',
                              '&:hover': { transform: 'scale(1.05)' }
                            }}
                          >
                            <img src={imgUrl} alt={`Evidence ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>


            <Divider sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">ADMIN COMPLAINT DECISION</Typography>
            </Divider>

            <Stack spacing={1.5} sx={{ mb: 3 }}>
              <Button 
                variant="contained" 
                color="success" 
                fullWidth 
                startIcon={<CheckCircleIcon />}
                onClick={() => {
                  const note = prompt('Enter Action Taken / Resolution Note for Customer:', 'Action Taken: Complaint investigated. Provider warned & issue resolved.');
                  if (note !== null) {
                    const updatedStatus = 'Resolved';
                    const adminNote = note.trim() || 'Action Taken: Provider warned & issue resolved.';
                    
                    const updatedItem = { ...selectedComplaint, status: updatedStatus, adminResponse: adminNote };
                    setSelectedComplaint(updatedItem);
                    setComplaints(prev => prev.map(item => (item.id === selectedComplaint.id || item.ticketId === selectedComplaint.ticketId) ? updatedItem : item));
                    
                    try {
                      const stored = JSON.parse(localStorage.getItem('emh_complaints') || '[]');
                      const updatedStored = stored.map(c => (c.id === selectedComplaint.id || c.ticketId === selectedComplaint.ticketId || c.bookingId === selectedComplaint.bookingId) ? { ...c, status: updatedStatus, adminResponse: adminNote } : c);
                      localStorage.setItem('emh_complaints', JSON.stringify(updatedStored));
                      window.dispatchEvent(new Event('storage'));
                    } catch (e) {}

                    showToast('Complaint resolved & action details sent to customer!', 'success');
                  }
                }}
              >
                ✅ Take Action & Resolve Complaint
              </Button>

              <Button 
                variant="contained" 
                color="error" 
                fullWidth 
                startIcon={<BlockIcon />}
                onClick={() => {
                  const note = prompt('Enter Reason for marking as False Complaint:', 'Dismissed: False / Invalid Complaint after verification.');
                  if (note !== null) {
                    const updatedStatus = 'False Complaint';
                    const adminNote = note.trim() || 'Dismissed: Invalid / False Complaint.';

                    const updatedItem = { ...selectedComplaint, status: updatedStatus, adminResponse: adminNote };
                    setSelectedComplaint(updatedItem);
                    setComplaints(prev => prev.map(item => (item.id === selectedComplaint.id || item.ticketId === selectedComplaint.ticketId) ? updatedItem : item));

                    try {
                      const stored = JSON.parse(localStorage.getItem('emh_complaints') || '[]');
                      const updatedStored = stored.map(c => (c.id === selectedComplaint.id || c.ticketId === selectedComplaint.ticketId || c.bookingId === selectedComplaint.bookingId) ? { ...c, status: updatedStatus, adminResponse: adminNote } : c);
                      localStorage.setItem('emh_complaints', JSON.stringify(updatedStored));
                      window.dispatchEvent(new Event('storage'));
                    } catch (e) {}

                    showToast('Complaint marked as False Complaint & customer notified!', 'warning');
                  }
                }}
              >
                ❌ Mark as False Complaint
              </Button>
            </Stack>

            {selectedComplaint.adminResponse && (
              <Alert severity={selectedComplaint.status === 'Resolved' ? 'success' : 'error'} sx={{ mb: 2 }}>
                <strong>Admin Decision:</strong> {selectedComplaint.adminResponse}
              </Alert>
            )}
          </Box>
        )}
      </Drawer>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={closeConfirm} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Confirm: {confirmDialog.action && actionMeta[confirmDialog.action]?.label}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography variant="body2">
              {confirmDialog.action && actionMeta[confirmDialog.action]?.desc}
            </Typography>
            {confirmDialog.complaint && (
              <Alert severity={confirmDialog.action === 'APPROVE' ? 'success' : confirmDialog.action === 'DELETE' ? 'error' : 'warning'}>
                <strong>Account:</strong> {confirmDialog.complaint.userName} ({confirmDialog.complaint.userEmail})
                <br />
                <strong>Type:</strong> {confirmDialog.complaint.userRole}
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeConfirm} color="inherit" disabled={actionLoading}>Cancel</Button>
          <Button
            onClick={handleAction}
            variant="contained"
            color={confirmDialog.action ? actionMeta[confirmDialog.action]?.color : 'primary'}
            disabled={actionLoading}
          >
            {actionLoading
              ? <CircularProgress size={20} color="inherit" />
              : `Yes, ${confirmDialog.action && actionMeta[confirmDialog.action]?.label}`
            }
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Complaints;
