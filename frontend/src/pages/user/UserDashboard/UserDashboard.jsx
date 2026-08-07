import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../../redux/auth/authSlice';
import Banner from '../../../components/user/Banner/Banner';
import WorkersMapView from '../WorkersMapView/WorkersMapView';
import apiClient from '../../../services/common/api';
import { useToast } from '../../../components/common/ToastProvider';
import RazorpayPaymentModal from '../../../components/user/Payment/RazorpayPaymentModal';
import './UserDashboard.css';

export default function UserDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const user = useSelector((state) => state.auth.user);

  // Main Dashboard Navigation State: 'explore' | 'bookings' | 'profile'
  const [activeMainTab, setActiveMainTab] = useState('explore');
  const [exploreViewMode, setExploreViewMode] = useState('grid'); // 'grid' | 'map'

  // Razorpay Modal State
  const [razorpayModalOpen, setRazorpayModalOpen] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState(null);


  const [savedLocation, setSavedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Customer Bookings State
  const [customerBookings, setCustomerBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingFilterStatus, setBookingFilterStatus] = useState('ALL');

  // Customer Profile Edit Form State
  const [profileName, setProfileName] = useState(user?.name || 'Customer User');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '9876543210');
  const [profileEmail, setProfileEmail] = useState(user?.email || 'customer@easemyhome.com');
  const [profileAddress, setProfileAddress] = useState(user?.address || '');
  const [profileMsg, setProfileMsg] = useState('');

  // Selected Provider Full-Page View State
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [providerActiveTab, setProviderActiveTab] = useState('subservices');
  const [providerSubServices, setProviderSubServices] = useState([]);
  const [loadingSubServices, setLoadingSubServices] = useState(false);
  const [providerPortfolio, setProviderPortfolio] = useState([]);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);
  const [providerReviews, setProviderReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Image Lightbox Preview State
  const [previewImage, setPreviewImage] = useState(null);

  // Booking Request Modal State
  const [bookingSubService, setBookingSubService] = useState(null);
  const [bookingDate, setBookingDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [bookingTimeSlot, setBookingTimeSlot] = useState('10:00 AM - 12:00 PM');
  const [customTime, setCustomTime] = useState('');
  const [bookingAddress, setBookingAddress] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewBookingId, setReviewBookingId] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Report Issue / Problem to Admin Modal State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportBooking, setReportBooking] = useState(null);
  const [selectedIssueType, setSelectedIssueType] = useState("Provider didn't arrive");
  const [reportDescription, setReportDescription] = useState('');
  const [reportImageFiles, setReportImageFiles] = useState([]);
  const [uploadingReportImage, setUploadingReportImage] = useState(false);
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(null);
  const [reportedBookingsMap, setReportedBookingsMap] = useState({});

  // Load user saved location into state & profile
  // Uses per-user key so each account has its own saved address
  useEffect(() => {
    const perUserKey = user?.email ? `user_location_${user.email}` : null;
    // Try per-user key first, fall back to generic key for backward compat
    const rawLoc = (perUserKey && localStorage.getItem(perUserKey))
      || localStorage.getItem('user_location');
    if (rawLoc) {
      try {
        const parsed = JSON.parse(rawLoc);
        setSavedLocation(parsed);
        if (parsed?.address) {
          setBookingAddress(parsed.address);
          setProfileAddress(parsed.address);
        }
      } catch (e) {
        console.error('Failed to parse location:', e);
      }
    }
  }, [user?.email]);

  // Fetch active providers & categories from backend API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem('emh_token') || localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      try {
        const [providersRes, categoriesRes] = await Promise.allSettled([
          fetch('http://localhost:8085/api/admin/providers', { headers }),
          fetch('http://localhost:8085/api/categories', { headers })
        ]);

        if (providersRes.status === 'fulfilled' && providersRes.value.ok) {
          const data = await providersRes.value.json();
          setProviders(data);
        }
        if (categoriesRes.status === 'fulfilled' && categoriesRes.value.ok) {
          const catData = await categoriesRes.value.json();
          setCategories(catData);
        }
      } catch (err) {
        console.warn('Backend API connection error fetching providers/categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  // Helper functions for persistent OTP storage in localStorage
  const saveBookingOtp = (bookingId, otp) => {
    if (!bookingId || !otp) return;
    try {
      const stored = JSON.parse(localStorage.getItem('emh_booking_otps') || '{}');
      const strId = String(bookingId);
      const cleanId = strId.replace(/^PROV-/, '');
      stored[strId] = otp;
      stored[cleanId] = otp;
      localStorage.setItem('emh_booking_otps', JSON.stringify(stored));
    } catch (e) {
      console.error('Failed to save OTP to localStorage', e);
    }
  };

  const getStoredBookingOtp = (bookingId) => {
    if (!bookingId) return null;
    try {
      const stored = JSON.parse(localStorage.getItem('emh_booking_otps') || '{}');
      const strId = String(bookingId);
      const cleanId = strId.replace(/^PROV-/, '');
      return stored[strId] || stored[cleanId] || null;
    } catch (e) {
      return null;
    }
  };

  const clearStoredBookingOtp = (bookingId) => {
    if (!bookingId) return;
    try {
      const stored = JSON.parse(localStorage.getItem('emh_booking_otps') || '{}');
      const strId = String(bookingId);
      const cleanId = strId.replace(/^PROV-/, '');
      delete stored[strId];
      delete stored[cleanId];
      localStorage.setItem('emh_booking_otps', JSON.stringify(stored));
    } catch (e) {
      console.error('Failed to clear OTP from localStorage', e);
    }
  };

  // Helper to extract exact subservice rate from booking
  const getBookingAmount = (b) => {
    if (!b) return 400;
    if (typeof b.amount === 'number' && b.amount > 0) return b.amount;
    if (b.subService && typeof b.subService.price === 'number' && b.subService.price > 0) return b.subService.price;
    if (typeof b.paymentAmount === 'number' && b.paymentAmount > 0) return b.paymentAmount;
    if (typeof b.price === 'number' && b.price > 0) return b.price;
    return 400;
  };

  // Helper function to check if an uncompleted booking already exists for a provider and service
  const checkExistingActiveBooking = (providerId, subServiceName) => {
    if (!customerBookings || customerBookings.length === 0) return null;
    return customerBookings.find(b => {
      const isSameProvider = String(b.providerId) === String(providerId) || (b.provider && String(b.provider.id) === String(providerId));
      const serviceName = (b.serviceType || '').toLowerCase();
      const targetName = (subServiceName || '').toLowerCase();
      const isSameService = serviceName.includes(targetName);
      const statusUpper = String(b.status || '').toUpperCase();
      const isNotCompleted = statusUpper !== 'COMPLETED' && statusUpper !== 'DECLINED' && statusUpper !== 'CANCELLED';
      return isSameProvider && isSameService && isNotCompleted;
    });
  };

  // Fetch Customer Bookings from Backend API
  const fetchCustomerBookings = async () => {
    setLoadingBookings(true);
    try {
      const emailQuery = user?.email ? `?email=${encodeURIComponent(user.email)}` : '';
      const res = await apiClient.get(`/bookings/customer${emailQuery}`);
      if (res.status === 200 && Array.isArray(res.data)) {
        setCustomerBookings(prev => {
          const backendData = res.data;
          const backendIds = new Set(backendData.map(b => String(b.id)));
          const mergedBackend = backendData.map(b => {
            const existing = prev.find(p => String(p.id).replace(/^PROV-/, '') === String(b.id).replace(/^PROV-/, ''));
            const storedOtp = getStoredBookingOtp(b.id);
            let otp = b.completionOtp || existing?.completionOtp || storedOtp || null;
            
            const isClosed = ['COMPLETED', 'DECLINED', 'CANCELLED'].includes(String(b.status).toUpperCase());
            if (isClosed) {
              clearStoredBookingOtp(b.id);
              otp = null;
            } else if (otp) {
              saveBookingOtp(b.id, otp);
            }

            return {
              ...b,
              providerEmail: b.provider?.email || b.providerEmail || 'provider@easemyhome.com',
              completionOtp: otp
            };
          });
          const localOnly = prev.filter(p => !backendIds.has(String(p.id)));
          return [...mergedBackend, ...localOnly];
        });
      }
    } catch (err) {
      console.warn('Customer bookings fetch error:', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  const syncReportedBookings = () => {
    try {
      const storedComplaints = JSON.parse(localStorage.getItem('emh_complaints') || '[]');
      const map = {};
      storedComplaints.forEach(ticket => {
        if (ticket.bookingId) {
          map[ticket.bookingId] = ticket;
        }
      });
      setReportedBookingsMap(map);
    } catch (e) {}
  };

  useEffect(() => {
    syncReportedBookings();
    window.addEventListener('storage', syncReportedBookings);
    return () => window.removeEventListener('storage', syncReportedBookings);
  }, []);

  useEffect(() => {
    if (user?.email || activeMainTab === 'bookings') {
      fetchCustomerBookings();
    }
  }, [user?.email, activeMainTab]);

  // Handle Customer Accept Rescheduled Request
  const handleAcceptReschedule = async (bookingId) => {
    try {
      const res = await apiClient.put(`/bookings/${bookingId}/accept`);
      if (res.status === 200) {
        showToast('Rescheduled time accepted! Your booking is now confirmed.', 'success');
        fetchCustomerBookings();
      } else {
        showToast('Failed to accept rescheduled request.', 'error');
      }
    } catch (err) {
      showToast('Network error accepting rescheduled request.', 'error');
    }
  };

  // Review Tracking Helpers
  const getStoredReviewedBookings = () => {
    try {
      const key = user?.email ? `reviewed_bookings_${user.email}` : 'reviewed_bookings';
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  };

  const markBookingAsReviewedLocally = (bookingId) => {
    try {
      const key = user?.email ? `reviewed_bookings_${user.email}` : 'reviewed_bookings';
      const list = getStoredReviewedBookings();
      if (!list.includes(bookingId) && !list.includes(String(bookingId))) {
        list.push(bookingId);
        localStorage.setItem(key, JSON.stringify(list));
      }
    } catch (e) {}
  };

  const isBookingReviewed = (b) => {
    if (!b) return false;
    if (b.isReviewed || b.reviewed) return true;
    const storedList = getStoredReviewedBookings();
    return storedList.includes(b.id) || storedList.includes(String(b.id)) || storedList.includes(Number(b.id));
  };

  const openReviewModal = (bookingId) => {
    setReviewBookingId(bookingId);
    setReviewRating(5);
    setReviewHoverRating(0);
    setReviewComment('');
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async () => {
    try {
      setSubmittingReview(true);
      const newReview = {
        id: Math.floor(1000 + Math.random() * 9000),
        bookingId: reviewBookingId,
        customerName: profileName || user?.name || 'Customer',
        providerName: 'Assigned Partner',
        rating: reviewRating,
        comment: reviewComment,
        date: new Date().toISOString().split('T')[0],
        status: 'Visible'
      };

      try {
        const storedReviews = JSON.parse(localStorage.getItem('emh_reviews') || '[]');
        localStorage.setItem('emh_reviews', JSON.stringify([newReview, ...storedReviews]));
      } catch (e) {}

      const res = await apiClient.post('/reviews', {
        bookingId: reviewBookingId,
        rating: reviewRating,
        comment: reviewComment
      });

      showToast('Thank you! Your review has been submitted.', 'success');
      markBookingAsReviewedLocally(reviewBookingId);
      setCustomerBookings(prev => prev.map(b => b.id === reviewBookingId ? { ...b, isReviewed: true, reviewed: true } : b));
      setReviewModalOpen(false);
    } catch (err) {
      showToast('Thank you! Your review has been recorded locally.', 'success');
      markBookingAsReviewedLocally(reviewBookingId);
      setCustomerBookings(prev => prev.map(b => b.id === reviewBookingId ? { ...b, isReviewed: true, reviewed: true } : b));
      setReviewModalOpen(false);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Handle Customer Decline/Reject Rescheduled Request
  const handleDeclineReschedule = async (bookingId) => {
    try {
      const res = await apiClient.put(`/bookings/${bookingId}/decline`);
      if (res.status === 200) {
        showToast('Booking request cancelled.', 'info');
        setCustomerBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'DECLINED' } : b));
        fetchCustomerBookings();
      } else {
        showToast('Failed to decline rescheduled request.', 'error');
      }
    } catch (err) {
      console.warn('Backend API error declining booking, updating state locally:', err);
      // Fallback: update status locally so UI reflects cancelled status immediately
      setCustomerBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'DECLINED' } : b));
      showToast('Booking request cancelled.', 'info');
    }
  };

  // Open Full-Page Provider View & fetch sub-services
  const handleOpenProviderModal = async (provider) => {
    setSelectedProvider(provider);
    setProviderActiveTab('subservices');
    setLoadingSubServices(true);
    setLoadingPortfolio(true);

    const fetchSubServices = async () => {
      try {
        const res = await fetch(`http://localhost:8085/api/providers/${provider.id}/services`);
        if (res.ok) {
          setProviderSubServices(await res.json());
        } else {
          setProviderSubServices([]);
        }
      } catch (e) {
        setProviderSubServices([]);
      }
      setLoadingSubServices(false);
    };


    const fetchPortfolio = async () => {
      try {
        const res = await fetch(`http://localhost:8085/api/provider/portfolio/${provider.id}`);
        if (res.ok) {
          setProviderPortfolio(await res.json());
        } else {
          setProviderPortfolio([]);
        }
      } catch (e) {
        setProviderPortfolio([]);
      }
      setLoadingPortfolio(false);
    };

    const fetchReviews = async () => {
      setLoadingReviews(true);
      try {
        const res = await fetch(`http://localhost:8085/api/reviews/provider/${provider.id}`);
        if (res.ok) {
          setProviderReviews(await res.json());
        } else {
          setProviderReviews([]);
        }
      } catch (e) {
        setProviderReviews([]);
      }
      setLoadingReviews(false);
    };

    fetchSubServices();
    fetchPortfolio();
    fetchReviews();
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const firstName = profileName?.split(' ')[0] || user?.name?.split(' ')[0] || 'Customer';

  // Haversine formula to compute geographical distance in km between customer and provider coordinates
  const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
    if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined || lat1 === null || lon1 === null || lat2 === null || lon2 === null) {
      return null;
    }
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const userLat = savedLocation?.latitude || user?.latitude || 19.0596;
  const userLng = savedLocation?.longitude || user?.longitude || 72.8295;

  // Filter Active Providers based on search query & category
  const activeWorkers = providers.map(p => {
    let distance = null;
    if (p.latitude && p.longitude && userLat && userLng) {
      distance = calculateDistanceKm(userLat, userLng, parseFloat(p.latitude), parseFloat(p.longitude));
    } else {
      const id = p.id || 1;
      distance = 0.6 + ((id * 2.7) % 4.2); // synthetic distance between 0.6 and 4.8 km
    }
    return {
      ...p,
      calculatedDistanceKm: distance ? distance.toFixed(1) : '1.5',
      numericDistanceKm: distance || 1.5
    };
  }).filter(p => {
    const isActive = (p.status === 'Active' || p.status === 'Approved' || !p.status);
    const matchesCategory = selectedCategory === 'All' || (p.serviceType && p.serviceType.trim().toLowerCase() === selectedCategory.trim().toLowerCase());
    
    const query = searchQuery.toLowerCase().trim();
    const matchesName = p.name?.toLowerCase().includes(query);
    const matchesService = p.serviceType?.toLowerCase().includes(query);
    const matchesSubServices = p.subServicesList ? p.subServicesList.some(sub => sub.name.toLowerCase().includes(query)) : false;
    const matchesBio = p.bio?.toLowerCase().includes(query);

    const matchesSearch = !query || matchesName || matchesService || matchesSubServices || matchesBio;

    return isActive && matchesCategory && matchesSearch;
  });



  // Open Booking Request Modal for a specific sub-service
  const handleInitiateBooking = (subService) => {
    const existing = checkExistingActiveBooking(selectedProvider?.id, subService.name);
    if (existing) {
      showToast(`Service "${subService.name}" is already booked (#EMH-${existing.id}, Status: ${existing.status}). Redirecting to your active booking...`, 'warning');
      setBookingSubService(null);
      setSelectedProvider(null);
      setBookingFilterStatus('ALL');
      setActiveMainTab('bookings');
      return;
    }
    setBookingSubService(subService);
    setBookingSuccess(null);
    setBookingAddress(profileAddress || savedLocation?.address || '123 Main Street, Sector 4, City');
  };

  // Submit Booking Request to Backend API
  const handleConfirmBookingRequest = async (e) => {
    e.preventDefault();

    const existing = checkExistingActiveBooking(selectedProvider?.id, bookingSubService?.name);
    if (existing) {
      showToast(`Service "${bookingSubService?.name}" is already booked (#EMH-${existing.id}, Status: ${existing.status}). Redirecting to your active booking...`, 'warning');
      setBookingSubService(null);
      setSelectedProvider(null);
      setBookingFilterStatus('ALL');
      setActiveMainTab('bookings');
      return;
    }

    setSubmittingBooking(true);

    const selectedTime = customTime.trim() || bookingTimeSlot;

    const payload = {
      customerName: profileName || user?.name || 'Customer',
      customerPhone: profilePhone || user?.phone || '9876543210',
      customerEmail: profileEmail || user?.email || 'customer@easemyhome.com',
      address: bookingAddress,
      serviceType: `${selectedProvider.name} - ${bookingSubService.name}`,
      bookingDate: bookingDate,
      bookingTime: selectedTime,
      providerId: selectedProvider.id,
      subServiceId: bookingSubService.id,   // ← send subservice ID so backend reads the correct price
      providerEmail: selectedProvider.email || 'provider@easemyhome.com',
      notes: bookingNotes
    };

    try {
      const res = await apiClient.post('/bookings', payload);

      if (res.status === 200 || res.status === 201) {
        const savedData = res.data;
        const formattedBooking = {
          ...payload,
          ...savedData,
          providerEmail: payload.providerEmail,
          status: savedData.status || 'PENDING'
        };
        setBookingSuccess(formattedBooking);
        setCustomerBookings(prev => [formattedBooking, ...prev.filter(b => b.id !== formattedBooking.id)]);
        fetchCustomerBookings(); // Refresh bookings list in background
      } else {
        const demoRes = {
          id: Math.floor(100000 + Math.random() * 900000),
          ...payload,
          amount: bookingSubService?.price || 400,
          subService: bookingSubService ? { id: bookingSubService.id, name: bookingSubService.name, price: bookingSubService.price } : null,
          status: 'PENDING'
        };
        setBookingSuccess(demoRes);
        setCustomerBookings(prev => [demoRes, ...prev]);
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.message || 'Service is already booked or server error occurred.';
      if (err?.response?.status === 400 && errorMsg.includes('already booked')) {
        showToast(errorMsg, 'warning');
        setBookingSubService(null);
        setSelectedProvider(null);
        setBookingFilterStatus('ALL');
        setActiveMainTab('bookings');
      } else {
        console.warn('Booking API endpoint error, generating demo confirmation:', err);
        const demoRes = {
          id: Math.floor(100000 + Math.random() * 900000),
          ...payload,
          amount: bookingSubService?.price || 400,
          subService: bookingSubService ? { id: bookingSubService.id, name: bookingSubService.name, price: bookingSubService.price } : null,
          status: 'PENDING'
        };
        setBookingSuccess(demoRes);
        setCustomerBookings(prev => [demoRes, ...prev]);
      }
    } finally {
      setSubmittingBooking(false);
    }
  };

  // Open Report Problem Modal for a specific booking
  const handleOpenReportModal = (booking) => {
    setReportBooking(booking);
    setSelectedIssueType("Provider didn't arrive");
    setReportDescription('');
    setReportImageFiles([]);
    setReportSuccess(null);
    setReportModalOpen(true);
  };

  // Upload image for report (supports local upload endpoint with Base64 fallback)
  const handleReportImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploadingReportImage(true);

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('http://localhost:8085/api/upload', {
          method: 'POST',
          body: formData
        });
        if (res.ok) {
          const data = await res.json();
          if (data.url) {
            setReportImageFiles(prev => [...prev, { url: data.url, name: file.name }]);
            continue;
          }
        }
      } catch (err) {
        console.warn('Backend image upload failed, falling back to base64 reader:', err);
      }

      // Base64 fallback reader
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setReportImageFiles(prev => [...prev, { url: uploadEvent.target.result, name: file.name }]);
      };
      reader.readAsDataURL(file);
    }
    setUploadingReportImage(false);
  };

  const handleRemoveReportImage = (index) => {
    setReportImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Submit Report Complaint to Backend Admin API
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!reportDescription.trim()) return;

    setSubmittingReport(true);
    const imageUrlsString = reportImageFiles.map(img => img.url).join(',');

    const payload = {
      title: `[${selectedIssueType}] Problem reported for Booking #EMH-${reportBooking.id}`,
      description: reportDescription.trim(),
      userName: profileName || user?.name || 'Customer User',
      userEmail: profileEmail || user?.email || 'customer@easemyhome.com',
      userRole: 'CUSTOMER',
      bookingId: String(reportBooking.id),
      issueType: selectedIssueType,
      imageUrls: imageUrlsString,
      bookingCompletedAt: reportBooking.bookingDate || new Date().toISOString().split('T')[0],
      serviceType: reportBooking.serviceType || 'Home Service'
    };

    try {
      const res = await fetch('http://localhost:8085/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      let savedData;
      if (res.ok) {
        savedData = await res.json();
      } else {
        savedData = {
          ticketId: `CMP-${Math.floor(100 + Math.random() * 900)}`,
          ...payload,
          status: 'Open',
          createdAt: new Date().toISOString()
        };
      }

      setReportSuccess(savedData);
      setReportedBookingsMap(prev => ({
        ...prev,
        [reportBooking.id]: savedData
      }));

      try {
        const stored = JSON.parse(localStorage.getItem('emh_complaints') || '[]');
        localStorage.setItem('emh_complaints', JSON.stringify([savedData, ...stored]));
      } catch (e) {}
    } catch (err) {
      console.warn('Complaint submit API error, creating demo complaint ticket:', err);
      const fallbackTicket = {
        ticketId: `CMP-${Math.floor(100 + Math.random() * 900)}`,
        ...payload,
        status: 'Open',
        createdAt: new Date().toISOString()
      };
      setReportSuccess(fallbackTicket);
      setReportedBookingsMap(prev => ({
        ...prev,
        [reportBooking.id]: fallbackTicket
      }));

      try {
        const stored = JSON.parse(localStorage.getItem('emh_complaints') || '[]');
        localStorage.setItem('emh_complaints', JSON.stringify([fallbackTicket, ...stored]));
      } catch (e) {}
    } finally {
      setSubmittingReport(false);
    }
  };

  // Save Customer Profile Form
  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfileMsg('✅ Profile information updated successfully!');
    setTimeout(() => setProfileMsg(''), 4000);
  };

  const timeSlots = [
    '09:00 AM - 11:00 AM',
    '11:00 AM - 01:00 PM',
    '02:00 PM - 04:00 PM',
    '04:00 PM - 06:00 PM',
    '06:00 PM - 08:00 PM'
  ];

  // Filtered Bookings for My Bookings Tab
  const filteredBookings = customerBookings.filter(b => {
    if (bookingFilterStatus === 'ALL') return true;
    return b.status?.toUpperCase() === bookingFilterStatus;
  });

  return (
    <div className="simple-user-dashboard">
      {/* 1. E-COMMERCE TOP HEADER BAR */}
      <header className="dash-header">
        <div className="header-brand">
          <span className="brand-logo-icon">🏠</span>
          <span className="brand-name">EaseMyHome</span>
        </div>

        {/* E-Commerce Center Tabs Navigation */}
        <nav className="header-center-nav">
          <button 
            className={`nav-tab-btn ${activeMainTab === 'explore' ? 'active' : ''}`}
            onClick={() => setActiveMainTab('explore')}
          >
            🛍️ Explore Services
          </button>
          <button 
            className={`nav-tab-btn ${activeMainTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveMainTab('bookings')}
          >
            📦 My Bookings
            {customerBookings.length > 0 && (
              <span className="nav-badge-count">{customerBookings.length}</span>
            )}
          </button>
          <button 
            className={`nav-tab-btn ${activeMainTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveMainTab('profile')}
          >
            👤 My Account
          </button>
        </nav>

        {/* Delivery Location Badge */}
        <div className="location-selector-badge" onClick={() => navigate('/user/select-location')}>
          <span className="loc-icon">📍</span>
          <div className="loc-info">
            <small>Deliver To</small>
            <strong>{savedLocation?.address ? `${savedLocation.address.substring(0, 24)}...` : 'Select Location'}</strong>
          </div>
          <span className="loc-edit-btn">Edit ✏️</span>
        </div>

        <div className="header-user-actions">
          <span className="user-welcome">Hi, <strong>{firstName}</strong></span>
          <button className="btn-signout" onClick={handleLogout}>Sign Out</button>
        </div>
      </header>

      {/* Rescheduled Booking Notification Alert Banner */}
      {customerBookings.some(b => b.status === 'RESCHEDULED') && (
        <div className="reschedule-notification-alert-bar">
          <div className="alert-content-wrap">
            <span className="alert-bell-icon">🔔</span>
            <span>
              <strong>Reschedule Alert:</strong> You have {customerBookings.filter(b => b.status === 'RESCHEDULED').length} booking request(s) rescheduled by the provider. Please review the updated time slot.
            </span>
          </div>
          <button 
            className="btn-go-to-rescheduled"
            onClick={() => {
              setActiveMainTab('bookings');
              setBookingFilterStatus('RESCHEDULED');
            }}
          >
            View Rescheduled Request →
          </button>
        </div>
      )}

      {/* 2. MAIN DASHBOARD CONTENT */}
      <main className="dash-main-container">
        
        {/* =========================================================================
           TAB 1: EXPLORE SERVICES (MAIN CATALOG & WORKERS GRID)
           ========================================================================= */}
        {activeMainTab === 'explore' && (
          <div className="main-tab-content">
            <Banner />
            {/* Top Banner: Active Workers Summary */}
            <section className="workers-banner-card">
              <div className="banner-left">
                <span className="live-status-pill">
                  {exploreViewMode === 'map' && !searchQuery 
                    ? '🟢 Live Verified Workers • 📍 Nearest Partners (10 km Radius)' 
                    : '🟢 Live Verified Workers • All Available Partners'}
                </span>
                <h1>
                  {exploreViewMode === 'map' && !searchQuery 
                    ? `${activeWorkers.length} Nearest Service Partners (10 km)` 
                    : `${activeWorkers.length} Active Service Partners Available`}
                </h1>
                <p>
                  {exploreViewMode === 'map' && !searchQuery 
                    ? `Showing verified service partners within 10 km radius of ${savedLocation?.address ? savedLocation.address.substring(0, 30) + '...' : 'your area'}. Switch to Grid View or search to see all partners.`
                    : 'Browse all active service providers, search sub-services or worker names, and click any provider card to view full profile & book.'}
                </p>
              </div>


              <div className="banner-right">
                <div className="workers-avatar-stack">
                  {activeWorkers.slice(0, 4).map((w, idx) => (
                    <img key={w.id || idx} src={w.selfieImage || `https://i.pravatar.cc/100?img=${idx + 10}`} alt={w.name} />
                  ))}
                  {activeWorkers.length > 4 && <div className="avatar-more">+{activeWorkers.length - 4}</div>}
                </div>
              </div>
            </section>

            {/* Category Selector Section */}
            <section className="section-block">
              <h2 className="section-heading">1. Select Category</h2>
              <div className="categories-scroll-wrapper">
                <button 
                  className={`cat-btn ${selectedCategory === 'All' ? 'selected' : ''}`}
                  onClick={() => setSelectedCategory('All')}
                >
                  <span className="cat-icon">✨</span>
                  <span>All Categories</span>
                </button>
                {categories.map((cat) => (
                  <button 
                    key={cat.id || cat.name}
                    className={`cat-btn ${selectedCategory === (cat.name || cat.id) ? 'selected' : ''}`}
                    onClick={() => setSelectedCategory(cat.name || cat.id)}
                  >
                    <span className="cat-icon">{cat.image?.length < 5 ? cat.image : '🛠️'}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Multi-Filter Search Bar */}
            <section className="section-block">
              <h2 className="section-heading">2. Search Workers or Sub-Services</h2>
              <div className="dashboard-search-bar">
                <span className="search-lens">🔍</span>
                <input 
                  type="text" 
                  placeholder="Search by worker name, category (e.g. Plumbing), or sub-service (e.g. Tap Repair, Sofa Cleaning)..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button className="clear-search-btn" onClick={() => setSearchQuery('')}>✕ Clear</button>
                )}
              </div>
            </section>

            {/* Active Workers Section */}
            <section className="section-block">
              <div className="section-title-row">
                <div className="title-with-filter">
                  <h2 className="section-heading">Available Workers ({activeWorkers.length})</h2>
                  {selectedCategory !== 'All' && (
                    <span className="active-filter-tag">Filter: {selectedCategory}</span>
                  )}
                </div>

                {/* View Mode Toggle (Grid vs Live Map View) */}
                <div className="view-mode-toggle-pills">
                  <button 
                    type="button" 
                    className={`view-mode-btn ${exploreViewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setExploreViewMode('grid')}
                  >
                    📱 Grid View
                  </button>
                  <button 
                    type="button" 
                    className={`view-mode-btn ${exploreViewMode === 'map' ? 'active' : ''}`}
                    onClick={() => setExploreViewMode('map')}
                  >
                    🗺️ Live Map View ({activeWorkers.length})
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="dash-loading-state">
                  <div className="spinner"></div>
                  <p>Finding active workers in your area...</p>
                </div>
              ) : activeWorkers.length === 0 ? (
                <div className="no-workers-box">
                  <div className="empty-icon">👷‍♂️</div>
                  <h3>No Workers Found</h3>
                  <p>No active workers matched your search filter "{searchQuery}". Try selecting a different category or clearing the search query.</p>
                  <button className="btn-reset-filters" onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}>Reset Filters</button>
                </div>
              ) : exploreViewMode === 'map' ? (
                <WorkersMapView 
                  activeWorkers={activeWorkers}
                  userLocation={savedLocation}
                  onSelectWorker={handleOpenProviderModal}
                  selectedCategory={selectedCategory}
                />
              ) : (
                <div className="workers-grid">

                  {activeWorkers.map((worker) => (
                    <div 
                      key={worker.id} 
                      className="worker-card clickable-card"
                      onClick={() => handleOpenProviderModal(worker)}
                    >
                      <div className="worker-card-header">
                        <img 
                          src={worker.selfieImage || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=200&q=80'} 
                          alt={worker.name} 
                          className="worker-avatar"
                        />
                        <div className="worker-main-info">
                          <span className="status-online">● Available Now</span>
                          <h3 className="worker-name">{worker.name}</h3>
                          <span className="worker-service-badge">{worker.serviceType || 'General Partner'}</span>
                        </div>
                      </div>

                      <div className="worker-details">
                        <div className="detail-chip">
                          <span>📍 Distance</span>
                          <strong>{worker.calculatedDistanceKm} km away</strong>
                        </div>
                        <div className="detail-chip">
                          <span>💼 Experience</span>
                          <strong>{worker.experience || 2}+ Years</strong>
                        </div>
                        <div className="detail-chip">
                          <span>⭐ Rating</span>
                          <strong>4.9 / 5.0</strong>
                        </div>
                      </div>


                      {worker.bio && (
                        <p className="worker-bio">"{worker.bio.substring(0, 80)}..."</p>
                      )}

                      <div className="view-profile-prompt">
                        <span>View Profile, Portfolio & Sub-Services →</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* =========================================================================
           TAB 2: MY BOOKINGS (MY ORDERS & SERVICE REQUESTS)
           ========================================================================= */}
        {activeMainTab === 'bookings' && (
          <div className="main-tab-content">
            <div className="bookings-section-header">
              <div>
                <h2>📦 My Booking Requests & Orders</h2>
                <p>Track your active home service requests, scheduled time slots, and provider status.</p>
              </div>

              {/* Status Filter Sub-Bar */}
              <div className="booking-status-filter-pills">
                <button 
                  className={`status-pill-btn ${bookingFilterStatus === 'ALL' ? 'active' : ''}`}
                  onClick={() => setBookingFilterStatus('ALL')}
                >
                  All ({customerBookings.length})
                </button>
                <button 
                  className={`status-pill-btn ${bookingFilterStatus === 'PENDING' ? 'active' : ''}`}
                  onClick={() => setBookingFilterStatus('PENDING')}
                >
                  ⏳ Pending
                </button>
                <button 
                  className={`status-pill-btn ${bookingFilterStatus === 'RESCHEDULED' ? 'active' : ''}`}
                  onClick={() => setBookingFilterStatus('RESCHEDULED')}
                >
                  🔄 Rescheduled ({customerBookings.filter(b => b.status === 'RESCHEDULED').length})
                </button>
                <button 
                  className={`status-pill-btn ${bookingFilterStatus === 'ACCEPTED' ? 'active' : ''}`}
                  onClick={() => setBookingFilterStatus('ACCEPTED')}
                >
                  ✅ Confirmed
                </button>
                <button 
                  className={`status-pill-btn ${bookingFilterStatus === 'COMPLETED' ? 'active' : ''}`}
                  onClick={() => setBookingFilterStatus('COMPLETED')}
                >
                  🎉 Completed
                </button>
              </div>
            </div>

            {loadingBookings ? (
              <div className="dash-loading-state">
                <div className="spinner"></div>
                <p>Loading your service bookings...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="empty-bookings-box">
                <div className="empty-box-icon">📋</div>
                <h3>No Booking Requests Found</h3>
                <p>You haven't placed any booking requests under this filter yet. Explore services and book a partner!</p>
                <button className="btn-explore-now" onClick={() => setActiveMainTab('explore')}>
                  Explore Services & Book Now →
                </button>
              </div>
            ) : (
              <div className="bookings-cards-grid">
                {filteredBookings.map((b) => (
                  <div key={b.id} className="booking-order-card">
                    <div className="order-card-header">
                      <div>
                        <span className="order-ref-badge">Booking Ref #EMH-{b.id}</span>
                        <h3 className="order-service-name">{b.serviceType}</h3>
                      </div>
                      <span className={`order-status-tag status-${b.status?.toLowerCase()}`}>
                        {b.status === 'ACCEPTED' 
                          ? '✅ CONFIRMED' 
                          : b.status === 'ON_THE_WAY'
                          ? '🚗 PROVIDER ON THE WAY'
                          : b.status === 'ARRIVED'
                          ? '📍 PROVIDER ARRIVED'
                          : b.status === 'IN_PROGRESS'
                          ? '⚡ WORK IN PROGRESS'
                          : b.status === 'WORK_COMPLETED'
                          ? '🛠️ WORK COMPLETED (PAYMENT PENDING)'
                          : b.status === 'PENDING' 
                          ? '⏳ PENDING APPROVAL' 
                          : b.status === 'RESCHEDULED'
                          ? '🔄 RESCHEDULED BY PROVIDER'
                          : b.status === 'DECLINED'
                          ? '❌ DECLINED'
                          : b.status === 'COMPLETED' 
                          ? '🎉 COMPLETED & PAID' 
                          : b.status || 'PENDING'}
                      </span>
                    </div>

                    <div className="order-details-body">
                      <div className="order-info-col">
                        <span>📅 Service Date</span>
                        <strong>{b.bookingDate || 'Scheduled Date'}</strong>
                      </div>
                      <div className="order-info-col">
                        <span>⏰ Time Slot</span>
                        <strong>{b.bookingTime || 'Scheduled Time'}</strong>
                      </div>
                      <div className="order-info-col">
                        <span>📍 Delivery Address</span>
                        <strong>{b.address || 'User Address'}</strong>
                      </div>
                      <div className="order-info-col">
                        <span>👷 Service Provider</span>
                        <strong>{b.provider?.name || b.providerName || 'EaseMyHome Partner'}</strong>
                      </div>
                      <div className="order-info-col">
                        <span>📞 Provider Phone</span>
                        <strong>
                          {b.provider?.phone ? (
                            <a href={`tel:${b.provider.phone}`} style={{ color: '#2563eb', fontWeight: 800, textDecoration: 'none' }}>
                              📞 {b.provider.phone}
                            </a>
                          ) : b.providerPhone ? (
                            <a href={`tel:${b.providerPhone}`} style={{ color: '#2563eb', fontWeight: 800, textDecoration: 'none' }}>
                              📞 {b.providerPhone}
                            </a>
                          ) : (
                            'Contact Assigned'
                          )}
                        </strong>
                      </div>
                      <div className="order-info-col">
                        <span>✉️ Provider Email</span>
                        <strong>{b.provider?.email || b.providerEmail || 'provider@easemyhome.com'}</strong>
                      </div>
                      <div className="order-info-col">
                        <span>💰 Service Amount</span>
                        <strong style={{ color: '#16a34a', fontWeight: 850 }}>₹{getBookingAmount(b)}</strong>
                      </div>
                    </div>

                    {b.status === 'RESCHEDULED' && (
                      <div className="rescheduled-card-notice">
                        ⚠️ <strong>Provider Proposed New Schedule:</strong> The service provider updated the date to <strong>{b.bookingDate}</strong> at <strong>{b.bookingTime}</strong>. Please accept or reject this new time slot.
                      </div>
                    )}

                    {['ACCEPTED', 'ASSIGNED', 'CONFIRMED', 'ON THE WAY', 'ON_THE_WAY', 'ARRIVED', 'STARTED'].includes(String(b.status || '').toUpperCase()) && (b.completionOtp || getStoredBookingOtp(b.id)) && (
                      <div className="otp-display-box">
                        <div className="otp-box-header">
                          <span className="otp-lock-icon">🔐</span>
                          <span>Your Service Start OTP</span>
                        </div>
                        <div className="otp-code-value">{b.completionOtp || getStoredBookingOtp(b.id)}</div>
                        <p className="otp-instruction">Share this 6-digit OTP with the service provider when they arrive at your location to start the job.</p>
                      </div>
                    )}

                    {b.notes && (
                      <div className="order-notes-bar">
                        <span>📝 Special Note: "{b.notes}"</span>
                      </div>
                    )}

                    <div className="order-card-footer">
                      <span className="order-guarantee-text">🔒 EaseMyHome Service Guarantee</span>
                      
                      <div className="order-footer-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {['ACCEPTED', 'CONFIRMED', 'ASSIGNED', 'ON THE WAY', 'ARRIVED', 'IN_PROGRESS', 'WORK_COMPLETED', 'STARTED', 'COMPLETED'].includes(String(b.status || '').toUpperCase()) && (
                          reportedBookingsMap[b.id] ? (
                            reportedBookingsMap[b.id].status === 'Resolved' ? (
                              <div className="reported-status-badge resolved-badge" style={{ backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #86efac', padding: '6px 12px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '2px', maxWidth: '280px' }}>
                                <span style={{ fontWeight: 800, fontSize: '0.8rem' }}>✅ Action Taken ({reportedBookingsMap[b.id].ticketId})</span>
                                <small style={{ fontSize: '0.72rem', fontStyle: 'italic' }}>{reportedBookingsMap[b.id].adminResponse || 'Complaint investigated & resolved by Admin'}</small>
                              </div>
                            ) : reportedBookingsMap[b.id].status === 'False Complaint' ? (
                              <div className="reported-status-badge false-badge" style={{ backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5', padding: '6px 12px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '2px', maxWidth: '280px' }}>
                                <span style={{ fontWeight: 800, fontSize: '0.8rem' }}>❌ Dismissed: False Complaint ({reportedBookingsMap[b.id].ticketId})</span>
                                <small style={{ fontSize: '0.72rem', fontStyle: 'italic' }}>{reportedBookingsMap[b.id].adminResponse || 'Dismissed: Invalid / False Complaint'}</small>
                              </div>
                            ) : (
                              <div className="reported-status-badge pending-badge" style={{ backgroundColor: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '6px 12px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '2px', maxWidth: '280px' }}>
                                <span style={{ fontWeight: 800, fontSize: '0.8rem' }}>⚠️ Complaint Filed ({reportedBookingsMap[b.id].ticketId})</span>
                                <small style={{ fontSize: '0.72rem' }}>Status: {reportedBookingsMap[b.id].status || 'Open'} • Admin reviewing</small>
                              </div>
                            )
                          ) : (
                            <button 
                              type="button"
                              className="btn-report-issue"
                              onClick={() => handleOpenReportModal(b)}
                              title="Report an issue with this booking to EaseMyHome Admin"
                            >
                              ⚠️ Report Issue
                            </button>
                          )
                        )}

                        {b.status === 'RESCHEDULED' ? (
                          <div className="reschedule-action-buttons">
                            <button 
                              className="btn-accept-reschedule"
                              onClick={() => handleAcceptReschedule(b.id)}
                            >
                              Accept New Schedule ✓
                            </button>
                            <button 
                              className="btn-decline-reschedule"
                              onClick={() => handleDeclineReschedule(b.id)}
                            >
                              Reject Request ✕
                            </button>
                          </div>
                        ) : b.status === 'PENDING' ? (
                          <button 
                            className="btn-cancel-booking-request"
                            onClick={() => handleDeclineReschedule(b.id)}
                          >
                            Cancel Request
                          </button>
                        ) : (b.status === 'WORK_COMPLETED' || b.status === 'COMPLETED') ? (
                          <>
                            {!isBookingReviewed(b) ? (
                              <button 
                                type="button"
                                className="btn-leave-review"
                                onClick={() => openReviewModal(b.id)}
                              >
                                Leave a Review ⭐️
                              </button>
                            ) : (
                              <span className="review-submitted-badge" style={{ color: '#059669', backgroundColor: '#d1fae5', padding: '6px 12px', borderRadius: '16px', fontWeight: 800, fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                ✓ Reviewed ⭐
                              </span>
                            )}

                            {b.paymentStatus !== 'SUCCESS' && b.status !== 'COMPLETED' ? (
                              <button
                                type="button"
                                style={{ backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                                onClick={() => {
                                  setSelectedBookingForPayment(b);
                                  setRazorpayModalOpen(true);
                                }}
                              >
                                Pay ₹{getBookingAmount(b)} via Razorpay 💳
                              </button>
                            ) : (
                              <span style={{ color: '#15803d', backgroundColor: '#dcfce7', padding: '6px 12px', borderRadius: '16px', fontWeight: 800, fontSize: '0.75rem' }}>
                                Paid via Razorpay (₹{getBookingAmount(b)}) ✓
                              </span>
                            )}
                          </>
                        ) : null}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
           TAB 3: MY ACCOUNT & PROFILE
           ========================================================================= */}
        {activeMainTab === 'profile' && (
          <div className="main-tab-content">
            <div className="profile-container-grid">
              
              {/* Left Profile Avatar Summary Card */}
              <div className="profile-left-card">
                <div className="avatar-large-circle">
                  {profileName.charAt(0).toUpperCase()}
                </div>
                <h2>{profileName}</h2>
                <span className="user-role-badge">Verified Customer</span>
                <p className="profile-email-text">{profileEmail}</p>
                <div className="profile-stats-list">
                  <div className="p-stat-item">
                    <span>Total Bookings</span>
                    <strong>{customerBookings.length}</strong>
                  </div>
                  <div className="p-stat-item">
                    <span>Account Status</span>
                    <strong className="status-active-txt">🟢 Active</strong>
                  </div>
                </div>
              </div>

              {/* Right Profile Details Form */}
              <div className="profile-right-card">
                <h2>Account Details & Settings</h2>
                <p className="subtitle">Update your contact details and default delivery address for home services.</p>

                {profileMsg && (
                  <div className="profile-success-alert">{profileMsg}</div>
                )}

                <form onSubmit={handleSaveProfile} className="profile-edit-form">
                  <div className="form-row-2col">
                    <div className="form-group-block">
                      <label className="field-label">Full Name</label>
                      <input 
                        type="text" 
                        className="dash-input-text" 
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group-block">
                      <label className="field-label">Phone Number</label>
                      <input 
                        type="tel" 
                        className="dash-input-text" 
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group-block">
                    <label className="field-label">Email Address (Account ID)</label>
                    <input 
                      type="email" 
                      className="dash-input-text disabled-field" 
                      value={profileEmail}
                      disabled
                    />
                  </div>

                  <div className="form-group-block">
                    <label className="field-label">Default Home Service Delivery Address</label>
                    <textarea 
                      className="dash-textarea" 
                      rows="3"
                      value={profileAddress}
                      onChange={(e) => setProfileAddress(e.target.value)}
                      placeholder="Enter flat/house number, street name, locality, landmark..."
                      required
                    />
                  </div>

                  <button type="submit" className="btn-save-profile">
                    Save Profile Changes ✓
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* 6. FULL-PAGE PROVIDER DETAIL VIEW OVERLAY */}
        {selectedProvider && (
          <div className="fullpage-provider-overlay">
            {/* Full-Page Top Header Navigation */}
            <div className="fullpage-header">
              <button className="btn-back-dash" onClick={() => setSelectedProvider(null)}>
                ← Back to Dashboard
              </button>
              <div className="fullpage-header-title">
                <span className="verified-dot">🟢</span>
                <span>{selectedProvider.name}</span>
                <small>({selectedProvider.serviceType})</small>
              </div>
              <button className="btn-close-fullpage" onClick={() => setSelectedProvider(null)}>✕ Close</button>
            </div>

            {/* Provider Hero Header Card */}
            <div className="fullpage-hero">
              <div className="hero-avatar-wrap">
                <img 
                  src={selectedProvider.selfieImage || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=300&q=80'} 
                  alt={selectedProvider.name} 
                  className="hero-avatar-img"
                />
                <span className="hero-badge">Verified Partner</span>
              </div>

              <div className="hero-info">
                <h1 className="hero-name">{selectedProvider.name}</h1>
                <p className="hero-subtitle">{selectedProvider.serviceType} Specialist · {selectedProvider.experience || 0} Years Experience</p>
                <div className="hero-stats-row">
                  <div className="hero-stat-item">
                    <span className="stat-label">⭐ Rating</span>
                    <span className="stat-val">
                      {providerReviews.length > 0 
                        ? `${(providerReviews.reduce((sum, r) => sum + r.rating, 0) / providerReviews.length).toFixed(1)} / 5.0`
                        : 'No Ratings'}
                    </span>
                  </div>
                  <div className="hero-stat-item">
                    <span className="stat-label">🛠️ Sub-Services</span>
                    <span className="stat-val">{providerSubServices.length} Services</span>
                  </div>
                  <div className="hero-stat-item">
                    <span className="stat-label">📷 Work Photos</span>
                    <span className="stat-val">{providerPortfolio.length} Photos</span>
                  </div>
                  <div className="hero-stat-item">
                    <span className="stat-label">📍 Service Radius</span>
                    <span className="stat-val">{selectedProvider.workingRadius ? `${selectedProvider.workingRadius} km` : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* FULL-PAGE TABS NAVIGATION */}
            <div className="fullpage-tabs-bar">
              <button 
                className={`fullpage-tab ${providerActiveTab === 'subservices' ? 'active' : ''}`}
                onClick={() => setProviderActiveTab('subservices')}
              >
                🛠️ Sub-Services ({providerSubServices.length})
              </button>
              <button 
                className={`fullpage-tab ${providerActiveTab === 'portfolio' ? 'active' : ''}`}
                onClick={() => setProviderActiveTab('portfolio')}
              >
                📷 Work Portfolio ({providerPortfolio.length})
              </button>
              <button 
                className={`fullpage-tab ${providerActiveTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setProviderActiveTab('reviews')}
              >
                ⭐ Reviews & Ratings ({providerReviews.length})
              </button>
              <button 
                className={`fullpage-tab ${providerActiveTab === 'about' ? 'active' : ''}`}
                onClick={() => setProviderActiveTab('about')}
              >
                ℹ️ About & Qualifications
              </button>
            </div>


            {/* TAB CONTENT AREA */}
            <div className="fullpage-content-body">

              {/* TAB 1: SUB-SERVICES */}
              {providerActiveTab === 'subservices' && (
                <div className="tab-pane">
                  <div className="pane-header">
                    <h2>Offered Sub-Services & Pricing</h2>
                    <p>Select any sub-service to schedule a custom booking date and time slot with {selectedProvider.name}.</p>
                  </div>

                  {loadingSubServices ? (
                    <div className="dash-loading-state">
                      <div className="spinner"></div>
                      <p>Loading sub-services...</p>
                    </div>
                  ) : providerSubServices.length === 0 ? (
                    <div className="empty-tab-box">
                      <p>No specific sub-services listed yet. You can place a general request with this provider.</p>
                    </div>
                  ) : (
                    <div className="subservices-full-grid">
                      {providerSubServices.map((sub) => (
                        <div key={sub.id || sub.name} className="subservice-full-card">
                          <div className="sub-card-top">
                            <span className="sub-badge">Available Now</span>
                            <h3 className="sub-card-title">{sub.name}</h3>
                            <p className="sub-card-desc">{sub.description || 'Professional execution using certified equipment and transparent pricing.'}</p>
                          </div>
                          
                          <div className="sub-card-bottom">
                            <div className="sub-pricing">
                              <span className="sub-amount">₹{sub.price || 299}</span>
                              <span className="sub-rate-unit">/{sub.unit || 'service'}</span>
                            </div>
                            <button 
                              className="btn-book-now-full"
                              onClick={() => handleInitiateBooking(sub)}
                            >
                              Book Now & Schedule →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: WORK PORTFOLIO */}
              {providerActiveTab === 'portfolio' && (
                <div className="tab-pane">
                  <div className="pane-header">
                    <h2>Work Portfolio & Completed Projects</h2>
                    <p>Click on any photo to open it in full view.</p>
                  </div>

                  {loadingPortfolio ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>Loading portfolio...</div>
                  ) : providerPortfolio.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', border: '1px dashed #ccc', borderRadius: '8px' }}>
                      <p>This service partner hasn't uploaded any portfolio photos yet.</p>
                    </div>
                  ) : (
                    <div className="portfolio-full-gallery">
                      {providerPortfolio.map((item, idx) => (
                        <div 
                          key={item.id} 
                          className="portfolio-photo-item clickable-photo-card"
                          onClick={() => setPreviewImage(item.imageUrl)}
                        >
                          <img src={item.imageUrl} alt={item.caption || `Project ${idx + 1}`} className="portfolio-large-img" />
                          <div className="photo-caption">
                            <span>{item.caption || `Completed Work #${idx + 1}`}</span>
                            <small className="zoom-prompt">🔍 Click to Expand</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: REVIEWS */}
              {providerActiveTab === 'reviews' && (
                <div className="tab-pane">
                  <div className="pane-header">
                    <h2>Customer Reviews & Ratings</h2>
                    <p>Feedback from verified clients who previously hired {selectedProvider.name}.</p>
                  </div>

                  <div className="reviews-rating-summary">
                    <div className="overall-score-box">
                      <span className="big-rating-score">
                        {providerReviews.length > 0 
                          ? (providerReviews.reduce((sum, r) => sum + r.rating, 0) / providerReviews.length).toFixed(1) 
                          : '0.0'}
                      </span>
                      <span className="stars-row">⭐⭐⭐⭐⭐</span>
                      <small>Based on {providerReviews.length} verified jobs</small>
                    </div>

                    <div className="rating-bars flex-1">
                      <div className="bar-line">
                        <span>5 Stars</span>
                        <div className="progress-bg"><div className="progress-fill" style={{ width: `${providerReviews.length > 0 ? (providerReviews.filter(r => r.rating === 5).length / providerReviews.length) * 100 : 0}%` }}></div></div>
                        <span>{providerReviews.length > 0 ? Math.round((providerReviews.filter(r => r.rating === 5).length / providerReviews.length) * 100) : 0}%</span>
                      </div>
                      <div className="bar-line">
                        <span>4 Stars</span>
                        <div className="progress-bg"><div className="progress-fill" style={{ width: `${providerReviews.length > 0 ? (providerReviews.filter(r => r.rating === 4).length / providerReviews.length) * 100 : 0}%` }}></div></div>
                        <span>{providerReviews.length > 0 ? Math.round((providerReviews.filter(r => r.rating === 4).length / providerReviews.length) * 100) : 0}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="reviews-full-list">
                    {loadingReviews ? (
                      <p>Loading reviews...</p>
                    ) : providerReviews.length === 0 ? (
                      <p>No reviews yet for this service partner.</p>
                    ) : providerReviews.map((rev) => (
                      <div key={rev.id} className="review-full-card">
                        <div className="rev-card-top">
                          <div className="rev-author-info">
                            <div className="author-avatar-circle">{rev.userName ? rev.userName.charAt(0) : 'C'}</div>
                            <div>
                              <strong>{rev.userName || 'Customer'}</strong>
                              <small className="rev-date">{new Date(rev.createdAt).toLocaleDateString()}</small>
                            </div>
                          </div>
                          <span className="rev-star-pill">⭐ {rev.rating}</span>
                        </div>
                        <p className="rev-comment">"{rev.comment}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: ABOUT */}
              {providerActiveTab === 'about' && (
                <div className="tab-pane">
                  <div className="pane-header">
                    <h2>About {selectedProvider.name}</h2>
                    <p>Background, qualifications and service area details.</p>
                  </div>

                  <div className="about-info-grid">
                    <div className="about-card-box">
                      <h3>👨‍🔧 Professional Biography</h3>
                      <p>{selectedProvider.bio || 'Professional home service technician committed to quality standards, safety protocols, and 100% customer satisfaction.'}</p>
                    </div>

                    <div className="about-card-box">
                      <h3>📋 Verification & Identity</h3>
                      <ul className="verify-list">
                        <li>✔️ Government ID Verified ({selectedProvider.documentType || 'Aadhaar / PAN Card'})</li>
                        <li>✔️ Live Selfie Face Match Verified</li>
                        <li>✔️ Background Check Passed</li>
                        <li>✔️ Active Status Approved by Admin</li>
                      </ul>
                    </div>

                    <div className="about-card-box">
                      <h3>📍 Service Coverage Area</h3>
                      <p><strong>Primary Location:</strong> {selectedProvider.coverageArea || 'Central Metro City'}</p>
                      <p><strong>Max Operating Radius:</strong> Up to {selectedProvider.workingRadius || 10} km from base location.</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* 7. BOOKING REQUEST MODAL (With Date & Time Selection) */}
        {bookingSubService && (
          <div className="modal-backdrop" onClick={() => setBookingSubService(null)}>
            <div className="booking-modal-card" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={() => setBookingSubService(null)}>✕</button>

              {!bookingSuccess ? (
                <form onSubmit={handleConfirmBookingRequest}>
                  <div className="booking-modal-header">
                    <span className="modal-step-badge">Schedule Service</span>
                    <h2>Book "{bookingSubService.name}"</h2>
                    <p className="partner-name-line">Partner: <strong>{selectedProvider?.name}</strong> ({selectedProvider?.serviceType})</p>
                  </div>

                  {/* Sub-Service Price Summary */}
                  <div className="booking-price-summary">
                    <span>Estimated Service Price</span>
                    <span className="summary-amount">₹{bookingSubService.price || 299} <small>/{bookingSubService.unit || 'visit'}</small></span>
                  </div>

                  {/* 1. Select Preferred Date */}
                  <div className="form-group-block">
                    <label className="field-label">📅 1. Select Service Date</label>
                    <input 
                      type="date" 
                      className="dash-input-date"
                      min={new Date().toISOString().split('T')[0]}
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      required
                    />
                  </div>

                  {/* 2. Select Preferred Time Slot */}
                  <div className="form-group-block">
                    <label className="field-label">⏰ 2. Select Preferred Time Slot</label>
                    <div className="time-slots-grid">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          className={`slot-pill ${bookingTimeSlot === slot && !customTime ? 'selected' : ''}`}
                          onClick={() => { setBookingTimeSlot(slot); setCustomTime(''); }}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>

                    <div className="custom-time-row">
                      <span>Or specify exact time:</span>
                      <input 
                        type="time" 
                        className="dash-input-time"
                        value={customTime}
                        onChange={(e) => setCustomTime(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* 3. Service Address */}
                  <div className="form-group-block">
                    <label className="field-label">📍 3. Service Delivery Address</label>
                    <textarea 
                      className="dash-textarea"
                      rows="2"
                      value={bookingAddress}
                      onChange={(e) => setBookingAddress(e.target.value)}
                      placeholder="Enter full address with street, flat number, and landmark..."
                      required
                    />
                  </div>

                  {/* 4. Special Instructions */}
                  <div className="form-group-block">
                    <label className="field-label">📝 4. Special Instructions (Optional)</label>
                    <input 
                      type="text" 
                      className="dash-input-text"
                      placeholder="e.g. Ring bell twice, bring long ladder, call before arriving..."
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="modal-actions-row">
                    <button type="button" className="btn-cancel-modal" onClick={() => setBookingSubService(null)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-confirm-booking" disabled={submittingBooking}>
                      {submittingBooking ? 'Submitting Request...' : 'Confirm Booking Request →'}
                    </button>
                  </div>
                </form>
              ) : (
                /* BOOKING SUCCESS STATE */
                <div className="booking-success-container">
                  <div className="success-icon-animated">🎉</div>
                  <h2>Booking Request Sent!</h2>
                  <p>Your service request has been sent to <strong>{selectedProvider?.name}</strong>. The provider will review and accept your time slot.</p>

                  <div className="booking-receipt-card">
                    <div className="receipt-row">
                      <span>Booking ID</span>
                      <strong>#EMH-{bookingSuccess.id}</strong>
                    </div>
                    <div className="receipt-row">
                      <span>Sub-Service</span>
                      <strong>{bookingSubService.name}</strong>
                    </div>
                    <div className="receipt-row">
                      <span>Scheduled Date</span>
                      <strong>📅 {bookingSuccess.bookingDate}</strong>
                    </div>
                    <div className="receipt-row">
                      <span>Scheduled Time</span>
                      <strong>⏰ {bookingSuccess.bookingTime}</strong>
                    </div>
                    <div className="receipt-row">
                      <span>Delivery Address</span>
                      <strong className="address-trunc">{bookingSuccess.address}</strong>
                    </div>
                    <div className="receipt-row">
                      <span>Status</span>
                      <span className="status-pending-pill">⏳ PENDING APPROVAL</span>
                    </div>
                  </div>

                  <button 
                    className="btn-done-close" 
                    onClick={() => { 
                      setBookingSubService(null); 
                      setSelectedProvider(null);
                      setActiveMainTab('bookings'); // Switch directly to My Bookings tab!
                    }}
                  >
                    View My Bookings →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 8. IMAGE LIGHTBOX MODAL */}
        {previewImage && (
          <div className="lightbox-backdrop" onClick={() => setPreviewImage(null)}>
            <div className="lightbox-card" onClick={(e) => e.stopPropagation()}>
              <button className="lightbox-close-btn" onClick={() => setPreviewImage(null)}>✕ Close</button>
              <img src={previewImage} alt="Work Portfolio Preview" className="lightbox-full-img" />
              <div className="lightbox-footer">
                <span>📷 Work Portfolio Project Detail</span>
              </div>
            </div>
          </div>
        )}

        {/* REVIEW MODAL */}
        {reviewModalOpen && (
          <div className="modal-overlay" onClick={() => setReviewModalOpen(false)}>
            <div className="review-modal-card" onClick={e => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={() => setReviewModalOpen(false)}>✕</button>

              <div className="review-modal-header">
                <div className="review-modal-icon-badge">⭐</div>
                <h2>Rate Your Experience</h2>
                <p>How satisfied were you with the completed service?</p>
              </div>

              {/* Interactive 5-Star Rating Component */}
              <div className="star-rating-interactive-box">
                <div className="star-rating-row">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= (reviewHoverRating || reviewRating);
                    return (
                      <button
                        key={star}
                        type="button"
                        className={`star-btn ${isFilled ? 'filled' : ''}`}
                        onClick={() => setReviewRating(star)}
                        onMouseEnter={() => setReviewHoverRating(star)}
                        onMouseLeave={() => setReviewHoverRating(0)}
                      >
                        ★
                      </button>
                    );
                  })}
                </div>
                <div className="rating-meaning-badge">
                  { (reviewHoverRating || reviewRating) === 5 && '😍 5/5 — Excellent! Exceeded Expectations' }
                  { (reviewHoverRating || reviewRating) === 4 && '😊 4/5 — Good & Satisfactory Work' }
                  { (reviewHoverRating || reviewRating) === 3 && '😐 3/5 — Average Experience' }
                  { (reviewHoverRating || reviewRating) === 2 && '🙁 2/5 — Poor Quality Service' }
                  { (reviewHoverRating || reviewRating) === 1 && '😡 1/5 — Terrible & Unsatisfactory' }
                </div>
              </div>

              {/* Review Comment Textarea */}
              <div className="form-group-block">
                <label className="field-label" style={{ marginBottom: '0.4rem', display: 'block', fontWeight: 700, fontSize: '0.88rem', color: '#374151' }}>
                  Write a Review (Optional)
                </label>
                <textarea 
                  className="review-textarea-field" 
                  rows="4" 
                  placeholder="Tell us what you liked about the service! Was the partner punctual, polite, and clean?"
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                />
              </div>

              <div className="review-modal-actions">
                <button 
                  type="button"
                  className="btn-cancel-review-modal"
                  onClick={() => setReviewModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  className="btn-submit-review-modal" 
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review ⭐'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REPORT ISSUE TO ADMIN MODAL */}

        {reportModalOpen && (
          <div className="modal-overlay" onClick={() => setReportModalOpen(false)}>
            <div className="report-modal-card" onClick={e => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={() => setReportModalOpen(false)}>✕</button>

              {!reportSuccess ? (
                <>
                  <div className="report-modal-header">
                    <div className="report-modal-icon-badge">🚨</div>
                    <div>
                      <h2>Report Issue to Admin</h2>
                      <p className="report-modal-subtitle">
                        Booking Ref: <strong>#EMH-{reportBooking?.id}</strong> ({reportBooking?.serviceType})
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmitReport} className="report-modal-form">
                    {/* 1. Select Issue Radio Options */}
                    <div className="form-group-block">
                      <label className="field-label-bold">Select Issue</label>
                      <div className="issue-options-grid">
                        {[
                          { id: "Provider didn't arrive", label: "Provider didn't arrive", icon: "🚫" },
                          { id: "Poor quality work", label: "Poor quality work", icon: "👎" },
                          { id: "Overcharged", label: "Overcharged", icon: "💸" },
                          { id: "Asked for extra money", label: "Asked for extra money", icon: "💰" },
                          { id: "Damaged property", label: "Damaged property", icon: "💥" },
                          { id: "Unprofessional behavior", label: "Unprofessional behavior", icon: "😤" },
                          { id: "Fraud", label: "Fraud", icon: "⚠️" },
                          { id: "Other", label: "Other", icon: "❓" }
                        ].map((issue) => (
                          <label 
                            key={issue.id} 
                            className={`issue-radio-card ${selectedIssueType === issue.id ? 'selected' : ''}`}
                          >
                            <input 
                              type="radio" 
                              name="issueType" 
                              value={issue.id}
                              checked={selectedIssueType === issue.id}
                              onChange={(e) => setSelectedIssueType(e.target.value)}
                            />
                            <span className="radio-circle"></span>
                            <span className="issue-icon">{issue.icon}</span>
                            <span className="issue-label">{issue.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* 2. Description Textarea */}
                    <div className="form-group-block">
                      <label className="field-label-bold">Description</label>
                      <textarea 
                        className="report-textarea-field" 
                        rows="4" 
                        placeholder="Please describe what happened in detail so admin can investigate and resolve this issue..."
                        value={reportDescription}
                        onChange={e => setReportDescription(e.target.value)}
                        required
                      />
                    </div>

                    {/* 3. Upload Images */}
                    <div className="form-group-block">
                      <label className="field-label-bold">Upload Images</label>
                      <p className="field-helper-text">Attach photos or screenshots as evidence (optional).</p>
                      
                      <div className="report-image-upload-wrapper">
                        <label className="btn-upload-images-trigger">
                          <span>📷 Upload Images</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            multiple 
                            onChange={handleReportImageUpload} 
                            style={{ display: 'none' }}
                          />
                        </label>
                        {uploadingReportImage && <span className="uploading-text">Uploading image...</span>}
                      </div>

                      {/* Uploaded Images Thumbnails */}
                      {reportImageFiles.length > 0 && (
                        <div className="report-images-preview-grid">
                          {reportImageFiles.map((img, index) => (
                            <div key={index} className="report-img-preview-card">
                              <img src={img.url} alt={`Upload ${index + 1}`} />
                              <button 
                                type="button" 
                                className="btn-remove-img" 
                                onClick={() => handleRemoveReportImage(index)}
                                title="Remove photo"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Modal Footer Actions */}
                    <div className="report-modal-actions">
                      <button 
                        type="button" 
                        className="btn-cancel-report-modal" 
                        onClick={() => setReportModalOpen(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="btn-submit-report-modal" 
                        disabled={submittingReport || !reportDescription.trim()}
                      >
                        {submittingReport ? 'Submitting to Admin...' : 'Submit Report →'}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                /* REPORT SUCCESS STATE */
                <div className="report-success-container">
                  <div className="success-icon-badge">✅</div>
                  <h2>Complaint Submitted to Admin</h2>
                  <p>Your issue ticket <strong>#{reportSuccess.ticketId}</strong> has been logged. EaseMyHome support team will review your report and take strict action.</p>
                  
                  <div className="report-summary-box">
                    <div className="r-summary-row">
                      <span>Ticket Reference</span>
                      <strong>{reportSuccess.ticketId}</strong>
                    </div>
                    <div className="r-summary-row">
                      <span>Selected Issue</span>
                      <strong className="issue-highlight">{reportSuccess.issueType}</strong>
                    </div>
                    <div className="r-summary-row">
                      <span>Booking ID</span>
                      <strong>#EMH-{reportSuccess.bookingId}</strong>
                    </div>
                    <div className="r-summary-row">
                      <span>Status</span>
                      <span className="status-open-badge">🟢 Open / Under Investigation</span>
                    </div>
                    {reportImageFiles.length > 0 && (
                      <div className="r-summary-row">
                        <span>Attached Images</span>
                        <strong>{reportImageFiles.length} photo(s)</strong>
                      </div>
                    )}
                  </div>

                  <button 
                    type="button" 
                    className="btn-done-report-close" 
                    onClick={() => {
                      setReportModalOpen(false);
                      setReportSuccess(null);
                    }}
                  >
                    Close & Return to Bookings ✓
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      {/* Razorpay Payment Modal */}
      <RazorpayPaymentModal
        open={razorpayModalOpen}
        onClose={() => {
          setRazorpayModalOpen(false);
          setSelectedBookingForPayment(null);
        }}
        booking={selectedBookingForPayment}
        onPaymentSuccess={async (data) => {
          const targetId = data?.bookingId || selectedBookingForPayment?.id;
          try {
            await apiClient.put(`/bookings/${targetId}/status`, { status: 'COMPLETED', paymentStatus: 'SUCCESS' });
          } catch (e) {
            console.warn('Backend status update error, updating local state:', e);
          }
          showToast('🎉 Payment Successful! Job status updated to COMPLETED.', 'success');
          setCustomerBookings(prev => prev.map(b => 
            (b.id === targetId || String(b.id) === String(targetId) || (selectedBookingForPayment && (b.id === selectedBookingForPayment.id || String(b.id) === String(selectedBookingForPayment.id)))) 
              ? { ...b, status: 'COMPLETED', paymentStatus: 'SUCCESS' } 
              : b
          ));
          setRazorpayModalOpen(false);
          setSelectedBookingForPayment(null);
          fetchCustomerBookings();
        }}
      />
      </main>
    </div>
  );
}

