import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, Button, Drawer, Typography, Stack, Card, CardContent, Divider,
  IconButton, Chip, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Select, FormControl, InputLabel, Paper, List, ListItem, ListItemText, Stepper, Step, StepLabel, Rating
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import PageHeader from '../../../components/common/PageHeader';
import { assignBookingProvider, updateBookingStatus, cancelBooking, addAuditLog, setBookings } from '../../../redux/common/dataSlice';
import { useToast } from '../../../components/common/ToastProvider';
import apiClient from '../../../services/common/api';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import './Bookings.css';

const BOOKING_STATUSES = [
  'Pending',
  'Accepted',
  'Assigned',
  'Rescheduled',
  'On The Way',
  'Started',
  'Completed',
  'Declined',
  'Cancelled'
];

const Bookings = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { bookings, providers } = useSelector((state) => state.data);
  const currentUser = useSelector((state) => state.auth.user);

  // States
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  // Fetch bookings on mount
  const fetchBookingsList = async () => {
    try {
      const res = await apiClient.get('/bookings/all');
      if (res.status === 200 && Array.isArray(res.data)) {
        const mappedData = res.data.map(b => {
          const rawId = b.id;
          const rawStatus = b.status || 'PENDING';
          const statusTitle = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();
          return {
            ...b,
            id: rawId,
            displayId: `EMH-${rawId}`,
            rawId: rawId,
            customerName: b.customerName || 'Customer',
            customerPhone: b.customerPhone || 'N/A',
            customerEmail: b.customerEmail || 'N/A',
            service: b.serviceType || 'General Service',
            serviceType: b.serviceType || 'General Service',
            category: b.serviceType || 'General Service',
            providerName: b.provider ? b.provider.name : null,
            providerPhone: b.provider ? b.provider.phone : null,
            providerEmail: b.provider ? b.provider.email : null,
            providerId: b.provider ? b.provider.id : null,
            date: b.bookingDate || 'Scheduled',
            timeSlot: b.bookingTime || 'Flexible',
            address: b.address || 'Address Not Specified',
            status: statusTitle
          };
        });
        dispatch(setBookings(mappedData));
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  useEffect(() => {
    fetchBookingsList();
  }, [dispatch]);

  // Filter Bookings logic
  const filteredBookings = (bookings || []).filter((b) => {
    if (!b) return false;
    const matchesSearch = 
      String(b.id || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (b.customerName && b.customerName.toLowerCase().includes(searchText.toLowerCase())) ||
      (b.service && b.service.toLowerCase().includes(searchText.toLowerCase())) ||
      (b.providerName && b.providerName.toLowerCase().includes(searchText.toLowerCase()));
    const matchesStatus = statusFilter 
      ? String(b.status || '').toUpperCase() === String(statusFilter).toUpperCase()
      : true;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAssign = (booking) => {
    setSelectedBooking(booking);
    setAssignDialogOpen(true);
  };

  const handleAssignProvider = async (prov) => {
    if (!selectedBooking) return;
    try {
      const rawId = selectedBooking.rawId || selectedBooking.id;
      const res = await apiClient.put(`/bookings/${rawId}/status`, {
        providerId: prov.rawId || prov.id,
        status: 'ASSIGNED'
      });
      if (res.status === 200) {
        fetchBookingsList();
        dispatch(addAuditLog({
          user: currentUser?.email || 'admin@easemyhome.com',
          action: `Assigned provider ${prov.name} to booking ID: ${selectedBooking.id}`,
          module: 'Booking Management'
        }));
        showToast(`Provider ${prov.name} assigned successfully!`, 'success');
      } else {
        showToast('Failed to assign provider', 'error');
      }
    } catch (err) {
      showToast('Network error assigning provider', 'error');
    } finally {
      setAssignDialogOpen(false);
    }
  };

  const handleOpenStatus = (booking) => {
    setSelectedBooking(booking);
    setNewStatus(booking.status || 'Pending');
    setStatusDialogOpen(true);
  };

  const handleSaveStatus = async () => {
    if (!selectedBooking) return;
    try {
      const rawId = selectedBooking.rawId || selectedBooking.id;
      const res = await apiClient.put(`/bookings/${rawId}/status`, {
        status: newStatus.toUpperCase()
      });
      if (res.status === 200) {
        fetchBookingsList();
        dispatch(addAuditLog({
          user: currentUser?.email || 'admin@easemyhome.com',
          action: `Updated status of booking ID: ${selectedBooking.id} to ${newStatus}`,
          module: 'Booking Management'
        }));
        showToast(`Booking status updated to ${newStatus}`, 'success');
      } else {
        showToast('Failed to update status', 'error');
      }
    } catch (err) {
      showToast('Network error updating status', 'error');
    } finally {
      setStatusDialogOpen(false);
    }
  };

  const handleOpenCancel = (booking) => {
    setSelectedBooking(booking);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBooking) return;
    try {
      const rawId = selectedBooking.rawId || selectedBooking.id;
      const res = await apiClient.put(`/bookings/${rawId}/status`, {
        status: 'CANCELLED'
      });
      if (res.status === 200) {
        fetchBookingsList();
        dispatch(addAuditLog({
          user: currentUser?.email || 'admin@easemyhome.com',
          action: `Cancelled booking ID: ${selectedBooking.id}`,
          module: 'Booking Management'
        }));
        showToast('Booking cancelled successfully', 'warning');
      } else {
        showToast('Failed to cancel booking', 'error');
      }
    } catch (err) {
      showToast('Network error cancelling booking', 'error');
    } finally {
      setCancelDialogOpen(false);
    }
  };

  const [bookingReview, setBookingReview] = useState(null);
  const [loadingReview, setLoadingReview] = useState(false);

  const handleViewDetails = async (booking) => {
    setSelectedBooking(booking);
    setBookingReview(null);
    setDetailsDrawerOpen(true);

    const rawId = booking.rawId || booking.id;
    setLoadingReview(true);
    try {
      const res = await apiClient.get(`/reviews/booking/${rawId}`);
      if (res.status === 200 && res.data) {
        setBookingReview(res.data);
      }
    } catch (e) {
      setBookingReview(null);
    } finally {
      setLoadingReview(false);
    }
  };

  // Filter providers by booking category
  const getEligibleProviders = () => {
    if (!selectedBooking) return [];
    const bookingCat = (selectedBooking.category || selectedBooking.serviceType || '').toLowerCase();
    return (providers || []).filter(p => {
      if (p.status !== 'Active') return false;
      const skills = Array.isArray(p.skills) ? p.skills : (p.serviceType ? [p.serviceType] : []);
      const assigned = Array.isArray(p.assignedServices) ? p.assignedServices : [];
      const allServices = [...skills, ...assigned];
      return allServices.length === 0 || allServices.some(s => (s || '').toLowerCase().includes(bookingCat));
    });
  };

  const columns = [
    { field: 'id', headerName: 'Booking ID', width: 120, valueFormatter: (value) => `EMH-${value}` },
    { field: 'customerName', headerName: 'Customer', width: 150 },
    { 
      field: 'providerName', 
      headerName: 'Assigned Provider', 
      width: 160,
      renderCell: (params) => params.value ? (
        <Typography variant="body2" sx={{ mt: 1.5, fontWeight: 500 }}>{params.value}</Typography>
      ) : (
        <Chip label="Unassigned" size="small" color="error" variant="outlined" sx={{ mt: 1.5 }} />
      )
    },
    { field: 'category', headerName: 'Category', width: 140 },
    { field: 'service', headerName: 'Service', width: 180 },
    { field: 'date', headerName: 'Date', width: 110 },
    { field: 'timeSlot', headerName: 'Slot', width: 160 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 130,
      renderCell: (params) => {
        let color = 'info';
        const st = String(params.value || '').toUpperCase();
        if (st === 'COMPLETED') color = 'success';
        if (st === 'CANCELLED' || st === 'DECLINED') color = 'error';
        if (st === 'PENDING') color = 'warning';
        if (st === 'ACCEPTED' || st === 'ASSIGNED') color = 'primary';
        return <Chip label={params.value || 'Pending'} size="small" color={color} sx={{ mt: 1.5, fontWeight: 600 }} />;
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      sortable: false,
      renderCell: (params) => {
        const b = params.row;
        const st = String(b.status || '').toUpperCase();
        const isClosed = st === 'COMPLETED' || st === 'CANCELLED' || st === 'DECLINED';
        return (
          <Box sx={{ mt: 1 }}>
            <Tooltip title="View Details">
              <IconButton onClick={() => handleViewDetails(b)} color="primary" size="small">
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={b.providerId ? "Reassign Provider" : "Assign Provider"}>
              <span>
                <IconButton onClick={() => handleOpenAssign(b)} color="secondary" size="small" disabled={isClosed}>
                  <PersonAddIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Update Status">
              <span>
                <IconButton onClick={() => handleOpenStatus(b)} color="warning" size="small" disabled={isClosed}>
                  <CheckCircleIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Cancel Booking">
              <span>
                <IconButton onClick={() => handleOpenCancel(b)} color="error" size="small" disabled={isClosed}>
                  <CancelIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        );
      }
    }
  ];

  const getStatusStepIndex = (status) => {
    const st = String(status || '').toUpperCase();
    if (st === 'CANCELLED' || st === 'DECLINED') return -1;
    if (st === 'PENDING') return 0;
    if (st === 'ACCEPTED') return 1;
    if (st === 'ASSIGNED') return 2;
    if (st === 'RESCHEDULED') return 3;
    if (st === 'ON THE WAY') return 4;
    if (st === 'STARTED') return 5;
    if (st === 'COMPLETED') return 6;
    return 0;
  };

  const handleExportData = () => {
    const headers = ['Booking ID', 'Customer', 'Provider', 'Category', 'Service', 'Date', 'Slot', 'Address', 'Status'];
    const rows = filteredBookings.map(b => [b.id, b.customerName, b.providerName || 'N/A', b.category, b.service, b.date, b.timeSlot, b.address, b.status]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bookings_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported booking logs to CSV', 'success');
  };

  return (
    <Box>
      <PageHeader
        title="Booking Logs"
        subtitle="Dispatch providers, monitor active sessions, cancel reservations, and review timeline records."
        searchValue={searchText}
        onSearchChange={setSearchText}
        filterOptions={BOOKING_STATUSES.map(s => ({ label: s, value: s }))}
        selectedFilter={statusFilter}
        onFilterChange={setStatusFilter}
        onExport={handleExportData}
        onRefresh={() => showToast('Booking logs updated', 'success')}
      />

      <Paper sx={{ height: 500, width: '100%', mt: 3 }}>
        <DataGrid
          rows={filteredBookings}
          columns={columns}
          initialState={{
            pagination: { paginationModel: { pageSize: 7 } },
          }}
          pageSizeOptions={[5, 10, 20]}
          disableRowSelectionOnClick
          sx={{ border: 'none' }}
        />
      </Paper>

      {/* Booking Details Drawer */}
      <Drawer
        anchor="right"
        open={detailsDrawerOpen}
        onClose={() => setDetailsDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 500 }, p: 3 } }}
      >
        {selectedBooking && (
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>Booking Timeline</Typography>
              <IconButton onClick={() => setDetailsDrawerOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Stack>

            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">BOOKING ID</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{selectedBooking.id}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">CUSTOMER DETAILS</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedBooking.customerName}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">JOB DETAILS</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedBooking.service} ({selectedBooking.category})</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">SCHEDULED TIME & SLOT</Typography>
                    <Typography variant="body2">{selectedBooking.date} | {selectedBooking.timeSlot}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">SERVICE ADDRESS</Typography>
                    <Typography variant="body2" color="text.secondary">{selectedBooking.address}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">ASSIGNED SERVICE PROVIDER & CONTACT</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {selectedBooking.providerName ? selectedBooking.providerName : 'No provider assigned'}
                    </Typography>
                    {selectedBooking.providerPhone && (
                      <Typography variant="caption" display="block" color="primary" sx={{ fontWeight: 800 }}>
                        📞 Phone: <a href={`tel:${selectedBooking.providerPhone}`} style={{ color: '#2563eb', textDecoration: 'none' }}>{selectedBooking.providerPhone}</a>
                      </Typography>
                    )}
                    {selectedBooking.providerEmail && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        ✉️ Email: {selectedBooking.providerEmail}
                      </Typography>
                    )}
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>CUSTOMER RATING & REVIEW</Typography>
                    {loadingReview ? (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mt: 0.5 }}>Loading customer review...</Typography>
                    ) : bookingReview ? (
                      <Paper variant="outlined" sx={{ p: 1.5, mt: 1, bgcolor: '#f8fafc', borderRadius: 2, borderColor: '#e2e8f0' }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                          <Rating value={bookingReview.rating || 5} readOnly size="small" />
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                            {bookingReview.rating} / 5.0
                          </Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#334155', my: 0.5 }}>
                          "{bookingReview.comment}"
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                          By {bookingReview.userName || 'Customer'} on {bookingReview.createdAt ? new Date(bookingReview.createdAt).toLocaleDateString() : 'Recent'}
                        </Typography>
                      </Paper>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mt: 0.5 }}>
                        No review submitted yet for this booking.
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Workflow Status</Typography>
            <Divider sx={{ mb: 3 }} />

            {selectedBooking.status === 'Cancelled' ? (
              <Chip label="Booking Cancelled" color="error" variant="filled" sx={{ width: '100%', py: 2, fontSize: '1rem', fontWeight: 600 }} />
            ) : (
              <Stepper activeStep={getStatusStepIndex(selectedBooking.status)} orientation="vertical" sx={{ pl: 2, mb: 4 }}>
                {BOOKING_STATUSES.filter(s => s !== 'Cancelled').map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            )}

            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              {!['Completed', 'Cancelled'].includes(selectedBooking.status) && (
                <>
                  <Button 
                    variant="outlined" 
                    color="secondary" 
                    fullWidth
                    onClick={() => {
                      setDetailsDrawerOpen(false);
                      handleOpenAssign(selectedBooking);
                    }}
                  >
                    {selectedBooking.providerId ? 'Reassign Job' : 'Assign Job'}
                  </Button>
                  <Button 
                    variant="contained" 
                    color="warning" 
                    fullWidth
                    onClick={() => {
                      setDetailsDrawerOpen(false);
                      handleOpenStatus(selectedBooking);
                    }}
                  >
                    Change Status
                  </Button>
                </>
              )}
            </Stack>
          </Box>
        )}
      </Drawer>

      {/* Assign Provider Dialog */}
      <Dialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Select Service Provider</DialogTitle>
        <DialogContent dividers sx={{ maxHeight: 350 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Assigning job for category: <strong>{selectedBooking?.category}</strong>. Listing active matching experts:
          </Typography>
          <List>
            {getEligibleProviders().length > 0 ? (
              getEligibleProviders().map((prov) => (
                <ListItem 
                  key={prov.id} 
                  component={Button}
                  onClick={() => handleAssignProvider(prov)}
                  fullWidth
                  sx={{ 
                    textAlign: 'left', 
                    color: 'text.primary', 
                    textTransform: 'none',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    mb: 1,
                    py: 1,
                    justifyContent: 'flex-start'
                  }}
                >
                  <ListItemText 
                    primary={prov.name} 
                    secondary={`Exp: ${prov.experience} | Rating: ${prov.rating || 'N/A'}`} 
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                </ListItem>
              ))
            ) : (
              <Typography color="error" sx={{ textAlign: 'center', py: 2 }}>
                No active providers found matching this category.
              </Typography>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)} color="inherit">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Update Booking Status</DialogTitle>
        <DialogContent dividers>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel id="status-select-label">Select Workflow State</InputLabel>
            <Select
              labelId="status-select-label"
              value={newStatus}
              label="Select Workflow State"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              {BOOKING_STATUSES.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setStatusDialogOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleSaveStatus} color="primary" variant="contained">Save Status</Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
      >
        <DialogTitle>Cancel Booking Request</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to cancel booking request <strong>{selectedBooking?.id}</strong>? An alert notification will be sent to the customer and provider.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCancelDialogOpen(false)} color="inherit">No, Keep</Button>
          <Button onClick={handleConfirmCancel} color="error" variant="contained">Yes, Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Bookings;
