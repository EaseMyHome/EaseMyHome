import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, CircularProgress } from '@mui/material';

// Layouts
import AdminLayout from '../layouts/AdminLayout';
import AuthLayout from '../layouts/AuthLayout';

// Loading Placeholder
const PageLoader = () => (
  <Box sx={{ display: 'flex', minHeight: '80vh', alignItems: 'center', justifyContent: 'center' }}>
    <CircularProgress size={50} thickness={4} />
  </Box>
);

// ─── Lazy Pages ─────────────────────────────────────────────────────────────

// Public / Customer Pages
const CustomerHome        = lazy(() => import('../pages/user/Home/Home'));
const CustomerAuth        = lazy(() => import('../pages/auth/Auth'));

// User Pages
const UserDashboard       = lazy(() => import('../pages/user/UserDashboard/UserDashboard'));
const LocationPicker      = lazy(() => import('../pages/user/LocationPicker/LocationPicker'));

// Provider Pages
const ProviderUnderReview = lazy(() => import('../pages/provider/ProviderUnderReview/ProviderUnderReview'));
const ProviderSetupProfile = lazy(() => import('../pages/provider/ProviderSetupProfile/ProviderSetupProfile'));
const ProviderDashboard   = lazy(() => import('../pages/provider/ProviderDashboard/ProviderDashboard'));

// Admin Auth Pages
const UnifiedLogin          = lazy(() => import('../pages/auth/UnifiedLogin'));
const Login               = lazy(() => import('../pages/auth/Login'));
const ForgotPassword      = lazy(() => import('../pages/auth/ForgotPassword'));
const ResetPassword       = lazy(() => import('../pages/auth/ResetPassword'));

// Admin Dashboard Pages
const Dashboard           = lazy(() => import('../pages/admin/Dashboard/Dashboard'));
const Customers           = lazy(() => import('../pages/admin/Customers/Customers'));
const Providers           = lazy(() => import('../pages/admin/Providers/Providers'));
const ProviderVerification = lazy(() => import('../pages/admin/Providers/ProviderVerification'));
const Categories          = lazy(() => import('../pages/admin/Categories/Categories'));
const Services            = lazy(() => import('../pages/admin/Services/Services'));
const Bookings            = lazy(() => import('../pages/admin/Bookings/Bookings'));
const Reviews             = lazy(() => import('../pages/admin/Reviews/Reviews'));
const Complaints          = lazy(() => import('../pages/admin/Complaints/Complaints'));
const Offers              = lazy(() => import('../pages/admin/Offers/Offers'));
const Banners             = lazy(() => import('../pages/admin/Banners/Banners'));
const Notifications       = lazy(() => import('../pages/admin/Notifications/Notifications'));
const Locations           = lazy(() => import('../pages/admin/Locations/Locations'));
const Reports             = lazy(() => import('../pages/admin/Reports/Reports'));
const Admins              = lazy(() => import('../pages/admin/Admins/Admins'));
const AuditLogs           = lazy(() => import('../pages/admin/AuditLogs/AuditLogs'));
const Settings            = lazy(() => import('../pages/admin/Settings/Settings'));

// ─── Route Guard Helpers ─────────────────────────────────────────────────────

// ─── Route Guard Helpers ─────────────────────────────────────────────────────

/**
 * Determines the default dashboard redirect path for an authenticated user based on role & status.
 */
const getDashboardRedirect = (role, user) => {
  if (role === 'admin') {
    return '/admin/dashboard';
  }
  if (role === 'provider') {
    const status = user?.status;
    if (status === 'Active') {
      const hasProfile = user?.coverageArea && user?.workingRadius > 0;
      return hasProfile ? '/provider/dashboard' : '/provider/setup-profile';
    }
    return '/provider/under-review';
  }
  if (role === 'user') {
    const userEmail = user?.email || '';
    const perUserKey = userEmail ? `user_location_${userEmail}` : null;
    const savedLocation = perUserKey ? localStorage.getItem(perUserKey) : null;
    const hasAddress = savedLocation && (() => {
      try { return !!JSON.parse(savedLocation)?.address; } catch { return false; }
    })();
    return hasAddress ? '/user/dashboard' : '/user/select-location';
  }
  return null;
};

/**
 * Root route guard:
 * Show public CustomerHome ONLY if no user is logged in.
 * If logged in, redirect directly to their dashboard.
 */
const RootRouteGuard = () => {
  const { isAuthenticated, role, user } = useSelector((state) => state.auth);
  if (isAuthenticated) {
    const redirectPath = getDashboardRedirect(role, user);
    if (redirectPath) return <Navigate to={redirectPath} replace />;
  }
  return <CustomerHome />;
};

/**
 * Redirects ANY logged-in user away from public auth/login pages to their correct destination.
 */
const RedirectIfAuthenticated = ({ children }) => {
  const { isAuthenticated, role, user } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    const redirectPath = getDashboardRedirect(role, user);
    if (redirectPath) return <Navigate to={redirectPath} replace />;
  }
  return children;
};

/**
 * Protects a route so only authenticated users with the correct role can access it.
 */
const ProtectedRoute = ({ requiredRole, loginPath, children }) => {
  const { isAuthenticated, role } = useSelector((state) => state.auth);
  if (!isAuthenticated || role !== requiredRole) {
    return <Navigate to={loginPath} replace />;
  }
  return children;
};

const ProviderDashboardRoute = ({ children }) => {
  const { isAuthenticated, role, user } = useSelector((state) => state.auth);

  if (!isAuthenticated || role !== 'provider') {
    return <Navigate to="/login" replace />;
  }

  const status = user?.status;

  if (status === 'Active') {
    const hasProfile = user?.coverageArea && user?.workingRadius > 0;
    if (!hasProfile) {
      return <Navigate to="/provider/setup-profile" replace />;
    }
    return children;
  }

  return <Navigate to="/provider/under-review" replace />;
};

// LocationPicker is used directly — no guard needed.
// The Edit button on the dashboard navigates here freely to allow address changes.

// ─── AppRoutes ───────────────────────────────────────────────────────────────

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>

        {/* ── 1. HOME – Public Landing Page (only if unauthenticated) ────── */}
        <Route path="/" element={<RootRouteGuard />} />

        {/* ── UNIFIED SINGLE LOGIN PAGE (Customer | Provider | Admin) ── */}
        <Route
          path="/login"
          element={
            <RedirectIfAuthenticated>
              <UnifiedLogin />
            </RedirectIfAuthenticated>
          }
        />

        {/* ── FORGOT PASSWORD PAGE ── */}
        <Route
          path="/forgot-password"
          element={
            <RedirectIfAuthenticated>
              <ForgotPassword />
            </RedirectIfAuthenticated>
          }
        />

        {/* ── 2. USER AUTH, LOCATION PICKER & DASHBOARD ─────────────────── */}
        <Route
          path="/user/auth"
          element={
            <RedirectIfAuthenticated>
              <CustomerAuth role="user" />
            </RedirectIfAuthenticated>
          }
        />
        <Route
          path="/user/select-location"
          element={
            <ProtectedRoute requiredRole="user" loginPath="/login">
              <LocationPicker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute requiredRole="user" loginPath="/login">
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        {/* ── 3. PROVIDER AUTH & DASHBOARD ─────────────────────────────── */}
        <Route
          path="/provider/auth"
          element={
            <RedirectIfAuthenticated>
              <CustomerAuth role="provider" />
            </RedirectIfAuthenticated>
          }
        />
        <Route
          path="/provider/under-review"
          element={
            <ProtectedRoute requiredRole="provider" loginPath="/login">
              <ProviderUnderReview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/provider/setup-profile"
          element={
            <ProtectedRoute requiredRole="provider" loginPath="/login">
              <ProviderSetupProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/provider/dashboard"
          element={
            <ProviderDashboardRoute>
              <ProviderDashboard />
            </ProviderDashboardRoute>
          }
        />

        {/* ── 4. ADMIN AUTH PAGES ──────────────────────────────────────── */}
        <Route
          path="/admin"
          element={
            <RedirectIfAuthenticated>
              <AuthLayout />
            </RedirectIfAuthenticated>
          }
        >
          <Route index element={<Navigate to="/login" replace />} />
          <Route path="login" element={<UnifiedLogin />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>

        {/* ── 5. ADMIN PROTECTED DASHBOARD ─────────────────────────────── */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="admin" loginPath="/login">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="customers"    element={<Customers />} />
          <Route path="providers"    element={<Providers />} />
          <Route path="verification" element={<ProviderVerification />} />
          <Route path="categories"   element={<Categories />} />
          <Route path="services"     element={<Services />} />
          <Route path="bookings"     element={<Bookings />} />
          <Route path="reviews"      element={<Reviews />} />
          <Route path="complaints"   element={<Complaints />} />
          <Route path="offers"       element={<Offers />} />
          <Route path="banners"      element={<Banners />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="locations"    element={<Locations />} />
          <Route path="reports"      element={<Reports />} />
          <Route path="admins"       element={<Admins />} />
          <Route path="audit-logs"   element={<AuditLogs />} />
          <Route path="settings"     element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
