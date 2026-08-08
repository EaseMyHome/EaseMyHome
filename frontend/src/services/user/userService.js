import apiClient from '../common/api';

export const userService = {
  fetchProviders: async () => {
    const token = localStorage.getItem('emh_token') || localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const res = await fetch('http://localhost:8085/api/admin/providers', { headers });
    if (!res.ok) throw new Error('Failed to fetch providers');
    return await res.json();
  },

  fetchCategories: async () => {
    const token = localStorage.getItem('emh_token') || localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const res = await fetch('http://localhost:8085/api/categories', { headers });
    if (!res.ok) throw new Error('Failed to fetch categories');
    return await res.json();
  },

  fetchCustomerBookings: async (email) => {
    const emailQuery = email ? `?email=${encodeURIComponent(email)}` : '';
    const res = await apiClient.get(`/bookings/customer${emailQuery}`);
    return res.data;
  },

  createBooking: async (payload) => {
    const res = await apiClient.post('/bookings', payload);
    return res.data;
  },

  submitReview: async (reviewData) => {
    const res = await apiClient.post('/reviews', reviewData);
    return res.data;
  },

  reportIssue: async (reportData) => {
    const res = await apiClient.post('/reports', reportData);
    return res.data;
  },

  uploadReportImage: async (formData) => {
    const res = await fetch('http://localhost:8085/api/upload', {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Upload failed');
    return await res.json();
  },

  updateProfile: async (profileData) => {
    const res = await apiClient.put('/users/profile', profileData);
    return res.data;
  }
};

export default userService;
