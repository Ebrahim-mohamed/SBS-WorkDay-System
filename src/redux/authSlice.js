import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apii } from './api';

// Selectors for accessing specific parts of the auth state
export const selectUserToken = (state) => state.auth.token;
export const selectUserId = (state) => state.auth.userId;
export const selectUserName = (state) => state.auth.userName;
export const selectUserEmail = (state) => state.auth.email;
export const selectIsManager = (state) => state.auth.isManager;

// Restore initial state from localStorage if available
const initialState = {
  token: localStorage.getItem('token') || null,
  userId: localStorage.getItem('userId') || null,
  userName: localStorage.getItem('userName') || null,
  email: localStorage.getItem('email') || null,
  isManager: JSON.parse(localStorage.getItem('isManager')) || null,
  status: 'idle',
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ username, password }) => {
    const url = `${apii}api/Auth/login`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      const { token, userId, userName, email, isManager } = data.data; // Extracting all needed properties
      return { token, userId, userName, email, isManager };
    } else {
      throw new Error(data.message || 'Login failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.userId = null;
      state.userName = null;
      state.email = null;
      state.isManager = null;
      localStorage.clear(); // Clear all auth data from localStorage
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        const { token, userId, userName, email, isManager } = action.payload;
        state.status = 'succeeded';
        state.token = token;
        state.userId = userId;
        state.userName = userName;
        state.email = email;
        state.isManager = isManager;

        // Store data in localStorage for persistence
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        localStorage.setItem('userName', userName);
        localStorage.setItem('email', email);
        localStorage.setItem('isManager', JSON.stringify(isManager));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
