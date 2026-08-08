import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  customers: [],
  providers: [],
  categories: [],
  services: [],
  bookings: [],
  banners: [],
  offers: [],
  reviews: [],
  notifications: [],
  complaints: [],
  locations: [],
  admins: [],
  auditLogs: [],
  settings: {
    platformName: 'EaseMyHome',
    logo: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=150',
    supportEmail: 'support@easemyhome.com',
    contactNumber: '+91 1800 123 4567',
    workingHours: '08:00 AM - 08:00 PM',
    bookingRules: 'Users can book up to 7 days in advance. Rescheduling allowed up to 2 hours before slot.',
    cancellationRules: 'Free cancellation up to 4 hours before slot. Late cancellation fee ₹100 applies.',
  }
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    // Database setters
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
    setProviders: (state, action) => {
      state.providers = action.payload;
    },
    setCustomers: (state, action) => {
      state.customers = action.payload;
    },
    setBookings: (state, action) => {
      state.bookings = action.payload;
    },
    setReviews: (state, action) => {
      state.reviews = action.payload;
    },

    // Customers Actions
    updateCustomerStatus: (state, action) => {
      const { id, status } = action.payload;
      const customer = state.customers.find(c => c.id === id);
      if (customer) customer.status = status;
    },
    deleteCustomer: (state, action) => {
      state.customers = state.customers.filter(c => c.id !== action.payload);
    },

    // Providers Actions
    updateProviderStatus: (state, action) => {
      const { id, status } = action.payload;
      const provider = state.providers.find(p => p.id === id);
      if (provider) {
        provider.status = status;
      }
    },
    verifyProviderDocument: (state, action) => {
      const { id, docType, status } = action.payload;
      const provider = state.providers.find(p => p.id === id);
      if (provider && provider.documents) {
        provider.documents[docType] = status;
      }
    },
    approveProvider: (state, action) => {
      const provider = state.providers.find(p => p.id === action.payload);
      if (provider) {
        provider.status = 'Active';
      }
    },
    rejectProvider: (state, action) => {
      const provider = state.providers.find(p => p.id === action.payload);
      if (provider) {
        provider.status = 'Suspended';
      }
    },
    deleteProvider: (state, action) => {
      state.providers = state.providers.filter(p => p.id !== action.payload);
    },
    assignServiceToProvider: (state, action) => {
      const { id, services } = action.payload;
      const provider = state.providers.find(p => p.id === id);
      if (provider) {
        provider.assignedServices = services;
      }
    },

    // Categories Actions
    saveCategory: (state, action) => {
      const category = action.payload;
      const idx = state.categories.findIndex(c => c.id === category.id);
      if (idx !== -1) {
        state.categories[idx] = category;
      } else {
        state.categories.push(category);
      }
    },
    deleteCategory: (state, action) => {
      state.categories = state.categories.filter(c => c.id !== action.payload);
    },
    toggleCategoryStatus: (state, action) => {
      const category = state.categories.find(c => c.id === action.payload);
      if (category) {
        category.status = category.status === 'Active' ? 'Inactive' : 'Active';
      }
    },

    // Services Actions
    saveService: (state, action) => {
      const service = action.payload;
      if (service.id) {
        const idx = state.services.findIndex(s => s.id === service.id);
        if (idx !== -1) state.services[idx] = service;
      } else {
        service.id = `SERV-${Date.now()}`;
        state.services.push(service);
      }
    },
    deleteService: (state, action) => {
      state.services = state.services.filter(s => s.id !== action.payload);
    },
    toggleServiceStatus: (state, action) => {
      const service = state.services.find(s => s.id === action.payload);
      if (service) {
        service.status = service.status === 'Active' ? 'Inactive' : 'Active';
      }
    },

    // Bookings Actions
    assignBookingProvider: (state, action) => {
      const { bookingId, providerId, providerName } = action.payload;
      const booking = state.bookings.find(b => b.id === bookingId);
      if (booking) {
        booking.providerId = providerId;
        booking.providerName = providerName;
        booking.status = 'Assigned';
        if (!booking.history) booking.history = [];
        booking.history.push({ status: 'Assigned', time: new Date().toLocaleString() });
      }
    },
    updateBookingStatus: (state, action) => {
      const { id, status } = action.payload;
      const booking = state.bookings.find(b => b.id === id);
      if (booking) {
        booking.status = status;
        if (!booking.history) booking.history = [];
        booking.history.push({ status, time: new Date().toLocaleString() });
      }
    },
    cancelBooking: (state, action) => {
      const booking = state.bookings.find(b => b.id === action.payload);
      if (booking) {
        booking.status = 'Cancelled';
        if (!booking.history) booking.history = [];
        booking.history.push({ status: 'Cancelled', time: new Date().toLocaleString() });
      }
    },

    // Banners Actions
    saveBanner: (state, action) => {
      const banner = action.payload;
      if (banner.id) {
        const idx = state.banners.findIndex(b => b.id === banner.id);
        if (idx !== -1) state.banners[idx] = banner;
      } else {
        banner.id = `BAN-${Date.now()}`;
        state.banners.push(banner);
      }
    },
    deleteBanner: (state, action) => {
      state.banners = state.banners.filter(b => b.id !== action.payload);
    },

    // Offers Actions
    saveOffer: (state, action) => {
      const offer = action.payload;
      if (offer.id) {
        const idx = state.offers.findIndex(o => o.id === offer.id);
        if (idx !== -1) state.offers[idx] = offer;
      } else {
        offer.id = `OFF-${Date.now()}`;
        state.offers.push(offer);
      }
    },
    deleteOffer: (state, action) => {
      state.offers = state.offers.filter(o => o.id !== action.payload);
    },
    toggleOfferStatus: (state, action) => {
      const offer = state.offers.find(o => o.id === action.payload);
      if (offer) {
        offer.status = offer.status === 'Active' ? 'Inactive' : 'Active';
      }
    },

    // Reviews Actions
    toggleReviewVisibility: (state, action) => {
      const review = state.reviews.find(r => r.id === action.payload);
      if (review) {
        review.status = review.status === 'Visible' ? 'Hidden' : 'Visible';
      }
    },
    deleteReview: (state, action) => {
      state.reviews = state.reviews.filter(r => r.id !== action.payload);
    },

    // Complaints Actions
    assignComplaint: (state, action) => {
      const { id, assignedTo } = action.payload;
      const complaint = state.complaints.find(c => c.id === id);
      if (complaint) {
        complaint.assignedTo = assignedTo;
        complaint.status = 'In Progress';
      }
    },
    updateComplaintStatus: (state, action) => {
      const { id, status } = action.payload;
      const complaint = state.complaints.find(c => c.id === id);
      if (complaint) {
        complaint.status = status;
      }
    },

    // Locations Actions
    saveLocation: (state, action) => {
      const location = action.payload;
      if (location.id) {
        const idx = state.locations.findIndex(l => l.id === location.id);
        if (idx !== -1) state.locations[idx] = location;
      } else {
        location.id = `LOC-${Date.now()}`;
        state.locations.push(location);
      }
    },
    toggleLocationStatus: (state, action) => {
      const location = state.locations.find(l => l.id === action.payload);
      if (location) {
        location.status = location.status === 'Active' ? 'Inactive' : 'Active';
      }
    },

    // Admins Actions
    saveAdmin: (state, action) => {
      const admin = action.payload;
      if (admin.id) {
        const idx = state.admins.findIndex(a => a.id === admin.id);
        if (idx !== -1) state.admins[idx] = admin;
      } else {
        admin.id = `ADM-${Date.now()}`;
        state.admins.push(admin);
      }
    },
    deleteAdmin: (state, action) => {
      state.admins = state.admins.filter(a => a.id !== action.payload);
    },

    // Settings Actions
    updatePlatformSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload };
    },

    // Notifications Actions
    setNotifications: (state, action) => {
      state.notifications = action.payload;
    },
    addNotification: (state, action) => {
      const notif = {
        id: `NOTIF-${Date.now()}`,
        read: false,
        createdAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
        ...action.payload
      };
      if (!Array.isArray(state.notifications)) state.notifications = [];
      state.notifications.unshift(notif);
    },
    markNotificationRead: (state, action) => {
      if (!Array.isArray(state.notifications)) return;
      if (action.payload === 'all') {
        state.notifications.forEach(n => { n.read = true; });
      } else {
        const notif = state.notifications.find(n => n.id === action.payload);
        if (notif) notif.read = true;
      }
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },

    // Add Audit Log
    addAuditLog: (state, action) => {
      const newLog = {
        id: `LOG-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ipAddress: '192.168.1.100',
        ...action.payload
      };
      state.auditLogs.unshift(newLog);
    }
  }
});

export const {
  setCategories, setProviders, setCustomers, setBookings, setReviews,
  setNotifications, addNotification, markNotificationRead, clearNotifications,
  updateCustomerStatus, deleteCustomer,
  updateProviderStatus, verifyProviderDocument, approveProvider, rejectProvider, deleteProvider, assignServiceToProvider,
  saveCategory, deleteCategory, toggleCategoryStatus,
  saveService, deleteService, toggleServiceStatus,
  assignBookingProvider, updateBookingStatus, cancelBooking,
  saveBanner, deleteBanner,
  saveOffer, deleteOffer, toggleOfferStatus,
  toggleReviewVisibility, deleteReview,
  assignComplaint, updateComplaintStatus,
  saveLocation, toggleLocationStatus,
  saveAdmin, deleteAdmin,
  updatePlatformSettings,
  addAuditLog
} = dataSlice.actions;

export default dataSlice.reducer;
