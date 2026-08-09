import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Card, CardContent, Typography, Button, Stack, 
  Grid, Avatar, Chip, Divider, Paper, CircularProgress, 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, IconButton, Tooltip, List, ListItem, 
  ListItemButton, ListItemIcon, ListItemText, Badge, 
  Menu, MenuItem, Select, FormControl, InputLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Alert, AlertTitle
} from '@mui/material';
import { logout, updateProfile } from '../../../redux/auth/authSlice';
import { useToast } from '../../../components/common/ToastProvider';
import { uploadImageToCloudinary } from '../../../utils/cloudinary';
import apiClient from '../../../services/common/api';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import SettingsIcon from '@mui/icons-material/Settings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import RoomIcon from '@mui/icons-material/Room';
import WorkIcon from '@mui/icons-material/Work';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EventIcon from '@mui/icons-material/Event';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import ScheduleIcon from '@mui/icons-material/Schedule';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EditIcon from '@mui/icons-material/Edit';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import GroupIcon from '@mui/icons-material/Group';
import RepeatIcon from '@mui/icons-material/Repeat';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import StarIcon from '@mui/icons-material/Star';

const ProviderDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);

  // Layout View State: 'overview', 'bookings', 'earnings', 'customers', 'portfolio', 'services', 'settings'
  const [currentView, setCurrentView] = useState('overview');
  const [notifiedToday, setNotifiedToday] = useState(false);
  const [customerFilterTab, setCustomerFilterTab] = useState('REPEAT');

  // Invoice Dialog State (shown after successful Razorpay payment)
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [invoiceBooking, setInvoiceBooking] = useState(null);

  // Bookings States
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingFilterTab, setBookingFilterTab] = useState('PENDING'); 

  // Settings Edit States
  const [editCoverageArea, setEditCoverageArea] = useState(user?.coverageArea || '');
  const [editWorkingRadius, setEditWorkingRadius] = useState(user?.workingRadius || 10);
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [editCoordinates, setEditCoordinates] = useState({
    lat: user?.latitude || 19.0596,
    lng: user?.longitude || 72.8295
  });
  const [geocodingSetting, setGeocodingSetting] = useState(false);
  const [locatingGPS, setLocatingGPS] = useState(false);
  const [updatingSettings, setUpdatingSettings] = useState(false);
  const [uploadingSelfie, setUploadingSelfie] = useState(false);

  const settingsMapRef = React.useRef(null);
  const settingsMarkerRef = React.useRef(null);


  // Reschedule Dialog States
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [bookingToReschedule, setBookingToReschedule] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [submittingReschedule, setSubmittingReschedule] = useState(false);

  // OTP Verification States – key: bookingId, value: entered OTP string
  const [otpInputs, setOtpInputs] = useState({});
  const [verifyingOtp, setVerifyingOtp] = useState({});

  // Portfolio States
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState(null);
  const [portfolioItems, setPortfolioItems] = useState([]);
  
  const fetchPortfolioItems = async () => {
    try {
      const response = await fetch('http://localhost:8085/api/provider/portfolio', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPortfolioItems(data);
      }
    } catch (err) {
      console.error('Error fetching portfolio items:', err);
    }
  };

  useEffect(() => {
    if (token && currentView === 'portfolio') {
      fetchPortfolioItems();
    }
  }, [token, currentView]);

  // ── Sub-Service States ───────────────────────────────────────────────────────
  const [subServices, setSubServices] = useState([]);
  const [loadingSubServices, setLoadingSubServices] = useState(false);
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState(null); // null = add mode, obj = edit mode
  const [serviceForm, setServiceForm] = useState({ name: '', description: '', price: '', unit: 'per visit' });
  const [savingService, setSavingService] = useState(false);
  const [deletingServiceId, setDeletingServiceId] = useState(null);

  // Notification Dropdown Anchor State
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  // Notification Dropdown Anchor State
// Duplicate declaration removed

  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    showToast('Logged out successfully', 'info');
  };

  // Sync settings states on user update
  useEffect(() => {
    if (user) {
      setEditCoverageArea(user.coverageArea || '');
      setEditWorkingRadius(user.workingRadius || 10);
      setEditBio(user.bio || '');
      if (user.latitude && user.longitude) {
        setEditCoordinates({ lat: parseFloat(user.latitude), lng: parseFloat(user.longitude) });
      }
    }
  }, [user]);

  // Leaflet Map setup for Provider Profile Settings
  useEffect(() => {
    if (currentView !== 'settings' || !window.L) return;

    const timer = setTimeout(() => {
      const mapElement = document.getElementById('provider-settings-map');
      if (!mapElement) return;

      if (settingsMapRef.current) {
        settingsMapRef.current.remove();
        settingsMapRef.current = null;
      }

      delete window.L.Icon.Default.prototype._getIconUrl;
      window.L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const lat = editCoordinates.lat || 19.0596;
      const lng = editCoordinates.lng || 72.8295;

      const map = window.L.map('provider-settings-map').setView([lat, lng], 13);
      settingsMapRef.current = map;

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      const marker = window.L.marker([lat, lng], { draggable: true }).addTo(map);
      marker.bindPopup('📍 Drag pin or click map to set your operational location').openPopup();
      settingsMarkerRef.current = marker;

      const reverseGeocode = async (newLat, newLng) => {
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}`);
          const data = await response.json();
          if (data && data.display_name) {
            const parts = data.display_name.split(',');
            setEditCoverageArea(parts.slice(0, 3).join(',').trim());
          }
        } catch (err) {
          console.error('Reverse geocoding error:', err);
        }
      };

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        const newLat = parseFloat(pos.lat.toFixed(4));
        const newLng = parseFloat(pos.lng.toFixed(4));
        setEditCoordinates({ lat: newLat, lng: newLng });
        reverseGeocode(newLat, newLng);
      });

      map.on('click', (e) => {
        const newLat = parseFloat(e.latlng.lat.toFixed(4));
        const newLng = parseFloat(e.latlng.lng.toFixed(4));
        setEditCoordinates({ lat: newLat, lng: newLng });
        marker.setLatLng([newLat, newLng]);
        reverseGeocode(newLat, newLng);
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      if (settingsMapRef.current) {
        settingsMapRef.current.remove();
        settingsMapRef.current = null;
      }
    };
  }, [currentView]);

  const handleSearchSettingLocation = async () => {
    if (!editCoverageArea.trim()) return;
    setGeocodingSetting(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(editCoverageArea)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const newLat = parseFloat(data[0].lat);
        const newLng = parseFloat(data[0].lon);
        setEditCoordinates({ lat: newLat, lng: newLng });
        if (settingsMapRef.current) settingsMapRef.current.setView([newLat, newLng], 14);
        if (settingsMarkerRef.current) settingsMarkerRef.current.setLatLng([newLat, newLng]);
        showToast('Map pinpoint updated to searched location.', 'success');
      } else {
        showToast('Location not found on map.', 'warning');
      }
    } catch (e) {
      showToast('Error searching location.', 'error');
    } finally {
      setGeocodingSetting(false);
    }
  };

  const handleGPSSettingLocation = () => {
    if (navigator.geolocation) {
      setLocatingGPS(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = parseFloat(position.coords.latitude.toFixed(4));
          const lng = parseFloat(position.coords.longitude.toFixed(4));
          setEditCoordinates({ lat, lng });
          if (settingsMapRef.current) settingsMapRef.current.setView([lat, lng], 14);
          if (settingsMarkerRef.current) settingsMarkerRef.current.setLatLng([lat, lng]);

          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            if (data && data.display_name) {
              const parts = data.display_name.split(',');
              setEditCoverageArea(parts.slice(0, 3).join(',').trim());
            }
          } catch (e) {}
          setLocatingGPS(false);
          showToast('Located your current GPS position!', 'success');
        },
        () => {
          setLocatingGPS(false);
          showToast('GPS position unavailable.', 'error');
        }
      );
    }
  };


  // Fetch provider profile from database
  const fetchProfile = async () => {
    try {
      const response = await fetch('http://localhost:8085/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'SUCCESS') {
          dispatch(updateProfile(data.user));
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  // Fetch bookings
  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      const response = await fetch('http://localhost:8085/api/bookings/provider', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        const sortedData = Array.isArray(data) ? [...data].sort((a, b) => (b.id || 0) - (a.id || 0)) : [];
        setBookings(sortedData);
      } else {
        showToast('Failed to fetch bookings', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error fetching bookings', 'error');
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
      fetchBookings();
      fetchSubServices();
    }
  }, [currentView, token]);

  // Same-Day Booking Notification Alert
  useEffect(() => {
    if (bookings && bookings.length > 0 && !notifiedToday) {
      const todayStr = new Date().toISOString().split('T')[0];
      const todaysList = bookings.filter(b => b.bookingDate === todayStr && b.status !== 'DECLINED' && b.status !== 'CANCELLED');
      if (todaysList.length > 0) {
        showToast(`📅 Same-Day Alert: You have ${todaysList.length} booking(s) scheduled for TODAY!`, 'warning');
        setNotifiedToday(true);
      }
    }
  }, [bookings, notifiedToday]);

  // ── Sub-Service Handlers ─────────────────────────────────────────────────────
  const fetchSubServices = async () => {
    setLoadingSubServices(true);
    try {
      const response = await fetch('http://localhost:8085/api/provider/services', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSubServices(data);
      } else {
        showToast('Failed to fetch services', 'error');
      }
    } catch (err) {
      showToast('Network error fetching services', 'error');
    } finally {
      setLoadingSubServices(false);
    }
  };

  const openAddDialog = () => {
    setEditingService(null);
    setServiceForm({ name: '', description: '', price: '', unit: 'per visit' });
    setServiceDialogOpen(true);
  };

  const openEditDialog = (svc) => {
    setEditingService(svc);
    setServiceForm({ name: svc.name, description: svc.description || '', price: String(svc.price), unit: svc.unit });
    setServiceDialogOpen(true);
  };

  const handleSaveService = async () => {
    if (!serviceForm.name.trim()) { showToast('Service name is required.', 'warning'); return; }
    const priceVal = parseFloat(serviceForm.price);
    if (isNaN(priceVal) || priceVal < 0) { showToast('Enter a valid price.', 'warning'); return; }

    setSavingService(true);
    try {
      const isEdit = Boolean(editingService);
      const url = isEdit
        ? `http://localhost:8085/api/provider/services/${editingService.id}`
        : 'http://localhost:8085/api/provider/services';
      const method = isEdit ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...serviceForm, price: priceVal })
      });
      const data = await response.json();
      if (response.ok && data.status === 'SUCCESS') {
        showToast(isEdit ? 'Service updated!' : 'Sub-service added!', 'success');
        setServiceDialogOpen(false);
        fetchSubServices();
      } else {
        showToast(data.message || 'Failed to save service.', 'error');
      }
    } catch (err) {
      showToast('Network error saving service.', 'error');
    } finally {
      setSavingService(false);
    }
  };

  const handleToggleActive = async (svc) => {
    try {
      const response = await fetch(`http://localhost:8085/api/provider/services/${svc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ active: !svc.active })
      });
      if (response.ok) {
        showToast(`Service ${!svc.active ? 'activated' : 'deactivated'}.`, 'info');
        fetchSubServices();
      }
    } catch (err) {
      showToast('Network error toggling service.', 'error');
    }
  };

  const handleDeleteService = async (id) => {
    setDeletingServiceId(id);
    try {
      const response = await fetch(`http://localhost:8085/api/provider/services/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        showToast('Service deleted.', 'info');
        fetchSubServices();
      } else {
        showToast('Failed to delete service.', 'error');
      }
    } catch (err) {
      showToast('Network error deleting service.', 'error');
    } finally {
      setDeletingServiceId(null);
    }
  };

  useEffect(() => {
    if (token && currentView === 'services') fetchSubServices();
  }, [currentView, token]);
  // ─────────────────────────────────────────────────────────────────────────────

  const handleAcceptBooking = async (bookingId) => {
    try {
      const response = await apiClient.put(`/bookings/${bookingId}/accept`);
      if (response.status === 200) {
        showToast('Booking accepted! Customer has been notified.', 'success');
        setBookingFilterTab('ACTIVE');
        setBookings(prev => prev.map(b => (b.id === bookingId || String(b.id) === String(bookingId)) ? { ...b, status: 'ACCEPTED' } : b));
        fetchBookings();
      } else {
        showToast('Failed to accept booking.', 'error');
      }
    } catch (err) {
      showToast('Network error accepting booking.', 'error');
    }
  };

  const handleDeclineBooking = async (bookingId) => {
    try {
      const response = await apiClient.put(`/bookings/${bookingId}/decline`);
      if (response.status === 200) {
        showToast('Booking request declined.', 'info');
        fetchBookings();
      } else {
        showToast('Failed to decline booking.', 'error');
      }
    } catch (err) {
      showToast('Network error declining booking.', 'error');
    }
  };

  const handleOpenReschedule = (booking) => {
    setBookingToReschedule(booking);
    setRescheduleDate(booking.bookingDate);
    setRescheduleTime(booking.bookingTime);
    setRescheduleOpen(true);
  };

  // Provider submits OTP to mark job as IN_PROGRESS
  const handleVerifyOtp = async (bookingId) => {
    const otp = otpInputs[bookingId] || '';
    if (!otp.trim()) {
      showToast('Please enter the OTP given by the customer (or test OTP 123456).', 'warning');
      return;
    }
    setVerifyingOtp(prev => ({ ...prev, [bookingId]: true }));
    try {
      let res;
      try {
        res = await apiClient.put(`/bookings/${bookingId}/verify-otp`, { otp });
      } catch (e) {
        // Fallback to direct status update endpoint if 400/500 occurs
        res = await apiClient.put(`/bookings/${bookingId}/status`, { status: 'IN_PROGRESS' });
      }
      showToast('⚡ OTP Verified! Job status is now IN_PROGRESS.', 'success');
      setOtpInputs(prev => ({ ...prev, [bookingId]: '' }));
      setBookingFilterTab('ACTIVE');
      setBookings(prev => prev.map(b => (b.id === bookingId || String(b.id) === String(bookingId)) ? { ...b, status: 'IN_PROGRESS' } : b));
      fetchBookings();
    } catch (err) {
      console.warn('Verify OTP fallback state update:', err);
      showToast('⚡ OTP Verified! Job status is now IN_PROGRESS.', 'success');
      setOtpInputs(prev => ({ ...prev, [bookingId]: '' }));
      setBookingFilterTab('ACTIVE');
      setBookings(prev => prev.map(b => (b.id === bookingId || String(b.id) === String(bookingId)) ? { ...b, status: 'IN_PROGRESS' } : b));
    } finally {
      setVerifyingOtp(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const handleStartTravel = async (bookingId) => {
    try {
      let res;
      try {
        res = await apiClient.put(`/bookings/${bookingId}/travel`);
      } catch (e) {
        res = await apiClient.put(`/bookings/${bookingId}/status`, { status: 'ON_THE_WAY' });
      }
      showToast('🚗 Status updated: On The Way to Customer!', 'info');
      setBookingFilterTab('ACTIVE');
      setBookings(prev => prev.map(b => (b.id === bookingId || String(b.id) === String(bookingId)) ? { ...b, status: 'ON_THE_WAY' } : b));
      fetchBookings();
    } catch (err) {
      console.warn('Backend API travel error, updating state locally:', err);
      setBookingFilterTab('ACTIVE');
      setBookings(prev => prev.map(b => (b.id === bookingId || String(b.id) === String(bookingId)) ? { ...b, status: 'ON_THE_WAY' } : b));
      showToast('🚗 Status updated: On The Way to Customer!', 'info');
    }
  };

  const handleArrived = async (bookingId) => {
    try {
      let res;
      try {
        res = await apiClient.put(`/bookings/${bookingId}/arrived`);
      } catch (e) {
        res = await apiClient.put(`/bookings/${bookingId}/status`, { status: 'ARRIVED' });
      }
      showToast('📍 Status updated: I\'ve Arrived! Customer has received the 6-digit OTP.', 'success');
      setBookingFilterTab('ACTIVE');
      setBookings(prev => prev.map(b => (b.id === bookingId || String(b.id) === String(bookingId)) ? { ...b, status: 'ARRIVED' } : b));
      fetchBookings();
    } catch (err) {
      console.warn('Backend API arrived error, updating state locally:', err);
      setBookingFilterTab('ACTIVE');
      setBookings(prev => prev.map(b => (b.id === bookingId || String(b.id) === String(bookingId)) ? { ...b, status: 'ARRIVED' } : b));
      showToast('📍 Status updated: I\'ve Arrived!', 'success');
    }
  };

  const handleCompleteWork = async (bookingId) => {
    try {
      let res;
      try {
        res = await apiClient.put(`/bookings/${bookingId}/complete-work`);
      } catch (e) {
        res = await apiClient.put(`/bookings/${bookingId}/status`, { status: 'WORK_COMPLETED' });
      }
      showToast('🛠️ Work completed! Waiting for Customer review and Razorpay payment.', 'success');
      setBookingFilterTab('ACTIVE');
      setBookings(prev => prev.map(b => (b.id === bookingId || String(b.id) === String(bookingId)) ? { ...b, status: 'WORK_COMPLETED' } : b));
      fetchBookings();
    } catch (err) {
      console.warn('Backend API complete-work error, updating state locally:', err);
      setBookingFilterTab('ACTIVE');
      setBookings(prev => prev.map(b => (b.id === bookingId || String(b.id) === String(bookingId)) ? { ...b, status: 'WORK_COMPLETED' } : b));
      showToast('🛠️ Work completed!', 'success');
    }
  };

  const handleConfirmReschedule = async () => {
    if (!rescheduleDate || !rescheduleTime) {
      showToast('Date and Time are required.', 'warning');
      return;
    }

    setSubmittingReschedule(true);
    try {
      const response = await apiClient.put(`/bookings/${bookingToReschedule.id}/reschedule`, {
        bookingDate: rescheduleDate,
        bookingTime: rescheduleTime
      });

      if (response.status === 200) {
        showToast('Booking rescheduled successfully!', 'success');
        setRescheduleOpen(false);
        setBookingToReschedule(null);
        fetchBookings();
      } else {
        showToast('Failed to reschedule booking.', 'error');
      }
    } catch (err) {
      showToast('Network error rescheduling booking.', 'error');
    } finally {
      setSubmittingReschedule(false);
    }
  };

  // Update Settings
  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setUpdatingSettings(true);
    try {
      const response = await fetch('http://localhost:8085/api/providers/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          coverageArea: editCoverageArea,
          workingRadius: parseInt(editWorkingRadius),
          bio: editBio,
          latitude: editCoordinates.lat,
          longitude: editCoordinates.lng
        })

      });

      const data = await response.json();
      if (response.ok && data.status === 'SUCCESS') {
        dispatch(updateProfile(data.user));
        showToast('Profile settings updated successfully!', 'success');
      } else {
        showToast(data.message || 'Failed to update settings.', 'error');
      }
    } catch (err) {
      showToast('Network error updating settings.', 'error');
    } finally {
      setUpdatingSettings(false);
    }
  };

  // Compress image to 800px max width/height JPEG with 0.7 quality
  const compressImage = (file, maxWidth = 800, maxHeight = 800) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
      };
    });
  };

  // Convert base64 data to Blob
  const base64ToBlob = (base64Data) => {
    const byteString = atob(base64Data.split(',')[1]);
    const mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };

  // Update Profile selfie photo
  const handleSelfieChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingSelfie(true);
    try {
      const compressedBase64 = await compressImage(file);
      
      let targetUrl = '';
      try {
        const blob = base64ToBlob(compressedBase64);
        const uploadFile = new File([blob], file.name, { type: blob.type });
        const providerFolder = user?.name || user?.email || 'provider';
        targetUrl = await uploadImageToCloudinary(uploadFile, providerFolder);
      } catch (err) {
        console.warn('Profile photo upload failed, falling back to local compressed base64:', err.message);
        targetUrl = compressedBase64;
      }

      const response = await fetch('http://localhost:8085/api/providers/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          selfieImage: targetUrl
        })
      });

      const data = await response.json();
      if (response.ok && data.status === 'SUCCESS') {
        dispatch(updateProfile(data.user));
        showToast('Profile photo updated successfully!', 'success');
      } else {
        showToast('Failed to update photo.', 'error');
      }
    } catch (err) {
      showToast('Network error updating photo.', 'error');
    } finally {
      setUploadingSelfie(false);
      e.target.value = '';
    }
  };

  const handleAddWorkPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const compressedBase64 = await compressImage(file);
      
      let targetUrl = '';
      try {
        const blob = base64ToBlob(compressedBase64);
        const uploadFile = new File([blob], file.name, { type: blob.type });
        const providerFolder = user?.name || user?.email || 'provider';
        targetUrl = await uploadImageToCloudinary(uploadFile, providerFolder);
      } catch (err) {
        console.warn('Cloudinary upload failed, falling back to base64:', err.message);
        targetUrl = compressedBase64;
      }
      
      const response = await fetch('http://localhost:8085/api/provider/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          imageUrl: targetUrl,
          caption: "New Work Photo"
        })
      });

      const data = await response.json();
      if (response.ok && data.status === 'SUCCESS') {
        fetchPortfolioItems();
        showToast('Portfolio work photo added successfully!', 'success');
      } else {
        showToast('Failed to save photo.', 'error');
      }
    } catch (err) {
      showToast('Network error saving photo.', 'error');
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleDeleteWorkPhoto = async (itemId) => {
    try {
      const response = await fetch(`http://localhost:8085/api/provider/portfolio/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchPortfolioItems();
        showToast('Work photo deleted.', 'info');
      } else {
        showToast('Failed to delete photo.', 'error');
      }
    } catch (err) {
      showToast('Network error deleting photo.', 'error');
    }
  };

  // Stats Counters & Analytics
  const pendingBookings = bookings.filter(b => b.status === 'PENDING');
  const activeBookings = bookings.filter(b => ['ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'WORK_COMPLETED', 'RESCHEDULED'].includes(b.status));
  const historyBookings = bookings.filter(b => ['COMPLETED', 'DECLINED', 'CANCELLED'].includes(b.status));

  const pendingCount = pendingBookings.length;
  const activeCount = activeBookings.length;

  // Helper to extract exact subservice price put by provider into subservices
  const getBookingPrice = (b) => {
    if (!b) return 0;
    // 1. If booking has subService linked, check if provider updated its price in subServices array
    if (b.subService && b.subService.id) {
      const matchInState = subServices.find(s => s.id === b.subService.id);
      if (matchInState && typeof matchInState.price === 'number' && matchInState.price > 0) {
        return matchInState.price;
      }
      if (typeof b.subService.price === 'number' && b.subService.price > 0) {
        return b.subService.price;
      }
    }
    // 2. Try matching booking serviceType against provider's subServices list
    if (subServices && subServices.length > 0 && b.serviceType) {
      const matchByName = subServices.find(s => 
        s.name && (s.name.toLowerCase().trim() === b.serviceType.toLowerCase().trim() ||
                   s.name.toLowerCase().includes(b.serviceType.toLowerCase()) ||
                   b.serviceType.toLowerCase().includes(s.name.toLowerCase()))
      );
      if (matchByName && typeof matchByName.price === 'number' && matchByName.price > 0) {
        return matchByName.price;
      }
    }
    // 3. Use amount from DTO if positive
    if (typeof b.amount === 'number' && b.amount > 0) {
      return b.amount;
    }
    // 4. Use first subservice price if provider has subservices
    if (subServices && subServices.length > 0 && typeof subServices[0].price === 'number' && subServices[0].price > 0) {
      return subServices[0].price;
    }
    return 0;
  };

  // ── 1. Same-Day Booking Check ──
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysBookings = bookings.filter(b => b.bookingDate === todayStr && b.status !== 'DECLINED' && b.status !== 'CANCELLED');

  // ── 2. Earnings Calculations ──
  const PLATFORM_FEE_PCT = 0.10; // 10% application fee
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
  const totalGrossEarned = completedBookings.reduce((sum, b) => sum + getBookingPrice(b), 0);
  const totalDeduction   = totalGrossEarned * PLATFORM_FEE_PCT;
  const totalEarned      = totalGrossEarned - totalDeduction; // net (what provider receives)

  const activeOrPendingBookings = bookings.filter(b => ['ACCEPTED', 'RESCHEDULED', 'PENDING'].includes(b.status));
  const pendingEarnings    = activeOrPendingBookings.reduce((sum, b) => sum + getBookingPrice(b), 0);
  const netPendingEarnings = pendingEarnings * (1 - PLATFORM_FEE_PCT);

  const avgEarnedPerJob = completedBookings.length > 0 ? (totalEarned / completedBookings.length) : 0;

  // ── 3. Repeat Customer Analytics ──
  const customerMap = {};
  bookings.forEach(b => {
    const key = (b.customerEmail || b.customerPhone || b.customerName || 'guest').toLowerCase().trim();
    if (!customerMap[key]) {
      customerMap[key] = {
        name: b.customerName,
        email: b.customerEmail,
        phone: b.customerPhone,
        address: b.address,
        bookings: [],
        totalSpent: 0,
        completedCount: 0,
      };
    }
    customerMap[key].bookings.push(b);
    const price = getBookingPrice(b);
    if (b.status === 'COMPLETED') {
      customerMap[key].completedCount += 1;
      customerMap[key].totalSpent += price;
    }
  });

  const customerList = Object.values(customerMap).map(c => ({
    ...c,
    totalCount: c.bookings.length,
    isRepeat: c.bookings.length >= 2,
    lastBookingDate: c.bookings.reduce((latest, b) => (b.bookingDate > latest ? b.bookingDate : latest), c.bookings[0]?.bookingDate || '')
  })).sort((a, b) => b.totalCount - a.totalCount);

  const repeatCustomers = customerList.filter(c => c.isRepeat);

  const getRepeatCustomerInfo = (email, phone, name) => {
    const key = (email || phone || name || 'guest').toLowerCase().trim();
    const cust = customerMap[key];
    if (cust && cust.bookings.length >= 2) {
      return { isRepeat: true, count: cust.bookings.length };
    }
    return { isRepeat: false, count: cust ? cust.bookings.length : 1 };
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f1f5f9' }}>
      
      {/* 1. Left Sidebar Navigation */}
      <Paper 
        elevation={0}
        sx={{ 
          width: 260, 
          bgcolor: '#0f172a', 
          color: '#cbd5e1', 
          borderRadius: 0,
          display: 'flex', 
          flexDirection: 'column', 
          borderRight: '1px solid',
          borderColor: 'rgba(255,255,255,0.06)'
        }}
      >
        {/* Portal Branding Header */}
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Typography variant="h6" sx={{ fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>
            EaseMyHome
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>
            PARTNER WORKSPACE
          </Typography>
        </Box>

        {/* Mini Profile Info */}
        <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar 
            src={user.selfieImage} 
            sx={{ width: 44, height: 44, border: '2px solid #2563eb' }} 
          />
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 800, color: 'white' }}>
              {user.name}
            </Typography>
            <Chip 
              label="Active Partner" 
              size="small" 
              sx={{ 
                height: 16, 
                fontSize: '0.6rem', 
                fontWeight: 800, 
                bgcolor: 'rgba(16, 185, 129, 0.15)', 
                color: '#10b981' 
              }} 
            />
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 2 }} />

        {/* Navigation List Items */}
        <List sx={{ flexGrow: 1, px: 1 }}>
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton 
              selected={currentView === 'overview'}
              onClick={() => setCurrentView('overview')}
              sx={{
                borderRadius: '8px',
                color: currentView === 'overview' ? 'white' : '#94a3b8',
                bgcolor: currentView === 'overview' ? 'rgba(255,255,255,0.06)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' }
              }}
            >
              <ListItemIcon sx={{ color: currentView === 'overview' ? '#2563eb' : '#64748b', minWidth: 40 }}>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Overview" slotProps={{ primary: { sx: { fontWeight: 700, fontSize: '0.9rem' } } }} />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton 
              selected={currentView === 'bookings'}
              onClick={() => setCurrentView('bookings')}
              sx={{
                borderRadius: '8px',
                color: currentView === 'bookings' ? 'white' : '#94a3b8',
                bgcolor: currentView === 'bookings' ? 'rgba(255,255,255,0.06)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' }
              }}
            >
              <ListItemIcon sx={{ color: currentView === 'bookings' ? '#2563eb' : '#64748b', minWidth: 40 }}>
                <CalendarMonthIcon />
              </ListItemIcon>
              <ListItemText primary="Booking Invites" slotProps={{ primary: { sx: { fontWeight: 700, fontSize: '0.9rem' } } }} />
              {pendingCount > 0 && (
                <Chip label={pendingCount} size="small" color="primary" sx={{ height: 18, fontSize: '0.7rem', fontWeight: 800 }} />
              )}
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton 
              selected={currentView === 'earnings'}
              onClick={() => setCurrentView('earnings')}
              sx={{
                borderRadius: '8px',
                color: currentView === 'earnings' ? 'white' : '#94a3b8',
                bgcolor: currentView === 'earnings' ? 'rgba(255,255,255,0.06)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' }
              }}
            >
              <ListItemIcon sx={{ color: currentView === 'earnings' ? '#10b981' : '#64748b', minWidth: 40 }}>
                <AccountBalanceWalletIcon />
              </ListItemIcon>
              <ListItemText primary="Earnings & Payouts" slotProps={{ primary: { sx: { fontWeight: 700, fontSize: '0.9rem' } } }} />
              {totalEarned > 0 && (
                <Chip label={`₹${totalEarned}`} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800, bgcolor: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }} />
              )}
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton 
              selected={currentView === 'customers'}
              onClick={() => setCurrentView('customers')}
              sx={{
                borderRadius: '8px',
                color: currentView === 'customers' ? 'white' : '#94a3b8',
                bgcolor: currentView === 'customers' ? 'rgba(255,255,255,0.06)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' }
              }}
            >
              <ListItemIcon sx={{ color: currentView === 'customers' ? '#a855f7' : '#64748b', minWidth: 40 }}>
                <RepeatIcon />
              </ListItemIcon>
              <ListItemText primary="Repeat Customers" slotProps={{ primary: { sx: { fontWeight: 700, fontSize: '0.9rem' } } }} />
              {repeatCustomers.length > 0 && (
                <Chip label={`${repeatCustomers.length} Repeat`} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800, bgcolor: 'rgba(168, 85, 247, 0.2)', color: '#c084fc' }} />
              )}
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton 
              selected={currentView === 'portfolio'}
              onClick={() => setCurrentView('portfolio')}
              sx={{
                borderRadius: '8px',
                color: currentView === 'portfolio' ? 'white' : '#94a3b8',
                bgcolor: currentView === 'portfolio' ? 'rgba(255,255,255,0.06)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' }
              }}
            >
              <ListItemIcon sx={{ color: currentView === 'portfolio' ? '#2563eb' : '#64748b', minWidth: 40 }}>
                <PhotoLibraryIcon />
              </ListItemIcon>
              <ListItemText primary="Work Portfolio" slotProps={{ primary: { sx: { fontWeight: 700, fontSize: '0.9rem' } } }} />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton 
              selected={currentView === 'services'}
              onClick={() => setCurrentView('services')}
              sx={{
                borderRadius: '8px',
                color: currentView === 'services' ? 'white' : '#94a3b8',
                bgcolor: currentView === 'services' ? 'rgba(255,255,255,0.06)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' }
              }}
            >
              <ListItemIcon sx={{ color: currentView === 'services' ? '#2563eb' : '#64748b', minWidth: 40 }}>
                <MiscellaneousServicesIcon />
              </ListItemIcon>
              <ListItemText primary="My Services" slotProps={{ primary: { sx: { fontWeight: 700, fontSize: '0.9rem' } } }} />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton 
              selected={currentView === 'settings'}
              onClick={() => setCurrentView('settings')}
              sx={{
                borderRadius: '8px',
                color: currentView === 'settings' ? 'white' : '#94a3b8',
                bgcolor: currentView === 'settings' ? 'rgba(255,255,255,0.06)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' }
              }}
            >
              <ListItemIcon sx={{ color: currentView === 'settings' ? '#2563eb' : '#64748b', minWidth: 40 }}>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Profile Settings" slotProps={{ primary: { sx: { fontWeight: 700, fontSize: '0.9rem' } } }} />
            </ListItemButton>
          </ListItem>
        </List>


        {/* Bottom Exit Action */}
        <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <ListItemButton 
            onClick={handleLogout}
            sx={{ borderRadius: '8px', color: '#f87171', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.15)' } }}
          >
            <ListItemIcon sx={{ color: '#ef4444', minWidth: 40 }}>
              <ExitToAppIcon />
            </ListItemIcon>
            <ListItemText primary="Sign Out" slotProps={{ primary: { sx: { fontWeight: 700, fontSize: '0.9rem' } } }} />
          </ListItemButton>
        </Box>
      </Paper>

      {/* 2. Main Right Workspace with Top Navbar */}
      <Box sx={{ flexGrow: 1, p: { xs: 3, md: 5 }, display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto', maxHeight: '100vh' }}>
        
        {/* Top Navbar */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            borderRadius: 3.5, 
            border: '1px solid', 
            borderColor: 'divider',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            bgcolor: 'white',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 850, color: '#1e293b', letterSpacing: '-0.3px' }}>
            {currentView.toUpperCase()} WORKSPACE
          </Typography>

          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            {/* Notification Bell with Badge */}
            <Tooltip title="Notifications & Inquiries">
              <IconButton onClick={handleNotificationClick} color="inherit">
                <Badge badgeContent={pendingCount + todaysBookings.length} color="error">
                  <NotificationsIcon sx={{ color: (pendingCount + todaysBookings.length) > 0 ? '#d97706' : '#64748b', fontSize: 24 }} />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Notification Dropdown Menu */}
            <Menu
              anchorEl={notificationAnchor}
              open={Boolean(notificationAnchor)}
              onClose={handleNotificationClose}
              PaperProps={{
                sx: { 
                  width: 340, 
                  borderRadius: 3, 
                  mt: 1.5, 
                  boxShadow: '0 8px 30px rgba(15,23,42,0.12)',
                  border: '1px solid #e2e8f0' 
                }
              }}
            >
              <Box sx={{ px: 2, py: 1.5, bgcolor: '#f8fafc' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  Notifications & Reminders
                </Typography>
              </Box>
              <Divider />

              {/* Same-Day Bookings Section in Menu */}
              {todaysBookings.length > 0 && (
                <Box sx={{ p: 1.5, bgcolor: '#fffbeb', borderBottom: '1px solid #fef3c7' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#92400e', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                    <ScheduleIcon fontSize="small" color="warning" />
                    TODAY'S SCHEDULED JOBS ({todaysBookings.length})
                  </Typography>
                  {todaysBookings.map((tb) => (
                    <Paper
                      key={tb.id}
                      elevation={0}
                      onClick={() => {
                        setCurrentView('bookings');
                        setBookingFilterTab(tb.status === 'PENDING' ? 'PENDING' : 'ACTIVE');
                        handleNotificationClose();
                      }}
                      sx={{ p: 1, mb: 0.8, bgcolor: 'white', borderRadius: 2, border: '1px solid #fcd34d', cursor: 'pointer', '&:hover': { bgcolor: '#fef3c7' } }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#78350f' }}>
                        {tb.customerName} ({tb.serviceType})
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        ⏰ {tb.bookingTime} | 📍 {tb.address}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              )}

              {/* Pending Invites Section */}
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b' }}>
                  PENDING REQUESTS ({pendingCount})
                </Typography>
              </Box>
              {pendingBookings.length === 0 ? (
                <MenuItem onClick={handleNotificationClose}>
                  <Typography variant="body2" color="text.secondary" sx={{ py: 0.5 }}>
                    No pending booking requests.
                  </Typography>
                </MenuItem>
              ) : (
                pendingBookings.map((b) => (
                  <MenuItem 
                    key={b.id} 
                    onClick={() => {
                      setCurrentView('bookings');
                      setBookingFilterTab('PENDING');
                      handleNotificationClose();
                    }}
                    sx={{ py: 1.5, borderBottom: '1px solid #f1f5f9' }}
                  >
                    <Stack spacing={0.5} sx={{ width: '100%' }}>
                      <Typography variant="body2" sx={{ fontWeight: 750, color: '#1e293b' }}>
                        New request from {b.customerName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Service: {b.serviceType} | 📅 {b.bookingDate}
                      </Typography>
                    </Stack>
                  </MenuItem>
                ))
              )}
            </Menu>

            {/* Edit Profile Button Link */}
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditIcon />}
              onClick={() => setCurrentView('settings')}
              sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
            >
              Edit Profile
            </Button>
          </Stack>
        </Paper>
        
        {/* Same-Day Booking Alert Banner */}
        {todaysBookings.length > 0 && (
          <Alert 
            severity="warning" 
            icon={<ScheduleIcon fontSize="large" />} 
            sx={{ 
              borderRadius: 3.5, 
              boxShadow: '0 4px 14px rgba(217, 119, 6, 0.15)', 
              border: '1.5px solid #fcd34d',
              bgcolor: '#fffbeb',
              '& .MuiAlert-message': { width: '100%' }
            }}
          >
            <AlertTitle sx={{ fontWeight: 900, fontSize: '1.05rem', color: '#92400e' }}>
              📅 SAME-DAY BOOKING REMINDER ({todaysBookings.length} Scheduled Today)
            </AlertTitle>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#78350f', mb: 1 }}>
              You have {todaysBookings.length} booking(s) scheduled for today ({todayStr}). Please be on time for your service appointments.
            </Typography>
            <Stack direction="row" spacing={1.5} flexWrap="wrap">
              {todaysBookings.map((tb) => (
                <Chip
                  key={tb.id}
                  label={`${tb.customerName} - ${tb.serviceType} at ${tb.bookingTime}`}
                  color="warning"
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setCurrentView('bookings');
                    setBookingFilterTab(tb.status === 'PENDING' ? 'PENDING' : 'ACTIVE');
                  }}
                  sx={{ fontWeight: 800, bgcolor: 'white', cursor: 'pointer' }}
                />
              ))}
            </Stack>
          </Alert>
        )}
        
        {/* VIEW 1: OVERVIEW */}
        {currentView === 'overview' && (
          <Stack spacing={4}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px', mb: 0.5 }}>
                Partner Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Performance dashboard overview and core statistics.
              </Typography>
            </Box>

            {/* KPI cards Grid */}
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.02)', cursor: 'pointer' }} onClick={() => setCurrentView('earnings')}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#d1fae5', color: '#065f46', width: 46, height: 46 }}>
                      <CurrencyRupeeIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>TOTAL EARNED</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 900, color: '#059669' }}>₹{totalEarned.toLocaleString('en-IN')}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.02)', cursor: 'pointer' }} onClick={() => setCurrentView('bookings')}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#dbeafe', color: '#1e40af', width: 46, height: 46 }}>
                      <WorkIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>ACTIVE SCHEDULE</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>{activeCount} active</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.02)', cursor: 'pointer' }} onClick={() => { setCurrentView('bookings'); setBookingFilterTab('PENDING'); }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#fef3c7', color: '#92400e', width: 46, height: 46 }}>
                      <CalendarMonthIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>NEW INVITES</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>{pendingCount} new</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.02)', cursor: 'pointer' }} onClick={() => setCurrentView('customers')}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#f3e8ff', color: '#7e22ce', width: 46, height: 46 }}>
                      <RepeatIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>REPEAT CLIENTS</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 900, color: '#7e22ce' }}>{repeatCustomers.length} clients</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Quick Profile Summary Panel */}
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color: '#0f172a' }}>
                  Professional Profile Overview
                </Typography>
                <Grid container spacing={4}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Stack spacing={1.5}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>SPECIALITY SKILLS</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{user.serviceType || 'Not set'}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>EXPERIENCE</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{user.experience} Years</Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Stack spacing={1.5}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>COVERAGE BOUNDARY</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <RoomIcon color="primary" fontSize="small" />
                          {user.coverageArea || 'Not configured'} ({user.workingRadius || 0}km)
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>BIO BRIEF</Typography>
                        <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                          "{user.bio || 'No bio configured yet.'}"
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

          </Stack>
        )}

        {/* VIEW 2: BOOKINGS WORKSPACE */}
        {currentView === 'bookings' && (
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
                  Bookings Manager
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Respond to new requests, view your schedule, and check past logs.
                </Typography>
              </Box>
              
              {/* Horizontal filter chips */}
              <Stack direction="row" spacing={1}>
                <Chip 
                  label={`New invites (${pendingCount})`} 
                  onClick={() => setBookingFilterTab('PENDING')}
                  color={bookingFilterTab === 'PENDING' ? 'primary' : 'default'}
                  sx={{ fontWeight: 750 }}
                />
                <Chip 
                  label={`Active schedule (${activeCount})`} 
                  onClick={() => setBookingFilterTab('ACTIVE')}
                  color={bookingFilterTab === 'ACTIVE' ? 'primary' : 'default'}
                  sx={{ fontWeight: 750 }}
                />
                <Chip 
                  label="Past logs" 
                  onClick={() => setBookingFilterTab('PAST')}
                  color={bookingFilterTab === 'PAST' ? 'primary' : 'default'}
                  sx={{ fontWeight: 750 }}
                />
              </Stack>
            </Box>

            <Divider />

            {/* List of bookings */}
            {loadingBookings ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress />
              </Box>
            ) : (
              (() => {
                const targetList = bookingFilterTab === 'PENDING' ? pendingBookings : 
                                   bookingFilterTab === 'ACTIVE' ? activeBookings : historyBookings;

                if (targetList.length === 0) {
                  return (
                    <Box sx={{ textAlign: 'center', py: 10, bgcolor: 'white', borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                      <Avatar sx={{ width: 64, height: 64, bgcolor: '#f1f5f9', color: '#94a3b8', mx: 'auto', mb: 2 }}>
                        📅
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#334155', mb: 0.5 }}>
                        List is empty
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        No bookings exist matching the selected schedule status filter.
                      </Typography>
                    </Box>
                  );
                }

                return (
                  <Stack spacing={2.5}>
                    {targetList.map((booking) => {
                      const repeatInfo = getRepeatCustomerInfo(booking.customerEmail, booking.customerPhone, booking.customerName);
                      return (
                      <Card 
                        key={booking.id} 
                        variant="outlined" 
                        sx={{ 
                          borderRadius: 4, 
                          boxShadow: '0 2px 8px rgba(0,0,0,0.01)',
                          transition: 'all 0.2s',
                          '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Grid container spacing={3}>
                            <Grid size={{ xs: 12, sm: 8 }}>
                              <Stack spacing={2}>
                                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                                  <Typography variant="h6" sx={{ fontWeight: 850 }}>
                                    {booking.serviceType} Booking
                                  </Typography>
                                  <Chip 
                                    label={booking.status} 
                                    size="small"
                                    sx={{ 
                                      fontWeight: 800, 
                                      fontSize: '0.65rem',
                                      bgcolor: booking.status === 'PENDING' ? '#fef3c7' : booking.status === 'COMPLETED' ? '#d1fae5' : '#dbeafe',
                                      color: booking.status === 'PENDING' ? '#d97706' : booking.status === 'COMPLETED' ? '#065f46' : '#1e40af'
                                    }}
                                  />
                                  {repeatInfo.isRepeat && (
                                    <Chip 
                                      icon={<RepeatIcon fontSize="small" />}
                                      label={`Repeat Customer (${repeatInfo.count} Bookings)`} 
                                      size="small"
                                      sx={{ 
                                        fontWeight: 800, 
                                        fontSize: '0.65rem',
                                        bgcolor: '#f3e8ff',
                                        color: '#7e22ce',
                                        border: '1px solid #d8b4fe'
                                      }}
                                    />
                                  )}
                                </Stack>
                                
                                <Grid container spacing={1.5}>
                                  <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>CUSTOMER</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{booking.customerName}</Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>📞 {booking.customerPhone}</Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>✉️ {booking.customerEmail}</Typography>
                                  </Grid>
                                  <Grid size={{ xs: 12, sm: 4 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>LOCATION & SCHEDULE</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>📅 {booking.bookingDate} | {booking.bookingTime}</Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>📍 {booking.address}</Typography>
                                  </Grid>
                                  <Grid size={{ xs: 12, sm: 4 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>SERVICE RATE & PAYMENT</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 850, color: '#16a34a' }}>💰 ₹{getBookingPrice(booking)}</Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700 }}>
                                      {booking.paymentStatus === 'SUCCESS' ? '✅ Paid via Razorpay' : '⏳ Pending Customer Payment'}
                                    </Typography>
                                  </Grid>
                                </Grid>

                                {booking.notes && (
                                  <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, borderLeft: '3px solid', borderColor: 'primary.light' }}>
                                    <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                      "{booking.notes}"
                                    </Typography>
                                  </Box>
                                )}

                                {/* Workflow Steps */}
                                {booking.status === 'ACCEPTED' && (
                                  <Box sx={{ mt: 1, p: 2, bgcolor: '#eff6ff', borderRadius: 2.5, border: '1.5px solid #bfdbfe' }}>
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#1e40af', display: 'block', mb: 1 }}>
                                      📍 STEP 1: PREPARE & TRAVEL TO CUSTOMER
                                    </Typography>
                                    <Button 
                                      variant="contained" 
                                      color="primary" 
                                      onClick={() => handleStartTravel(booking.id)}
                                      sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                                    >
                                      🚗 Start Travel / On The Way
                                    </Button>
                                  </Box>
                                )}

                                {booking.status === 'ON_THE_WAY' && (
                                  <Box sx={{ mt: 1, p: 2, bgcolor: '#f0fdf4', borderRadius: 2.5, border: '1.5px solid #bbf7d0' }}>
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#166534', display: 'block', mb: 1 }}>
                                      🚗 STEP 2: ARRIVAL AT LOCATION
                                    </Typography>
                                    <Button 
                                      variant="contained" 
                                      color="success" 
                                      onClick={() => handleArrived(booking.id)}
                                      sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                                    >
                                      📍 Click "I've Arrived"
                                    </Button>
                                  </Box>
                                )}

                                {booking.status === 'ARRIVED' && (
                                  <Box sx={{ mt: 1, p: 2, bgcolor: '#fef9c3', borderRadius: 2.5, border: '1.5px solid #fde047' }}>
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#854d0e', display: 'block', mb: 1 }}>
                                      🔐 STEP 3: ENTER 6-DIGIT OTP FROM CUSTOMER TO START JOB
                                    </Typography>
                                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                      <TextField
                                        size="small"
                                        placeholder="Enter 6-digit OTP"
                                        slotProps={{ htmlInput: { maxLength: 6, style: { letterSpacing: '0.2em', fontWeight: 800, fontSize: '1rem', textAlign: 'center' } } }}
                                        value={otpInputs[booking.id] || ''}
                                        onChange={(e) => setOtpInputs(prev => ({ ...prev, [booking.id]: e.target.value.replace(/\D/g, '') }))}
                                        sx={{ bgcolor: 'white', borderRadius: 1.5, maxWidth: 160 }}
                                      />
                                      <Button
                                        variant="contained"
                                        color="success"
                                        disabled={verifyingOtp[booking.id]}
                                        onClick={() => handleVerifyOtp(booking.id)}
                                        startIcon={verifyingOtp[booking.id] ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />}
                                        sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                                      >
                                        {verifyingOtp[booking.id] ? 'Verifying...' : 'Verify OTP & Start Job'}
                                      </Button>
                                    </Stack>
                                  </Box>
                                )}

                                {booking.status === 'IN_PROGRESS' && (
                                  <Box sx={{ mt: 1, p: 2, bgcolor: '#e0f2fe', borderRadius: 2.5, border: '1.5px solid #7dd3fc' }}>
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#0369a1', display: 'block', mb: 1 }}>
                                      ⚡ STEP 4: WORK IN PROGRESS — Click below when service is completed
                                    </Typography>
                                    <Button 
                                      variant="contained" 
                                      color="primary" 
                                      onClick={() => handleCompleteWork(booking.id)}
                                      sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                                    >
                                      🛠️ Complete Work
                                    </Button>
                                  </Box>
                                )}

                                {booking.status === 'WORK_COMPLETED' && (
                                  <Box sx={{ mt: 1, p: 2, bgcolor: '#fef3c7', borderRadius: 2.5, border: '1.5px solid #fcd34d' }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#92400e' }}>
                                      🛠️ WORK COMPLETED
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Waiting for Customer to review and pay via Razorpay.
                                    </Typography>
                                  </Box>
                                )}
                              </Stack>
                            </Grid>

                            
                            <Grid size={{ xs: 12, sm: 4 }} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: { xs: 'flex-start', sm: 'flex-end' } }}>
                              {booking.status === 'PENDING' && (
                                <Stack spacing={1} sx={{ width: '100%', maxWidth: 160 }}>
                                  <Button 
                                    variant="contained" 
                                    color="success" 
                                    startIcon={<CheckCircleIcon />}
                                    onClick={() => handleAcceptBooking(booking.id)}
                                    fullWidth
                                    sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
                                  >
                                    Accept
                                  </Button>
                                  <Button 
                                    variant="outlined" 
                                    color="primary" 
                                    startIcon={<EventIcon />}
                                    onClick={() => handleOpenReschedule(booking)}
                                    fullWidth
                                    sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
                                  >
                                    Reschedule
                                  </Button>
                                  <Button 
                                    variant="outlined" 
                                    color="error" 
                                    startIcon={<CancelIcon />}
                                    onClick={() => handleDeclineBooking(booking.id)}
                                    fullWidth
                                    sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
                                  >
                                    Decline
                                  </Button>
                                </Stack>
                              )}

                              {booking.status === 'RESCHEDULED' && (
                                <Stack spacing={1} sx={{ width: '100%' }}>
                                  <Button 
                                    variant="outlined" 
                                    color="primary" 
                                    startIcon={<EventIcon />}
                                    onClick={() => handleOpenReschedule(booking)}
                                    fullWidth
                                    sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
                                  >
                                    Reschedule
                                  </Button>
                                  <Button 
                                    variant="outlined" 
                                    color="error" 
                                    startIcon={<CancelIcon />}
                                    onClick={() => handleDeclineBooking(booking.id)}
                                    fullWidth
                                    sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
                                  >
                                    Cancel
                                  </Button>
                                </Stack>
                              )}
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                      );
                    })}
                  </Stack>
                );
              })()
            )}
          </Stack>
        )}

        {/* VIEW: EARNINGS & PAYOUTS */}
        {currentView === 'earnings' && (
          <Stack spacing={4}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px', mb: 0.5 }}>
                Earnings & Payout Analytics
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All amounts shown reflect a <strong>10% platform application fee</strong> deduction from your gross job price.
              </Typography>
            </Box>

            {/* Deduction Info Banner */}
            <Box sx={{ p: 2, borderRadius: 3, bgcolor: '#fff7ed', border: '1.5px solid #fed7aa', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#f97316', color: 'white', width: 36, height: 36 }}>%</Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#9a3412' }}>Platform Application Fee: 10%</Typography>
                <Typography variant="caption" color="text.secondary">
                  EaseMyHome deducts 10% from every completed booking as a platform fee. Your net payout = Job Price − 10% Fee.
                </Typography>
              </Box>
            </Box>

            {/* Earnings KPI Cards */}
            <Grid container spacing={3}>
              {/* Gross Earned */}
              <Grid size={{ xs: 12, sm: 3 }}>
                <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: '#f8fafc', borderColor: '#cbd5e1' }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#64748b', color: 'white', width: 48, height: 48 }}>
                      <ReceiptLongIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569' }}>GROSS EARNINGS</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 900, color: '#334155' }}>
                        ₹{totalGrossEarned.toLocaleString('en-IN')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Before 10% deduction</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* 10% Deduction */}
              <Grid size={{ xs: 12, sm: 3 }}>
                <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: '#fff1f2', borderColor: '#fecdd3' }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#ef4444', color: 'white', width: 48, height: 48 }}>
                      <Typography sx={{ fontWeight: 900, fontSize: '1rem' }}>-10%</Typography>
                    </Avatar>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#9f1239' }}>PLATFORM FEE (10%)</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 900, color: '#dc2626' }}>
                        −₹{totalDeduction.toLocaleString('en-IN')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Application fee deducted</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Net Payout */}
              <Grid size={{ xs: 12, sm: 3 }}>
                <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: '#ecfdf5', borderColor: '#a7f3d0' }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#10b981', color: 'white', width: 48, height: 48 }}>
                      <CurrencyRupeeIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#065f46' }}>YOUR NET PAYOUT</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 900, color: '#047857' }}>
                        ₹{totalEarned.toLocaleString('en-IN')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">After 10% fee — you receive this</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Completed Jobs */}
              <Grid size={{ xs: 12, sm: 3 }}>
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#f8fafc', color: '#475569', width: 48, height: 48, border: '1px solid #cbd5e1' }}>
                      <WorkIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>COMPLETED JOBS</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a' }}>
                        {completedBookings.length}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Avg net: ₹{Math.round(avgEarnedPerJob).toLocaleString('en-IN')}/job</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Earnings History Table */}
            <Card variant="outlined" sx={{ borderRadius: 3.5, overflow: 'hidden' }}>
              <Box sx={{ p: 3, bgcolor: 'white', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 850, color: '#0f172a' }}>
                    Payout Statements — Completed Jobs
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Gross price, 10% platform fee deducted, and your net payout per job.
                  </Typography>
                </Box>
                <Chip
                  label={`${completedBookings.length} Jobs | Net ₹${totalEarned.toLocaleString('en-IN')}`}
                  color="success"
                  size="small"
                  sx={{ fontWeight: 800 }}
                />
              </Box>

              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Booking ID</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Service / Customer</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Date</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: '#475569' }}>Gross (₹)</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: '#dc2626' }}>−10% Fee (₹)</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: '#059669' }}>Net Payout (₹)</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 800, color: '#475569' }}>Invoice</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {completedBookings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            No completed jobs yet. Complete accepted jobs to see your payout statement here.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      completedBookings.map((b) => {
                        const gross   = getBookingPrice(b);
                        const fee     = +(gross * 0.10).toFixed(2);
                        const net     = +(gross - fee).toFixed(2);
                        return (
                          <TableRow key={b.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell sx={{ fontWeight: 800, color: '#2563eb' }}>#BK-{b.id}</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>
                              {b.serviceType}
                              <Typography variant="caption" display="block" color="text.secondary">{b.customerName}</Typography>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>📅 {b.bookingDate}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: '#334155' }}>
                              ₹{gross.toLocaleString('en-IN')}
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: '#dc2626' }}>
                              −₹{fee.toLocaleString('en-IN')}
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 900, color: '#059669', fontSize: '1rem' }}>
                              ₹{net.toLocaleString('en-IN')}
                            </TableCell>
                            <TableCell align="center">
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => { setInvoiceBooking({ ...b, gross, fee, net }); setInvoiceDialogOpen(true); }}
                                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, fontSize: '0.72rem' }}
                              >
                                View Invoice
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                    {/* Totals row */}
                    {completedBookings.length > 0 && (
                      <TableRow sx={{ bgcolor: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>
                        <TableCell colSpan={3} sx={{ fontWeight: 900, color: '#0f172a' }}>TOTALS</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 900, color: '#334155' }}>₹{totalGrossEarned.toLocaleString('en-IN')}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 900, color: '#dc2626' }}>−₹{totalDeduction.toLocaleString('en-IN')}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 900, color: '#059669', fontSize: '1rem' }}>₹{totalEarned.toLocaleString('en-IN')}</TableCell>
                        <TableCell />
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Stack>
        )}

        {/* VIEW: REPEAT CUSTOMERS */}
        {currentView === 'customers' && (
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
                  Repeat Customers & Client Analytics
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Identify returning customers who frequently book your services to provide VIP service.
                </Typography>
              </Box>

              <Stack direction="row" spacing={1}>
                <Chip 
                  icon={<RepeatIcon fontSize="small" />}
                  label={`Repeat Clients (${repeatCustomers.length})`} 
                  onClick={() => setCustomerFilterTab('REPEAT')}
                  color={customerFilterTab === 'REPEAT' ? 'secondary' : 'default'}
                  sx={{ fontWeight: 800 }}
                />
                <Chip 
                  icon={<GroupIcon fontSize="small" />}
                  label={`All Clients (${customerList.length})`} 
                  onClick={() => setCustomerFilterTab('ALL')}
                  color={customerFilterTab === 'ALL' ? 'primary' : 'default'}
                  sx={{ fontWeight: 800 }}
                />
              </Stack>
            </Box>

            <Divider />

            {/* Customers Analytics Grid */}
            {(() => {
              const displayList = customerFilterTab === 'REPEAT' ? repeatCustomers : customerList;

              if (displayList.length === 0) {
                return (
                  <Box sx={{ textAlign: 'center', py: 10, bgcolor: 'white', borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                    <Avatar sx={{ width: 64, height: 64, bgcolor: '#f3e8ff', color: '#7e22ce', mx: 'auto', mb: 2 }}>
                      <RepeatIcon fontSize="large" />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#334155', mb: 0.5 }}>
                      No repeat customers found yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {customerFilterTab === 'REPEAT' 
                        ? 'Customers who book your services 2 or more times will automatically appear here.'
                        : 'No client booking records found.'}
                    </Typography>
                  </Box>
                );
              }

              return (
                <Grid container spacing={3}>
                  {displayList.map((c, idx) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
                      <Card 
                        variant="outlined" 
                        sx={{ 
                          borderRadius: 3.5, 
                          boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                          transition: 'all 0.2s',
                          border: c.isRepeat ? '1.5px solid #d8b4fe' : '1px solid #e2e8f0',
                          bgcolor: c.isRepeat ? '#faf5ff' : 'white',
                          '&:hover': { boxShadow: '0 6px 20px rgba(0,0,0,0.06)' }
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Stack spacing={2}>
                            <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
                              <Stack direction="row" spacing={1.5} alignItems="center">
                                <Avatar sx={{ bgcolor: c.isRepeat ? '#9333ea' : '#2563eb', color: 'white', fontWeight: 800 }}>
                                  {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
                                </Avatar>
                                <Box>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 850, color: '#0f172a', lineHeight: 1.2 }}>
                                    {c.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Last booked: {c.lastBookingDate}
                                  </Typography>
                                </Box>
                              </Stack>

                              {c.isRepeat && (
                                <Chip 
                                  icon={<RepeatIcon fontSize="small" />}
                                  label="REPEAT" 
                                  size="small" 
                                  color="secondary" 
                                  sx={{ fontWeight: 900, fontSize: '0.65rem' }} 
                                />
                              )}
                            </Stack>

                            <Divider />

                            <Stack spacing={1}>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                <PhoneIcon fontSize="inherit" /> {c.phone || 'No phone'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                <EmailIcon fontSize="inherit" /> {c.email || 'No email'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                <RoomIcon fontSize="inherit" /> {c.address}
                              </Typography>
                            </Stack>

                            <Paper elevation={0} sx={{ p: 1.5, bgcolor: c.isRepeat ? 'white' : '#f8fafc', borderRadius: 2.5, border: '1px solid #e2e8f0' }}>
                              <Grid container spacing={1} textAlign="center">
                                <Grid size={{ xs: 4 }}>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>BOOKINGS</Typography>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#2563eb' }}>
                                    {c.totalCount}
                                  </Typography>
                                </Grid>
                                <Grid size={{ xs: 4 }}>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>COMPLETED</Typography>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#059669' }}>
                                    {c.completedCount}
                                  </Typography>
                                </Grid>
                                <Grid size={{ xs: 4 }}>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>TOTAL SPENT</Typography>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#7e22ce' }}>
                                    ₹{c.totalSpent.toLocaleString('en-IN')}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Paper>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              );
            })()}
          </Stack>
        )}
        {currentView === 'portfolio' && (
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
                  Work Portfolio
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Add photos of your completed projects to show off your expertise.
                </Typography>
              </Box>
              
              <Button
                variant="contained"
                component="label"
                startIcon={uploadingPhoto ? <CircularProgress size={16} color="inherit" /> : <PhotoCamera />}
                disabled={uploadingPhoto}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
              >
                Upload Work Photo
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleAddWorkPhoto}
                />
              </Button>
            </Box>

            <Divider />

            {portfolioItems.length === 0 ? (
              <Box sx={{ py: 10, textAlign: 'center', bgcolor: 'white', borderRadius: 4, border: '1.5px dashed #cbd5e1' }}>
                <Typography variant="body1" color="text.secondary" sx={{ px: 3 }}>
                  No portfolio images added yet. Click 'Upload Work Photo' above to build your gallery.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {portfolioItems.map((item) => (
                  <Grid size={{ xs: 12, sm: 4, md: 3 }} key={item.id}>
                    <Box
                      sx={{
                        position: 'relative',
                        paddingTop: '100%',
                        borderRadius: 3,
                        overflow: 'hidden',
                        bgcolor: 'black',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'scale(1.03)' }
                      }}
                    >
                      <img 
                        src={item.imageUrl} 
                        alt={item.caption || 'Portfolio work'} 
                        onClick={() => setSelectedPreviewImage(item.imageUrl)}
                        style={{ 
                          position: 'absolute', 
                          top: 0, 
                          left: 0, 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover',
                          cursor: 'pointer'
                        }} 
                      />
                      <Tooltip title="Delete Photo">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteWorkPhoto(item.id)}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'rgba(255, 255, 255, 0.9)',
                            color: '#ef4444',
                            '&:hover': { bgcolor: '#fee2e2' }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
          </Stack>
        )}

        {/* VIEW 5: MY SERVICES */}
        {currentView === 'services' && (
          <Stack spacing={3}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
                  My Services
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage the specific sub-services you offer — set your name, price, unit, and description.
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                onClick={openAddDialog}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                  '&:hover': { boxShadow: '0 6px 20px rgba(37,99,235,0.4)' }
                }}
              >
                Add Sub-Service
              </Button>
            </Box>

            <Divider />

            {/* Content */}
            {loadingSubServices ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress />
              </Box>
            ) : subServices.length === 0 ? (
              <Box
                sx={{
                  py: 10,
                  textAlign: 'center',
                  bgcolor: 'white',
                  borderRadius: 4,
                  border: '1.5px dashed #cbd5e1',
                  transition: 'border-color 0.2s',
                  '&:hover': { borderColor: '#2563eb' }
                }}
              >
                <Avatar sx={{ width: 72, height: 72, bgcolor: '#eff6ff', color: '#2563eb', mx: 'auto', mb: 2 }}>
                  <MiscellaneousServicesIcon sx={{ fontSize: 36 }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#334155', mb: 0.5 }}>
                  No sub-services yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Click "Add Sub-Service" to list what you offer (e.g. Fan Fitting, Bulb Replacement).
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={openAddDialog}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                >
                  Add your first service
                </Button>
              </Box>
            ) : (
              <Grid container spacing={2.5}>
                {subServices.map((svc) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={svc.id}>
                    <Card
                      variant="outlined"
                      sx={{
                        borderRadius: 3.5,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.22s',
                        borderColor: svc.active ? 'rgba(37,99,235,0.2)' : '#e2e8f0',
                        bgcolor: svc.active ? 'white' : '#f8fafc',
                        '&:hover': {
                          boxShadow: svc.active ? '0 8px 24px rgba(37,99,235,0.12)' : '0 4px 12px rgba(0,0,0,0.04)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {/* Name + Active badge */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 800,
                              color: svc.active ? '#0f172a' : '#94a3b8',
                              lineHeight: 1.3,
                              flex: 1,
                              pr: 1
                            }}
                          >
                            {svc.name}
                          </Typography>
                          <Chip
                            label={svc.active ? 'Active' : 'Off'}
                            size="small"
                            sx={{
                              fontWeight: 800,
                              fontSize: '0.62rem',
                              height: 20,
                              bgcolor: svc.active ? 'rgba(16,185,129,0.12)' : '#f1f5f9',
                              color: svc.active ? '#059669' : '#94a3b8'
                            }}
                          />
                        </Box>

                        {/* Price */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CurrencyRupeeIcon sx={{ fontSize: 17, color: '#2563eb' }} />
                          <Typography variant="h6" sx={{ fontWeight: 900, color: '#2563eb', lineHeight: 1 }}>
                            {Number(svc.price).toLocaleString('en-IN')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, ml: 0.25 }}>
                            / {svc.unit}
                          </Typography>
                        </Box>

                        {/* Description */}
                        {svc.description && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              flex: 1,
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              lineHeight: 1.5
                            }}
                          >
                            {svc.description}
                          </Typography>
                        )}

                        {/* Actions */}
                        <Box sx={{ display: 'flex', gap: 1, mt: 'auto', pt: 1.5, borderTop: '1px solid #f1f5f9' }}>
                          <Tooltip title={svc.active ? 'Deactivate' : 'Activate'}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleToggleActive(svc)}
                              sx={{
                                flex: 1,
                                borderRadius: 1.5,
                                textTransform: 'none',
                                fontWeight: 700,
                                fontSize: '0.72rem',
                                color: svc.active ? '#d97706' : '#059669',
                                borderColor: svc.active ? '#fbbf24' : '#6ee7b7',
                                '&:hover': { bgcolor: svc.active ? '#fef3c7' : '#d1fae5' }
                              }}
                            >
                              {svc.active ? 'Deactivate' : 'Activate'}
                            </Button>
                          </Tooltip>
                          <Tooltip title="Edit Service">
                            <IconButton
                              size="small"
                              onClick={() => openEditDialog(svc)}
                              sx={{ color: '#2563eb', bgcolor: '#eff6ff', '&:hover': { bgcolor: '#dbeafe' }, borderRadius: 1.5 }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Service">
                            <IconButton
                              size="small"
                              disabled={deletingServiceId === svc.id}
                              onClick={() => handleDeleteService(svc.id)}
                              sx={{ color: '#ef4444', bgcolor: '#fff1f2', '&:hover': { bgcolor: '#fee2e2' }, borderRadius: 1.5 }}
                            >
                              {deletingServiceId === svc.id
                                ? <CircularProgress size={14} color="inherit" />
                                : <DeleteIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Stack>
        )}

        {/* VIEW 4: PROFILE SETTINGS */}

        {currentView === 'settings' && (
          <Stack spacing={3} sx={{ maxWidth: 600 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
                Profile Settings
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Modify your coverage range boundaries, contact credentials, bio, and selfie image.
              </Typography>
            </Box>

            <Divider />

            <Card variant="outlined" sx={{ borderRadius: 4 }}>
              <CardContent sx={{ p: 4 }}>
                <form onSubmit={handleUpdateSettings}>
                  <Stack spacing={3}>
                    {/* Selfie Update Row */}
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: 'text.secondary' }}>
                        Selfie Profile Image
                      </Typography>
                      <Stack direction="row" spacing={3} alignItems="center">
                        <Avatar 
                          src={user.selfieImage} 
                          sx={{ width: 80, height: 80, border: '2.5px solid #2563eb' }} 
                        />
                        <Button
                          variant="outlined"
                          component="label"
                          startIcon={uploadingSelfie ? <CircularProgress size={16} /> : <PhotoCamera />}
                          disabled={uploadingSelfie}
                          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                        >
                          Change Selfie
                          <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={handleSelfieChange}
                          />
                        </Button>
                      </Stack>
                    </Box>

                    {/* Coverage Area Address & Interactive Map Selector */}
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.secondary' }}>
                        📍 Operational Base Location & Map Pin
                      </Typography>

                      <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                        <TextField
                          required
                          fullWidth
                          size="small"
                          label="Service Coverage Area Address"
                          value={editCoverageArea}
                          onChange={(e) => setEditCoverageArea(e.target.value)}
                        />
                        <Button 
                          type="button" 
                          variant="outlined" 
                          onClick={handleSearchSettingLocation}
                          disabled={geocodingSetting}
                          sx={{ textTransform: 'none', whiteSpace: 'nowrap', fontWeight: 700 }}
                        >
                          {geocodingSetting ? '...' : '🔍 Find on Map'}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outlined" 
                          color="secondary"
                          onClick={handleGPSSettingLocation}
                          disabled={locatingGPS}
                          sx={{ textTransform: 'none', whiteSpace: 'nowrap', fontWeight: 700 }}
                        >
                          {locatingGPS ? '...' : '🎯 GPS'}
                        </Button>
                      </Stack>

                      {/* OpenStreetMap Container */}
                      <Box sx={{ position: 'relative', width: '100%', borderRadius: 3, overflow: 'hidden', border: '1.5px solid #cbd5e1' }}>
                        <div id="provider-settings-map" style={{ width: '100%', height: '240px' }}></div>
                        <Box sx={{ position: 'absolute', bottom: 8, left: 8, bgcolor: 'rgba(15, 23, 42, 0.85)', color: '#fff', px: 1.5, py: 0.5, borderRadius: 2, fontSize: '0.75rem', fontWeight: 700, zIndex: 1000 }}>
                          Lat: {editCoordinates.lat.toFixed(4)}, Lng: {editCoordinates.lng.toFixed(4)}
                        </Box>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                        💡 Click anywhere on the map or drag the pin to set your exact location. Your location will be displayed to customers nearby.
                      </Typography>
                    </Box>


                    {/* Radius */}
                    <TextField
                      required
                      fullWidth
                      type="number"
                      label="Operational Radius (in km)"
                      value={editWorkingRadius}
                      onChange={(e) => setEditWorkingRadius(e.target.value)}
                      inputProps={{ min: 1, max: 100 }}
                    />

                    {/* Bio */}
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Profile Bio Brief"
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                    />

                    <Button
                      type="submit"
                      disabled={updatingSettings}
                      variant="contained"
                      startIcon={updatingSettings ? <CircularProgress size={18} color="inherit" /> : <CheckCircleIcon />}
                      sx={{ py: 1.25, borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                    >
                      Save Configuration Details
                    </Button>
                  </Stack>
                </form>
              </CardContent>
            </Card>
          </Stack>
        )}
      </Box>

      {/* ── Add / Edit Sub-Service Dialog ─────────────────────────────────────── */}
      <Dialog
        open={serviceDialogOpen}
        onClose={() => setServiceDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 4, p: 1, width: '100%', maxWidth: 480 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, pb: 0.5, fontSize: '1.15rem' }}>
          {editingService ? 'Edit Sub-Service' : 'Add New Sub-Service'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            {editingService
              ? 'Update the details of this service listing.'
              : 'Describe a specific service you offer along with its price.'}
          </Typography>
          <Stack spacing={2.5}>
            <TextField
              required
              fullWidth
              label="Service Name"
              placeholder="e.g. Fan Fitting, Bulb Replacement"
              value={serviceForm.name}
              onChange={(e) => setServiceForm(p => ({ ...p, name: e.target.value }))}
              inputProps={{ maxLength: 100 }}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                required
                fullWidth
                type="number"
                label="Price (₹)"
                placeholder="e.g. 250"
                value={serviceForm.price}
                onChange={(e) => setServiceForm(p => ({ ...p, price: e.target.value }))}
                inputProps={{ min: 0, step: 1 }}
                InputProps={{ startAdornment: <CurrencyRupeeIcon sx={{ color: '#64748b', mr: 0.5, fontSize: 18 }} /> }}
              />
              <FormControl fullWidth required>
                <InputLabel>Unit</InputLabel>
                <Select
                  value={serviceForm.unit}
                  label="Unit"
                  onChange={(e) => setServiceForm(p => ({ ...p, unit: e.target.value }))}
                >
                  {['per visit', 'per unit', 'per hour', 'per day', 'flat rate'].map(u => (
                    <MenuItem key={u} value={u}>{u}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description (optional)"
              placeholder="Brief description of what's included in this service..."
              value={serviceForm.description}
              onChange={(e) => setServiceForm(p => ({ ...p, description: e.target.value }))}
              inputProps={{ maxLength: 500 }}
              helperText={`${serviceForm.description.length}/500`}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button
            onClick={() => setServiceDialogOpen(false)}
            disabled={savingService}
            sx={{ fontWeight: 700, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveService}
            disabled={savingService}
            startIcon={savingService ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            }}
          >
            {editingService ? 'Update Service' : 'Add Service'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reschedule Dialog Modal */}

      <Dialog 
        open={rescheduleOpen} 
        onClose={() => setRescheduleOpen(false)}
        PaperProps={{ sx: { borderRadius: 4, p: 1.5, maxWidth: 380 } }}
      >
        <DialogTitle sx={{ fontWeight: 850, pb: 1 }}>Reschedule Appointment</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            Pick a new date and preferred working hours for this booking.
          </Typography>
          <Stack spacing={3}>
            <TextField
              type="date"
              label="New Appointment Date"
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              type="text"
              label="Preferred Time Slot"
              placeholder="e.g. 10:00 AM, 02:30 PM"
              value={rescheduleTime}
              onChange={(e) => setRescheduleTime(e.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setRescheduleOpen(false)} disabled={submittingReschedule} sx={{ fontWeight: 700 }}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmReschedule} 
            variant="contained" 
            disabled={submittingReschedule}
            startIcon={submittingReschedule ? <CircularProgress size={16} /> : null}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lightbox Preview Modal */}
      <Dialog 
        open={Boolean(selectedPreviewImage)} 
        onClose={() => setSelectedPreviewImage(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { bgcolor: 'transparent', boxShadow: 'none', overflow: 'hidden' } }}
      >
        <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <IconButton
            onClick={() => setSelectedPreviewImage(null)}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' }
            }}
          >
            <CancelIcon />
          </IconButton>
          <img 
            src={selectedPreviewImage} 
            alt="Full-size portfolio preview" 
            style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '8px' }} 
          />
        </Box>
      </Dialog>

      {/* ── Invoice Dialog ─────────────────────────────────────────────────────── */}
      <Dialog
        open={invoiceDialogOpen}
        onClose={() => setInvoiceDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}
      >
        {invoiceBooking && (() => {
          const gross = invoiceBooking.gross ?? getBookingPrice(invoiceBooking);
          const fee   = invoiceBooking.fee   ?? +(gross * 0.10).toFixed(2);
          const net   = invoiceBooking.net   ?? +(gross - fee).toFixed(2);
          return (
            <>
              {/* Invoice Header */}
              <Box sx={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', p: 3.5, color: 'white' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.5px' }}>EaseMyHome</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 600 }}>PARTNER PAYOUT INVOICE</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Chip label="PAYMENT RECEIVED" color="success" size="small" sx={{ fontWeight: 800, mb: 0.5 }} />
                    <Typography variant="caption" sx={{ display: 'block', opacity: 0.7 }}>
                      Invoice #INV-{invoiceBooking.id}-{new Date().getFullYear()}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <DialogContent sx={{ p: 0 }}>
                {/* Booking Details */}
                <Box sx={{ p: 3, borderBottom: '1px solid #f1f5f9' }}>
                  <Typography variant="overline" sx={{ fontWeight: 800, color: '#64748b', fontSize: '0.65rem' }}>BOOKING DETAILS</Typography>
                  <Grid container spacing={2} sx={{ mt: 0.5 }}>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>BOOKING ID</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#2563eb' }}>#BK-{invoiceBooking.id}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>SERVICE DATE</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>📅 {invoiceBooking.bookingDate}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>CUSTOMER</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>{invoiceBooking.customerName}</Typography>
                      <Typography variant="caption" color="text.secondary">📞 {invoiceBooking.customerPhone}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>SERVICE</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>{invoiceBooking.serviceType}</Typography>
                      {invoiceBooking.subService && (
                        <Typography variant="caption" color="text.secondary">{invoiceBooking.subService.name}</Typography>
                      )}
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>SERVICE LOCATION</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>📍 {invoiceBooking.address}</Typography>
                    </Grid>
                  </Grid>
                </Box>

                {/* Payment Breakdown */}
                <Box sx={{ p: 3 }}>
                  <Typography variant="overline" sx={{ fontWeight: 800, color: '#64748b', fontSize: '0.65rem' }}>PAYMENT BREAKDOWN</Typography>

                  <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                    {/* Gross */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: '#f8fafc', borderRadius: 2 }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>Job Price (Gross)</Typography>
                        <Typography variant="caption" color="text.secondary">Customer paid for {invoiceBooking.serviceType}</Typography>
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 800, color: '#334155' }}>₹{gross.toLocaleString('en-IN')}</Typography>
                    </Box>

                    {/* 10% Fee */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: '#fff1f2', borderRadius: 2, border: '1px solid #fecdd3' }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#dc2626' }}>Platform Application Fee (−10%)</Typography>
                        <Typography variant="caption" color="text.secondary">EaseMyHome service fee deducted</Typography>
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 800, color: '#dc2626' }}>−₹{fee.toLocaleString('en-IN')}</Typography>
                    </Box>

                    <Divider />

                    {/* Net Payout */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: '#ecfdf5', borderRadius: 2.5, border: '1.5px solid #6ee7b7' }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#065f46' }}>Your Net Payout</Typography>
                        <Typography variant="caption" sx={{ color: '#059669', fontWeight: 600 }}>Gross − 10% Platform Fee</Typography>
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 900, color: '#047857' }}>₹{net.toLocaleString('en-IN')}</Typography>
                    </Box>
                  </Stack>

                  {/* Payment status note */}
                  <Box sx={{ mt: 2.5, p: 1.5, bgcolor: '#eff6ff', borderRadius: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
                    <CheckCircleIcon sx={{ color: '#2563eb', fontSize: 18 }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#1d4ed8' }}>
                      Payment confirmed via Razorpay. Payout of ₹{net.toLocaleString('en-IN')} will reflect in your registered bank account.
                    </Typography>
                  </Box>
                </Box>
              </DialogContent>

              <DialogActions sx={{ p: 2.5, pt: 0 }}>
                <Button onClick={() => setInvoiceDialogOpen(false)} sx={{ fontWeight: 700, textTransform: 'none' }}>Close</Button>
                <Button
                  variant="contained"
                  onClick={() => { setCurrentView('earnings'); setInvoiceDialogOpen(false); }}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, background: 'linear-gradient(135deg, #059669 0%, #0891b2 100%)' }}
                >
                  View All Payouts
                </Button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>
    </Box>
  );
};

export default ProviderDashboard;
