import { createSlice } from '@reduxjs/toolkit';

// Helper: load persisted auth state from localStorage
const loadAuthState = () => {
  try {
    const token = localStorage.getItem('emh_token');
    const user = JSON.parse(localStorage.getItem('emh_user') || 'null');
    const role = localStorage.getItem('emh_role') || null;
    if (token && user && role) {
      return { token, user, role, isAuthenticated: true };
    }
  } catch (_) {}
  return { token: null, user: null, role: null, isAuthenticated: false };
};

const persisted = loadAuthState();

const initialState = {
  user: persisted.user,
  token: persisted.token,
  role: persisted.role,            // 'admin' | 'provider' | 'user'
  isAuthenticated: persisted.isAuthenticated,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    // action.payload: { user, token, role }
    loginSuccess: (state, action) => {
      const { user, token, role } = action.payload;
      state.loading = false;
      state.isAuthenticated = true;
      state.user = user;
      state.token = token;
      state.role = role;
      localStorage.setItem('emh_token', token);
      localStorage.setItem('emh_user', JSON.stringify(user));
      localStorage.setItem('emh_role', role);

      // Legacy key support – admin panel reads 'adminUser'
      if (role === 'admin') {
        localStorage.setItem('adminUser', JSON.stringify(user));
        localStorage.setItem('token', token);
      }
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('emh_token');
      localStorage.removeItem('emh_user');
      localStorage.removeItem('emh_role');
      // Legacy cleanup
      localStorage.removeItem('token');
      localStorage.removeItem('adminUser');
    },
    updateProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('emh_user', JSON.stringify(state.user));
      if (state.role === 'admin') {
        localStorage.setItem('adminUser', JSON.stringify(state.user));
      }
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, updateProfile, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
