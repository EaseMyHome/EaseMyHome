import apiClient from '../common/api';

export const adminService = {
  fetchDashboardStats: async () => {
    const res = await apiClient.get('/admin/stats');
    return res.data;
  },

  fetchCustomers: async () => {
    const res = await apiClient.get('/admin/customers');
    return res.data;
  },

  fetchProviders: async () => {
    const res = await apiClient.get('/admin/providers');
    return res.data;
  },

  verifyProvider: async (providerId, status) => {
    const res = await apiClient.put(`/admin/providers/${providerId}/verification`, { status });
    return res.data;
  },

  fetchCategories: async () => {
    const res = await apiClient.get('/categories');
    return res.data;
  },

  createCategory: async (categoryData) => {
    const res = await apiClient.post('/categories', categoryData);
    return res.data;
  },

  updateCategory: async (id, categoryData) => {
    const res = await apiClient.put(`/categories/${id}`, categoryData);
    return res.data;
  },

  deleteCategory: async (id) => {
    const res = await apiClient.delete(`/categories/${id}`);
    return res.data;
  },

  fetchServices: async () => {
    const res = await apiClient.get('/admin/services');
    return res.data;
  },

  fetchBookings: async () => {
    const res = await apiClient.get('/bookings/all');
    return res.data;
  },

  fetchComplaints: async () => {
    const res = await apiClient.get('/reports');
    return res.data;
  },

  resolveComplaint: async (id, status) => {
    const res = await apiClient.put(`/reports/${id}`, { status });
    return res.data;
  },

  fetchOffers: async () => {
    const res = await apiClient.get('/admin/offers');
    return res.data;
  },

  fetchBanners: async () => {
    const res = await apiClient.get('/admin/banners');
    return res.data;
  },

  fetchNotifications: async () => {
    const res = await apiClient.get('/admin/notifications');
    return res.data;
  },

  fetchAuditLogs: async () => {
    const res = await apiClient.get('/admin/audit-logs');
    return res.data;
  }
};

export default adminService;
