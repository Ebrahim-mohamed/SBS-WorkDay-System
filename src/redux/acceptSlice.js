// src/redux/acceptSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apii } from './api';

// Async thunk to update status
export const updateStatus = createAsyncThunk(
  'accept/updateStatus',
  async ({ token, userId, days, status }, { rejectWithValue }) => {
    const url = `${apii}api/Sheet/updatestatus`;

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: userId,  // Dynamic userId
          days: days,      // Dynamic days (same as selectedTasks)
          status: status,  // Dynamic status
        }),
      });

      // Check if the response is OK
      if (!response.ok) {
        const errorData = await response.json().catch(() => {
          // If the response body is empty or not JSON, return a fallback message
          return { message: 'Failed to update status: Invalid response from server' };
        });
        return rejectWithValue(errorData.message || 'Failed to update status');
      }

      // Handle successful response and return the data
      const data = await response.json();
      return data;
    } catch (error) {
      // Log the error for debugging purposes
      console.error('Error in updateStatus:', error);
      return rejectWithValue(error.message || 'Failed to connect to the server');
    }
  }
);

// Slice for handling accept updates (similar structure as statusSlice.js)
const acceptSlice = createSlice({
  name: 'accept',
  initialState: {
    status: 'idle',  // Track loading, succeeded, or failed states
    error: null,     // Error message
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(updateStatus.pending, (state) => {
        state.status = 'loading';  // Set to loading when the request is in progress
        state.error = null;        // Reset any previous errors
      })
      .addCase(updateStatus.fulfilled, (state) => {
        state.status = 'succeeded';  // Update to succeeded when the request is successful
        state.error = null;         // Reset error on success
      })
      .addCase(updateStatus.rejected, (state, action) => {
        state.status = 'failed';   // Set to failed when the request fails
        state.error = action.payload;  // Set the error message
      });
  },
});

export default acceptSlice.reducer;
