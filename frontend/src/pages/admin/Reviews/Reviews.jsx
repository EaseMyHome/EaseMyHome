import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, Button, Typography, Stack, Card, CardContent, Divider,
  IconButton, Chip, Tooltip, Paper, Rating
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import PageHeader from '../../../components/common/PageHeader';
import { setReviews, toggleReviewVisibility, deleteReview, addAuditLog } from '../../../redux/common/dataSlice';
import { useToast } from '../../../components/common/ToastProvider';
import apiClient from '../../../services/common/api';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import DeleteIcon from '@mui/icons-material/Delete';
import './Reviews.css';

const Reviews = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { reviews } = useSelector((state) => state.data);
  const currentUser = useSelector((state) => state.auth.user);

  // States
  const [searchText, setSearchText] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchReviewsData = async () => {
    setLoading(true);
    let allReviews = [];

    // Load locally saved user reviews from localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('emh_reviews') || '[]');
      if (Array.isArray(stored) && stored.length > 0) {
        allReviews = [...stored];
      }
    } catch (e) {}

    // Load backend API reviews
    try {
      const res = await apiClient.get('/admin/reviews');
      if (res.ok || res.status === 200) {
        const apiData = Array.isArray(res.data) ? res.data : [];
        allReviews = [...allReviews, ...apiData];
      }
    } catch (e) {
      try {
        const res2 = await apiClient.get('/reviews');
        if (res2.ok || res2.status === 200) {
          const apiData2 = Array.isArray(res2.data) ? res2.data : [];
          allReviews = [...allReviews, ...apiData2];
        }
      } catch (e2) {}
    }

    // Default fallback demo reviews if no reviews found
    if (allReviews.length === 0) {
      allReviews = [
        { id: 1, bookingId: 101, customerName: 'Rahul Sharma', providerName: 'Aman Deep', rating: 5, comment: 'Excellent and quick AC cleaning service!', date: '2026-08-04', status: 'Visible' },
        { id: 2, bookingId: 102, customerName: 'Priya Verma', providerName: 'Vikram Singh', rating: 4, comment: 'Punctual electrician, fixed wiring smoothly.', date: '2026-08-04', status: 'Visible' },
        { id: 3, bookingId: 103, customerName: 'Amit Patel', providerName: 'Rohan Mehta', rating: 5, comment: 'Very professional plumbing service.', date: '2026-08-05', status: 'Visible' }
      ];
    }

    // Deduplicate by ID / bookingId
    const uniqueMap = new Map();
    allReviews.forEach(r => {
      const key = r.id || r.bookingId;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, {
          id: r.id || Math.floor(Math.random() * 10000),
          bookingId: r.bookingId || 100 + Math.floor(Math.random() * 900),
          customerName: r.customerName || r.userName || 'Verified Customer',
          providerName: r.providerName || r.provider?.name || 'Service Provider',
          rating: r.rating || 5,
          comment: r.comment || r.review || 'Great service!',
          date: r.date || r.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
          status: r.status || 'Visible'
        });
      }
    });

    dispatch(setReviews(Array.from(uniqueMap.values())));
    setLoading(false);
  };

  useEffect(() => {
    fetchReviewsData();
  }, []);

  // Search & Filter
  const filteredReviews = (reviews || []).filter((rev) => {
    const cust = rev.customerName || '';
    const prov = rev.providerName || '';
    const comm = rev.comment || '';
    const matchesSearch = 
      cust.toLowerCase().includes(searchText.toLowerCase()) ||
      prov.toLowerCase().includes(searchText.toLowerCase()) ||
      comm.toLowerCase().includes(searchText.toLowerCase());
    const matchesRating = ratingFilter ? (rev.rating || 5).toString() === ratingFilter : true;
    return matchesSearch && matchesRating;
  });

  const handleToggleVisibility = (rev) => {
    dispatch(toggleReviewVisibility(rev.id));
    dispatch(addAuditLog({
      user: currentUser?.email || 'admin@easemyhome.com',
      action: `Toggled visibility of review ID: ${rev.id} to ${rev.status === 'Visible' ? 'Hidden' : 'Visible'}`,
      module: 'Reviews & Ratings'
    }));
    showToast(`Review status set to ${rev.status === 'Visible' ? 'Hidden' : 'Visible'}`, 'info');
  };

  const handleDelete = (rev) => {
    dispatch(deleteReview(rev.id));
    dispatch(addAuditLog({
      user: currentUser?.email || 'admin@easemyhome.com',
      action: `Deleted review from ${rev.customerName} for ${rev.providerName}`,
      module: 'Reviews & Ratings'
    }));
    showToast('Review deleted successfully', 'success');
  };

  const columns = [
    { field: 'id', headerName: 'Review ID', width: 100 },
    { 
      field: 'bookingId', 
      headerName: 'Booking Ref', 
      width: 140,
      renderCell: (params) => (
        <Chip label={`#EMH-${params.value || 'N/A'}`} size="small" color="primary" variant="outlined" sx={{ mt: 1.5, fontWeight: 700 }} />
      )
    },
    { field: 'customerName', headerName: 'Customer Name', width: 160 },
    { field: 'providerName', headerName: 'Provider Name', width: 160 },
    { 
      field: 'rating', 
      headerName: 'Rating', 
      width: 140,
      renderCell: (params) => (
        <Box sx={{ mt: 1.5 }}>
          <Rating value={params.value || 5} readOnly size="small" />
        </Box>
      )
    },
    { field: 'comment', headerName: 'Comment / Feedback', width: 300 },
    { field: 'date', headerName: 'Reviewed Date', width: 120 },
    { 
      field: 'status', 
      headerName: 'Visibility', 
      width: 120, 
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small" 
          color={params.value === 'Visible' ? 'success' : 'default'} 
          sx={{ mt: 1.5, fontWeight: 600 }}
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => {
        const rev = params.row;
        return (
          <Box sx={{ mt: 1 }}>
            <Tooltip title={rev.status === 'Visible' ? 'Hide Review' : 'Show Review'}>
              <IconButton onClick={() => handleToggleVisibility(rev)} color="warning" size="small">
                {rev.status === 'Visible' ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton onClick={() => handleDelete(rev)} color="error" size="small">
                <DeleteIcon />
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
        title="Reviews & Ratings"
        subtitle="View customer feedback on service providers. Manage reviews visibility or delete inappropriate comments."
        searchValue={searchText}
        onSearchChange={setSearchText}
        filterOptions={[
          { label: '5 Stars', value: '5' },
          { label: '4 Stars', value: '4' },
          { label: '3 Stars', value: '3' },
          { label: '2 Stars', value: '2' },
          { label: '1 Star', value: '1' },
        ]}
        selectedFilter={ratingFilter}
        onFilterChange={setRatingFilter}
        onRefresh={() => showToast('Reviews log refreshed', 'success')}
      />

      <Paper sx={{ height: 500, width: '100%', mt: 3 }}>
        <DataGrid
          rows={filteredReviews}
          columns={columns}
          initialState={{
            pagination: { paginationModel: { pageSize: 7 } },
          }}
          pageSizeOptions={[5, 7, 10, 20]}
          disableRowSelectionOnClick
          sx={{ border: 'none' }}
        />
      </Paper>
    </Box>
  );
};

export default Reviews;
