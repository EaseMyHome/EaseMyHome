import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import themeReducer from './common/themeSlice';
import dataReducer from './common/dataSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    data: dataReducer,
  },
});

export default store;
